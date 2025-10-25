// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title UniswapV3Constants
 * @notice Constants for Uniswap V3 protocol on different networks
 */
library UniswapV3Constants {
    // =============================================================
    //                    ARBITRUM ONE MAINNET
    // =============================================================

    // Core Protocol Addresses
    address constant ARBITRUM_UNISWAP_V3_FACTORY = 0x1F98431c8aD98523631AE4a59f267346ea31F984;
    address constant ARBITRUM_SWAP_ROUTER = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address constant ARBITRUM_QUOTER_V2 = 0x61fFE014bA17989E743c5F6cB21bF9697530B21e;
    address constant ARBITRUM_POSITION_MANAGER = 0xC36442b4a4522E871399CD717aBDD847Ab11FE88;

    // Token Addresses
    address constant ARBITRUM_WETH = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
    address constant ARBITRUM_USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;

    // Pool Addresses and Configuration
    address constant ARBITRUM_WETH_USDC_500_POOL = 0xC6962004f452bE9203591991D15f6b388e09E8D0; // 0.05% fee
    uint24 constant WETH_USDC_POOL_FEE = 500; // 0.05%

    // Pool Tick Spacing
    int24 constant TICK_SPACING_500 = 10; // For 0.05% fee pools

    // =============================================================
    //                    TRANSACTION SETTINGS
    // =============================================================

    uint256 constant DEFAULT_DEADLINE_SECONDS = 300; // 5 minutes
    uint256 constant DEFAULT_SLIPPAGE_BPS = 50; // 0.5%
    uint256 constant MAX_SLIPPAGE_BPS = 1000; // 10%

    // =============================================================
    //                     LIQUIDITY SETTINGS
    // =============================================================

    // 5% price range for liquidity positions
    int24 constant FIVE_PERCENT_TICK_RANGE = 488; // log(1.05) / log(1.0001) H 488
    uint256 constant LIQUIDITY_SLIPPAGE_PERCENT = 5; // 5% slippage tolerance for LP
}
