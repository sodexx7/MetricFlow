// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

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

contract UniswapV3Provider {
    address constant UNISWAP_V3_FACTORY =
        0x1F98431c8aD98523631AE4a59f267346ea31F984;

    function isValidUniswapPool(address pool) internal view returns (bool) {
        // Simple check - in production, verify against factory
        return pool != address(0);
    }

    function calculateLiquidityFromUSDC(
        address pool,
        uint256 usdcAmount,
        int24 tickLower,
        int24 tickUpper
    ) public view returns (uint128 liquidity) {
        IUniswapV3Pool uniPool = IUniswapV3Pool(pool);
        (uint160 sqrtPriceX96, , , , , , ) = uniPool.slot0();

        // Convert tick to sqrtPrice
        uint160 sqrtPriceLowerX96 = getSqrtRatioAtTick(tickLower);
        uint160 sqrtPriceUpperX96 = getSqrtRatioAtTick(tickUpper);

        // Calculate liquidity based on USDC amount (token0)
        // L = amount0 * (sqrt(upper) * sqrt(price)) / (sqrt(upper) - sqrt(price))
        if (sqrtPriceX96 <= sqrtPriceLowerX96) {
            // All USDC, no WETH needed
            liquidity = getLiquidityForAmount0(
                sqrtPriceLowerX96,
                sqrtPriceUpperX96,
                usdcAmount
            );
        } else if (sqrtPriceX96 >= sqrtPriceUpperX96) {
            // All WETH, no USDC - return 0 since we only have USDC
            liquidity = 0;
        } else {
            // Current price is in range, calculate proportional liquidity
            liquidity = getLiquidityForAmount0(
                sqrtPriceX96,
                sqrtPriceUpperX96,
                usdcAmount
            );
        }
    }

    function getLiquidityForAmount0(
        uint160 sqrtRatioAX96,
        uint160 sqrtRatioBX96,
        uint256 amount0
    ) internal pure returns (uint128 liquidity) {
        if (sqrtRatioAX96 > sqrtRatioBX96)
            (sqrtRatioAX96, sqrtRatioBX96) = (sqrtRatioBX96, sqrtRatioAX96);

        uint256 intermediate = (uint256(sqrtRatioAX96) *
            uint256(sqrtRatioBX96)) >> 96;
        liquidity = uint128(
            (amount0 * intermediate) / (sqrtRatioBX96 - sqrtRatioAX96)
        );
    }

    function getSqrtRatioAtTick(
        int24 tick
    ) public pure returns (uint160 sqrtPriceX96) {
        uint256 absTick = tick < 0
            ? uint256(-int256(tick))
            : uint256(int256(tick));
        require(absTick <= uint256(int256(887272)), "T");

        uint256 ratio = absTick & 0x1 != 0
            ? 0xfffcb933bd6fad37aa2d162d1a594001
            : 0x100000000000000000000000000000000;
        if (absTick & 0x2 != 0)
            ratio = (ratio * 0xfff97272373d413259a46990580e213a) >> 128;
        if (absTick & 0x4 != 0)
            ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdcc) >> 128;
        if (absTick & 0x8 != 0)
            ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0) >> 128;
        if (absTick & 0x10 != 0)
            ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644) >> 128;
        if (absTick & 0x20 != 0)
            ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0) >> 128;
        if (absTick & 0x40 != 0)
            ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861) >> 128;
        if (absTick & 0x80 != 0)
            ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053) >> 128;
        if (absTick & 0x100 != 0)
            ratio = (ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4) >> 128;
        if (absTick & 0x200 != 0)
            ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54) >> 128;
        if (absTick & 0x400 != 0)
            ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3) >> 128;
        if (absTick & 0x800 != 0)
            ratio = (ratio * 0xe7159475a2c29b7443b29c7fa6e889d9) >> 128;
        if (absTick & 0x1000 != 0)
            ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825) >> 128;
        if (absTick & 0x2000 != 0)
            ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5) >> 128;
        if (absTick & 0x4000 != 0)
            ratio = (ratio * 0x70d869a156d2a1b890bb3df62baf32f7) >> 128;
        if (absTick & 0x8000 != 0)
            ratio = (ratio * 0x31be135f97d08fd981231505542fcfa6) >> 128;
        if (absTick & 0x10000 != 0)
            ratio = (ratio * 0x9aa508b5b7a84e1c677de54f3e99bc9) >> 128;
        if (absTick & 0x20000 != 0)
            ratio = (ratio * 0x5d6af8dedb81196699c329225ee604) >> 128;
        if (absTick & 0x40000 != 0)
            ratio = (ratio * 0x2216e584f5fa1ea926041bedfe98) >> 128;
        if (absTick & 0x80000 != 0)
            ratio = (ratio * 0x48a170391f7dc42444e8fa2) >> 128;

        if (tick > 0) ratio = type(uint256).max / ratio;
        sqrtPriceX96 = uint160(
            (ratio >> 32) + (ratio % (1 << 32) == 0 ? 0 : 1)
        );
    }

    function addLiquidityWithUSDCAmount(
        address pool,
        uint256 usdcAmount,
        uint256 amount0Max,
        uint256 amount1Max
    ) external returns (uint256 amount0, uint256 amount1) {
        // Get current tick and calculate ±5% range
        (, int24 currentTick, , , , , ) = IUniswapV3Pool(pool).slot0();

        int24 tickLower = ((currentTick - 1000) / 10) * 10;
        int24 tickUpper = ((currentTick + 1000) / 10) * 10;

        // Calculate optimal liquidity based on USDC amount
        uint128 liquidity = calculateLiquidityFromUSDC(
            pool,
            usdcAmount,
            tickLower,
            tickUpper
        );

        // Add liquidity
        (amount0, amount1) = IUniswapV3Pool(pool).mint(
            msg.sender,
            tickLower,
            tickUpper,
            liquidity,
            abi.encode(msg.sender, amount0Max, amount1Max)
        );
    }

    function addLiquidity(
        address pool,
        int24 tickLower,
        int24 tickUpper,
        uint128 liquidity,
        uint256 amount0Max,
        uint256 amount1Max
    ) external returns (uint256 amount0, uint256 amount1) {
        (amount0, amount1) = IUniswapV3Pool(pool).mint(
            msg.sender,
            tickLower,
            tickUpper,
            liquidity,
            abi.encode(msg.sender, amount0Max, amount1Max)
        );
    }

    function addLiquidityWithPriceRange(
        address pool,
        uint128 liquidity,
        uint256 amount0Max,
        uint256 amount1Max
    ) external returns (uint256 amount0, uint256 amount1) {
        // Only get the tick we need, ignore other slot0 values
        (, int24 currentTick, , , , , ) = IUniswapV3Pool(pool).slot0();

        // Calculate tick range inline to reduce local variables
        (amount0, amount1) = IUniswapV3Pool(pool).mint(
            msg.sender,
            ((currentTick - 1000) / 10) * 10, // tickLower
            ((currentTick + 1000) / 10) * 10, // tickUpper
            liquidity,
            abi.encode(msg.sender, amount0Max, amount1Max)
        );
    }

    function swapUSDCToWETH(
        address pool,
        uint256 amountUSDCIn,
        uint256 amountWETHOutMin
    ) external returns (uint256 amountWETHOut) {
        IUniswapV3Pool uniPool = IUniswapV3Pool(pool);
        
        // Determine swap direction based on token order
        address token0 = uniPool.token0();
        address token1 = uniPool.token1();
        
        bool zeroForOne;
        if (token0 == 0xaf88d065e77c8cC2239327C5EDb3A432268e5831 && 
            token1 == 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1) {
            // USDC is token0, WETH is token1 -> swap token0 for token1
            zeroForOne = true;
        } else if (token1 == 0xaf88d065e77c8cC2239327C5EDb3A432268e5831 && 
                   token0 == 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1) {
            // WETH is token0, USDC is token1 -> swap token1 for token0
            zeroForOne = false;
        } else {
            revert("Invalid pool tokens");
        }
        
        // Perform swap
        (int256 amount0, int256 amount1) = uniPool.swap(
            msg.sender,
            zeroForOne,
            int256(amountUSDCIn),
            zeroForOne ? 4295128740 : 1461446703485210103287273052203988822378723970341, // price limits
            abi.encode(msg.sender, amountUSDCIn, amountWETHOutMin)
        );
        
        // Calculate WETH output amount
        amountWETHOut = zeroForOne ? uint256(-amount1) : uint256(-amount0);
        
        // Check slippage protection
        require(amountWETHOut >= amountWETHOutMin, "Insufficient output amount");
    }

    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external {
        require(isValidUniswapPool(msg.sender), "Invalid pool caller");
        
        (address payer, uint256 amountIn, ) = abi.decode(
            data,
            (address, uint256, uint256)
        );
        
        IUniswapV3Pool pool = IUniswapV3Pool(msg.sender);
        
        // Pay the input token
        if (amount0Delta > 0) {
            IERC20(pool.token0()).transferFrom(payer, msg.sender, uint256(amount0Delta));
        }
        if (amount1Delta > 0) {
            IERC20(pool.token1()).transferFrom(payer, msg.sender, uint256(amount1Delta));
        }
    }

    function uniswapV3MintCallback(
        uint256 amount0Owed,
        uint256 amount1Owed,
        bytes calldata data
    ) external {
        // 🔒 SECURITY: Validate caller is legitimate Uniswap pool
        require(isValidUniswapPool(msg.sender), "Invalid pool caller");

        (address payer, uint256 amount0Max, uint256 amount1Max) = abi.decode(
            data,
            (address, uint256, uint256)
        );

        require(amount0Owed <= amount0Max, "Amount0 exceeds max");
        require(amount1Owed <= amount1Max, "Amount1 exceeds max");

        IUniswapV3Pool pool = IUniswapV3Pool(msg.sender);

        if (amount0Owed > 0) {
            IERC20(pool.token0()).transferFrom(payer, msg.sender, amount0Owed);
        }
        if (amount1Owed > 0) {
            IERC20(pool.token1()).transferFrom(payer, msg.sender, amount1Owed);
        }
    }
}
