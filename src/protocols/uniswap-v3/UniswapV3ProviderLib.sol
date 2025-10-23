// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ISwapRouter } from "./interface/ISwapRouter.sol";
import { INonfungiblePositionManager } from "./interface/INonfungiblePositionManager.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { UniswapV3Constants } from "./constants.sol";

interface IUniswapV3Pool {
    function mint(
        address recipient,
        int24 tickLower,
        int24 tickUpper,
        uint128 amount,
        bytes calldata data
    ) external returns (uint256 amount0, uint256 amount1);

    function swap(
        address recipient,
        bool zeroForOne,
        int256 amountSpecified,
        uint160 sqrtPriceLimitX96,
        bytes calldata data
    ) external returns (int256 amount0, int256 amount1);

    function token0() external view returns (address);
    function token1() external view returns (address);
    function slot0()
        external
        view
        returns (
            uint160 sqrtPriceX96,
            int24 tick,
            uint16 observationIndex,
            uint16 observationCardinality,
            uint16 observationCardinalityNext,
            uint8 feeProtocol,
            bool unlocked
        );
}

library UniswapV3ProviderLib {
    using SafeERC20 for IERC20;

    function swapUSDCToWETH(
        address swapRouter,
        address recipient,
        uint256 amountUSDCIn,
        uint256 amountWETHOutMin
    ) internal returns (uint256 amountWETHOut) {
        // Approve SwapRouter to spend USDC
        IERC20(UniswapV3Constants.ARBITRUM_USDC).approve(UniswapV3Constants.ARBITRUM_SWAP_ROUTER, amountUSDCIn);

        // Set up swap parameters
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: UniswapV3Constants.ARBITRUM_USDC,
            tokenOut: UniswapV3Constants.ARBITRUM_WETH,
            fee: UniswapV3Constants.WETH_USDC_POOL_FEE,
            recipient: recipient,
            deadline: block.timestamp + UniswapV3Constants.DEFAULT_DEADLINE_SECONDS,
            amountIn: amountUSDCIn,
            amountOutMinimum: amountWETHOutMin,
            sqrtPriceLimitX96: 0 // No price limit
        });

        // Execute swap via SwapRouter
        amountWETHOut = ISwapRouter(UniswapV3Constants.ARBITRUM_SWAP_ROUTER).exactInputSingle(params);
        require(amountWETHOut >= amountWETHOutMin, "Insufficient WETH output");
    }

    function addLiquidityWithPositionManager(
        address pool,
        address recipient,
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min
    ) internal returns (uint256 tokenId, uint128 liquidity, uint256 amount0Used, uint256 amount1Used) {
        // Approve tokens and get tick range
        _approveTokensForPosition(pool, amount0Desired, amount1Desired);

        // Create mint parameters
        INonfungiblePositionManager.MintParams memory params = _createMintParams(
            pool,
            recipient,
            amount0Desired,
            amount1Desired,
            amount0Min,
            amount1Min
        );

        // Mint the position
        return INonfungiblePositionManager(UniswapV3Constants.ARBITRUM_POSITION_MANAGER).mint(params);
    }

    function getCurrentPrice(address pool) internal view returns (uint256 wethPriceInUsdc) {
        IUniswapV3Pool uniPool = IUniswapV3Pool(pool);
        (uint160 sqrtPriceX96, , , , , , ) = uniPool.slot0();

        uint256 sqrtPriceX96Squared = uint256(sqrtPriceX96) * uint256(sqrtPriceX96);
        wethPriceInUsdc = (sqrtPriceX96Squared * 1e12) >> 192;
    }

    function _approveTokensForPosition(address pool, uint256 amount0Desired, uint256 amount1Desired) internal {
        IUniswapV3Pool uniPool = IUniswapV3Pool(pool);
        address token0 = uniPool.token0();
        address token1 = uniPool.token1();

        if (amount0Desired > 0) {
            IERC20(token0).approve(UniswapV3Constants.ARBITRUM_POSITION_MANAGER, amount0Desired);
        }
        if (amount1Desired > 0) {
            IERC20(token1).approve(UniswapV3Constants.ARBITRUM_POSITION_MANAGER, amount1Desired);
        }
    }

    function _createMintParams(
        address pool,
        address recipient,
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min
    ) internal view returns (INonfungiblePositionManager.MintParams memory) {
        IUniswapV3Pool uniPool = IUniswapV3Pool(pool);

        // Get current tick and calculate ±5% range
        (, int24 currentTick, , , , , ) = uniPool.slot0();
        // 5% = 1.05, tick = log(1.05) / log(1.0001) ≈ 488 ticks
        int24 tickRange = UniswapV3Constants.FIVE_PERCENT_TICK_RANGE;
        // Round to nearest multiple of 10 for valid tick spacing (pool tick spacing = 10)

        int24 tickLower = ((currentTick - tickRange) / 10) * 10;
        int24 tickUpper = ((currentTick + tickRange) / 10) * 10;

        return
            INonfungiblePositionManager.MintParams({
                token0: UniswapV3Constants.ARBITRUM_WETH,
                token1: UniswapV3Constants.ARBITRUM_USDC,
                fee: 500,
                tickLower: tickLower,
                tickUpper: tickUpper,
                amount0Desired: amount0Desired,
                amount1Desired: amount1Desired,
                amount0Min: amount0Min,
                amount1Min: amount1Min,
                recipient: recipient,
                deadline: block.timestamp + 300
            });
    }

    function getQuoteUSDCToWETH(address pool, uint256 usdcAmountIn) internal view returns (uint256 wethAmountOut) {
        // Use current pool price instead of QuoterV2 to avoid callback requirement
        uint256 wethPriceInUsdc = getCurrentPrice(pool);

        // Convert USDC to WETH: usdcAmount / price, accounting for decimals
        // USDC has 6 decimals, WETH has 18 decimals
        wethAmountOut = (usdcAmountIn * 1e18) / (wethPriceInUsdc * 1e6);
    }

    function getQuoteWETHToUSDC(address pool, uint256 wethAmountIn) internal view returns (uint256 usdcAmountOut) {
        // Use current pool price instead of QuoterV2 to avoid callback requirement
        uint256 wethPriceInUsdc = getCurrentPrice(pool);

        // Convert WETH to USDC: wethAmount * price, accounting for decimals
        // WETH has 18 decimals, USDC has 6 decimals
        usdcAmountOut = (wethAmountIn * wethPriceInUsdc * 1e6) / 1e18;
    }

    function calculateMinWethOut(address pool, uint256 usdcAmountIn, uint256 slippagePercent) internal view returns (uint256 minWethOut) {
        require(slippagePercent <= 1000, "Slippage too high"); // Max 10%

        // Get expected WETH output using the base quote function
        uint256 expectedWethOut = getQuoteUSDCToWETH(pool, usdcAmountIn);

        // Apply slippage protection (e.g., 50 = 0.5% slippage)
        minWethOut = (expectedWethOut * (10000 - slippagePercent)) / 10000;
    }

    // 50% (USDC)/50%(WETH value = 50%USDC)
    function calculateSwapAmountForFullLiquidity(
        address pool,
        uint256 totalUsdcAmount
    ) internal view returns (uint256 usdcToSwap, uint256 usdcForLiquidity, uint256 wethForLiquidity) {
        // Simple 50/50 split by value
        // Half remains as USDC, half gets swapped to WETH
        usdcForLiquidity = totalUsdcAmount / 2;
        usdcToSwap = totalUsdcAmount - usdcForLiquidity;

        // Calculate WETH amount using the base quote function
        wethForLiquidity = getQuoteUSDCToWETH(pool, usdcToSwap);
    }

    // 5% slippage tolerance
    function calculateLiquidityAmounts(
        uint256 usdcForLiquidity,
        uint256 wethReceived
    ) internal pure returns (uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min) {
        // In ETH/USDC pool: token0 = WETH, token1 = USDC
        amount0Desired = wethReceived;
        amount1Desired = usdcForLiquidity;
        amount0Min = (wethReceived * 95) / 100;
        amount1Min = (usdcForLiquidity * 95) / 100;
    }
}
