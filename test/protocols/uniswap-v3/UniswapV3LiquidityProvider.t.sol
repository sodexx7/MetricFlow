// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";

import "src/Protocols/uniswap-v3/UniswapV3LiquidityProvider.sol";

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

contract UniswapV3LiquidityProviderTest is Test {
    UniswapV3LiquidityProvider public liquidityProvider;

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

        liquidityProvider = new UniswapV3LiquidityProvider();

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

        // For ETH/USDC 0.05% pool on Arbitrum
        // token0 = USDC (6 decimals), token1 = WETH (18 decimals)
        // sqrtPriceX96 represents sqrt(token1/token0) = sqrt(WETH/USDC)

        console.log("sqrtPriceX96:", sqrtPriceX96);
        console.log("tick:", tick);

        // Following the reference method:
        // 1. Get sqrtPriceX96 (already done)
        // 2. Divide by 2^96 to get square root of price
        // 3. Square the result to get spot price
        // 4. Adjust for token decimals

        // Step 1: Convert sqrtPriceX96 to square root of price
        // sqrtPrice = sqrtPriceX96 / 2^96
        // But to avoid precision loss, we'll do: (sqrtPriceX96 * sqrtPriceX96) / 2^192

        // Step 2: Square it and adjust for decimals in one calculation
        // price = (sqrtPriceX96 / 2^96)^2 * 10^(decimalsToken0 - decimalsToken1)
        // For USDC(6) / WETH(18): 10^(6-18) = 10^(-12) = 1/10^12

        uint256 sqrtPriceX96Squared = uint256(sqrtPriceX96) *
            uint256(sqrtPriceX96);

        // Divide by 2^192 and multiply by 10^12 to adjust decimals (WETH has 12 more decimals than USDC)
        uint256 priceToken1InToken0 = (sqrtPriceX96Squared * 1e12) >> 192;

        console.log("Price token1/token0 (WETH/USDC):", priceToken1InToken0);

        // This gives us the price of WETH in terms of USDC
        uint256 ethPriceInUsdc = priceToken1InToken0;

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
}
