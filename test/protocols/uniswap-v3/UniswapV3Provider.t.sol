// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";

import "src/Protocols/uniswap-v3/UniswapV3Provider.sol";

interface IERC20Extended {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
}

contract UniswapV3ProviderTest is Test {
    UniswapV3Provider public liquidityProvider;

    // Arbitrum mainnet addresses
    address constant ETH_USDC_POOL = 0xC6962004f452bE9203591991D15f6b388e09E8D0;
    address constant WETH = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
    address constant USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;

    address public user = address(0x123);

    function setUp() public {
        // Fork Arbitrum mainnet
        string memory ARBITRUM_RPC = vm.envString("ARBITRUM_RPC");
        uint256 forkId = vm.createFork(ARBITRUM_RPC);
        vm.selectFork(forkId);

        liquidityProvider = new UniswapV3Provider();

        // Fund user with ETH and USDC
        deal(WETH, user, 10 ether);
        deal(USDC, user, 50000 * 1e6); // 50k USDC

        vm.startPrank(user);
        IERC20Extended(WETH).approve(
            address(liquidityProvider),
            type(uint256).max
        );
        IERC20Extended(USDC).approve(
            address(liquidityProvider),
            type(uint256).max
        );
        vm.stopPrank();
    }

    function testGetCurrentPrice() public {
        IUniswapV3Pool pool = IUniswapV3Pool(ETH_USDC_POOL);
        (uint160 sqrtPriceX96, int24 tick, , , , , ) = pool.slot0();

        console.log("sqrtPriceX96:", sqrtPriceX96);
        console.log("tick:", tick);

        // Use the helper function to get price
        uint256 ethPriceInUsdc = _getCurrentPrice();

        console.log("Price token1/token0 (WETH/USDC):", ethPriceInUsdc);
        console.log("ETH price in USDC:", ethPriceInUsdc);

        // Price should be reasonable (between $500-$10000 for ETH)
        assertTrue(
            ethPriceInUsdc > 500 && ethPriceInUsdc < 10000,
            "ETH price out of reasonable range"
        );
    }

    function testAddLiquidityWithUSDCAmount() public {
        vm.startPrank(user);

        uint256 usdcAmount = 1000 * 1e6; // 1000 USDC
        uint256 wethBalanceBefore = IERC20Extended(WETH).balanceOf(user);
        uint256 usdcBalanceBefore = IERC20Extended(USDC).balanceOf(user);

        console.log("USDC balance before:", usdcBalanceBefore);
        console.log("WETH balance before:", wethBalanceBefore);

        // Add liquidity using USDC amount with automatic price range
        uint256 amount0Max = usdcAmount; // Max USDC
        uint256 amount1Max = 1 ether; // Max WETH

        (uint256 amount0, uint256 amount1) = liquidityProvider
            .addLiquidityWithUSDCAmount(
                ETH_USDC_POOL,
                usdcAmount,
                amount0Max,
                amount1Max
            );

        uint256 wethBalanceAfter = IERC20Extended(WETH).balanceOf(user);
        uint256 usdcBalanceAfter = IERC20Extended(USDC).balanceOf(user);

        console.log("USDC used:", amount0);
        console.log("WETH used:", amount1);
        console.log("USDC balance after:", usdcBalanceAfter);
        console.log("WETH balance after:", wethBalanceAfter);

        // Check actual balance changes
        uint256 usdcUsed = usdcBalanceBefore - usdcBalanceAfter;
        uint256 wethUsed = wethBalanceBefore - wethBalanceAfter;

        console.log("Actual USDC used:", usdcUsed);
        console.log("Actual WETH used:", wethUsed);

        // Verify tokens were spent correctly (amounts might be swapped due to token order)
        assertTrue(
            (usdcUsed == amount0 && wethUsed == amount1) ||
                (usdcUsed == amount1 && wethUsed == amount0),
            "Token amounts don't match balance changes"
        );

        // Verify some liquidity was added
        assertTrue(amount0 > 0 || amount1 > 0, "No liquidity was added");

        // USDC amount should not exceed the target amount
        assertTrue(amount0 <= usdcAmount, "USDC amount exceeds target");

        vm.stopPrank();
    }

    function testSwapUSDCToWETH() public {
        vm.startPrank(user);

        uint256 usdcAmountIn = 4000 * 1e6; // 1000 USDC
        uint256 wethBalanceBefore = IERC20Extended(WETH).balanceOf(user);
        uint256 usdcBalanceBefore = IERC20Extended(USDC).balanceOf(user);

        console.log("USDC balance before swap:", usdcBalanceBefore);
        console.log("WETH balance before swap:", wethBalanceBefore);

        // Set minimum WETH output (with slippage tolerance)
        uint256 amountWETHOutMin = 0.2 ether; // Expect at least 0.2 WETH for 1000 USDC

        // Approve USDC for swap
        IERC20Extended(USDC).approve(address(liquidityProvider), usdcAmountIn);

        // Perform swap
        uint256 amountWETHOut = liquidityProvider.swapUSDCToWETH(
            ETH_USDC_POOL,
            usdcAmountIn,
            amountWETHOutMin
        );

        uint256 wethBalanceAfter = IERC20Extended(WETH).balanceOf(user);
        uint256 usdcBalanceAfter = IERC20Extended(USDC).balanceOf(user);

        console.log(
            "USDC spent:",
            (usdcBalanceBefore - usdcBalanceAfter) / 1e6
        );
        console.log("WETH received (ETH):", amountWETHOut / 1e18);
        console.log("USDC balance after swap:", usdcBalanceAfter / 1e6);
        console.log("WETH balance after swap (ETH):", wethBalanceAfter / 1e18);

        // Verify USDC was spent
        assertEq(
            usdcBalanceBefore - usdcBalanceAfter,
            usdcAmountIn,
            "USDC not properly spent"
        );

        // Verify WETH was received
        assertEq(
            wethBalanceAfter - wethBalanceBefore,
            amountWETHOut,
            "WETH balance mismatch"
        );

        // Verify minimum output was met
        assertTrue(amountWETHOut >= amountWETHOutMin, "Output below minimum");

        // Verify swap actually happened
        assertTrue(amountWETHOut > 0, "No WETH received");
        assertTrue(usdcBalanceAfter < usdcBalanceBefore, "No USDC spent");

        vm.stopPrank();
    }

    function _getCurrentPrice()
        internal
        view
        returns (uint256 wethPriceInUsdc)
    {
        IUniswapV3Pool pool = IUniswapV3Pool(ETH_USDC_POOL);
        (uint160 sqrtPriceX96, , , , , , ) = pool.slot0();

        uint256 sqrtPriceX96Squared = uint256(sqrtPriceX96) *
            uint256(sqrtPriceX96);
        wethPriceInUsdc = (sqrtPriceX96Squared * 1e12) >> 192;
    }

    function _calculateSwapAmountForFullLiquidity(
        uint256 totalUsdcAmount
    )
        internal
        view
        returns (
            uint256 usdcToSwap,
            uint256 usdcForLiquidity,
            uint256 wethForLiquidity
        )
    {
        // Simple 50/50 split by value
        // Half remains as USDC, half gets swapped to WETH
        usdcForLiquidity = totalUsdcAmount / 2;
        usdcToSwap = totalUsdcAmount - usdcForLiquidity;

        // Calculate WETH amount from the swapped USDC
        uint256 wethPriceInUsdc = _getCurrentPrice();
        wethForLiquidity = (usdcToSwap * 1e18) / wethPriceInUsdc;
    }

    // 50% / 50%
    function _calculateOptimalAmounts(
        uint256 totalUsdcAmount
    )
        internal
        view
        returns (
            uint256 usdcForLiquidity,
            uint256 wethNeededForLiquidity,
            uint256 usdcToSwap
        )
    {
        uint256 wethPriceInUsdc = _getCurrentPrice();

        // Current price is always in range due to ±1000 tick range around current tick
        // Calculate proportional amounts using 50/50 split as approximation
        usdcForLiquidity = totalUsdcAmount / 2;
        uint256 usdcValueForWeth = totalUsdcAmount - usdcForLiquidity;
        wethNeededForLiquidity = (usdcValueForWeth * 1e18) / wethPriceInUsdc;
        usdcToSwap = usdcValueForWeth;
    }

    function testSwapAndAddLiquidityOptimal() public {
        vm.startPrank(user);

        uint256 initialUSDC = 1000 * 1e6; // 1000 USDC

        console.log("=== Initial Balances ===");
        console.log(
            "Initial USDC balance:",
            IERC20Extended(USDC).balanceOf(user) / 1e6
        );
        console.log(
            "Initial WETH balance (ETH):",
            IERC20Extended(WETH).balanceOf(user) / 1e18
        );

        // Step 1: Calculate optimal amounts using new helper function
        (
            uint256 usdcToSwap,
            uint256 usdcForLiquidity,
            uint256 wethForLiquidity
        ) = _calculateSwapAmountForFullLiquidity(initialUSDC);

        console.log("=== Optimal Calculation ===");
        console.log("Current WETH price in USDC:", _getCurrentPrice());
        console.log("USDC for liquidity:", usdcForLiquidity / 1e6);
        console.log("WETH for liquidity (ETH):", wethForLiquidity / 1e18);
        console.log("USDC to swap:", usdcToSwap / 1e6);

        // Check if user already has enough WETH
        uint256 currentWeth = IERC20Extended(WETH).balanceOf(user);
        console.log("Current WETH balance (ETH):", currentWeth / 1e18);

        // Step 2: Swap USDC to WETH as calculated
        if (usdcToSwap > 0) {
            // Use realistic minimum based on working test: 500 USDC should get ~0.12 ETH
            uint256 minWethOut = 0.1 ether; // Conservative minimum

            console.log("=== Swap Phase ===");
            console.log("USDC to swap:", usdcToSwap / 1e6);
            console.log("Expected WETH (ETH):", wethForLiquidity / 1e18);
            console.log("Minimum WETH out (ETH):", minWethOut / 1e18);

            liquidityProvider.swapUSDCToWETH(
                ETH_USDC_POOL,
                usdcToSwap,
                minWethOut
            );

            console.log(
                "USDC after swap:",
                IERC20Extended(USDC).balanceOf(user) / 1e6
            );
            console.log(
                "WETH after swap (ETH):",
                IERC20Extended(WETH).balanceOf(user) / 1e18
            );
        } else {
            console.log("=== No Swap Needed ===");
            console.log("User has enough WETH or no swap required");
        }

        // Step 3: Add liquidity with calculated amounts
        uint256 finalUsdcBalance = IERC20Extended(USDC).balanceOf(user);
        uint256 finalWethBalance = IERC20Extended(WETH).balanceOf(user);

        uint256 usdcToUse = finalUsdcBalance > usdcForLiquidity
            ? usdcForLiquidity
            : finalUsdcBalance;

        console.log("=== Liquidity Addition ===");
        console.log("USDC to use:", usdcToUse / 1e6);
        console.log("Available WETH (ETH):", finalWethBalance / 1e18);

        (uint256 amount0Used, uint256 amount1Used) = liquidityProvider
            .addLiquidityWithUSDCAmount(
                ETH_USDC_POOL,
                usdcToUse,
                usdcToUse,
                finalWethBalance
            );

        console.log("=== Final Results ===");
        console.log("USDC used:", amount0Used / 1e6);
        console.log("WETH used (ETH):", amount1Used / 1e18);

        // Assertions
        assertTrue(amount0Used > 0 || amount1Used > 0, "No tokens were used");

        vm.stopPrank();
    }

    function testCalculateSwapAmountForFullLiquidity() public {
        uint256 testAmount = 1000 * 1e6; // 1000 USDC

        console.log("=== Testing Swap Amount Calculation ===");
        console.log("Input USDC amount:", testAmount / 1e6);
        console.log("Current WETH price:", _getCurrentPrice());

        (
            uint256 usdcToSwap,
            uint256 usdcForLiquidity,
            uint256 wethForLiquidity
        ) = _calculateSwapAmountForFullLiquidity(testAmount);

        console.log("=== Results ===");
        console.log("USDC to swap:", usdcToSwap / 1e6);
        console.log("USDC for liquidity:", usdcForLiquidity / 1e6);
        console.log("WETH for liquidity (ETH):", wethForLiquidity / 1e18);
        console.log("WETH for liquidity (exact):", wethForLiquidity);

        // Manual calculation check
        uint256 manualWeth = (usdcToSwap * 1e18) / _getCurrentPrice();
        console.log("Manual WETH calculation (exact):", manualWeth);
        console.log("Manual WETH calculation (ETH):", manualWeth / 1e18);

        // Basic sanity checks
        assertTrue(
            usdcToSwap + usdcForLiquidity == testAmount,
            "USDC amounts don't add up"
        );
        assertTrue(wethForLiquidity == manualWeth, "WETH calculation mismatch");
    }
}
