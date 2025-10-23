// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// uniswap-v3
import { UniswapV3ProviderLib } from "src/protocols/uniswap-v3/UniswapV3ProviderLib.sol";
import { UniswapV3Constants } from "src/protocols/uniswap-v3/constants.sol";

import { IAccount } from "account-abstraction/interfaces/IAccount.sol";
import { PackedUserOperation } from "account-abstraction/interfaces/PackedUserOperation.sol";
import { IEntryPoint } from "account-abstraction/interfaces/IEntryPoint.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract SmartAccount is Ownable, IAccount {
    using UniswapV3ProviderLib for address;
    using SafeERC20 for IERC20;

    event SwapAndMintExecuted(uint256 usdcForLiquidity, uint256 wethReceived, uint256 amount0Used, uint256 amount1Used);

    event SwapExecuted(uint256 totalUsdcAmount, uint256 usdcSwapped, uint256 wethReceived);

    IEntryPoint entryPoint;

    constructor(address _ep) Ownable(_msgSender()) {
        entryPoint = IEntryPoint(_ep);
    }

    // ERC-4337 validation hook
    // TODO
    function validateUserOp(
        PackedUserOperation calldata,
        bytes32,
        uint256 missingAccountFunds
    ) external override returns (uint256 validationData) {
        require(msg.sender == address(entryPoint), "only EP");

        // Pay any missing funds to the EntryPoint
        if (missingAccountFunds > 0) {
            (bool success, ) = payable(msg.sender).call{ value: missingAccountFunds }("");
            require(success, "failed to pay EP");
        }
        // naive example: always valid (no signature verification)
        return 0;
    }

    /**
     * @notice Internal function to execute swap and mint liquidity
     * 1. There are some tiny gaps between the totalUsdcAmount and final LP. Current just ignore it.
     * @param totalUsdcAmount Amount of USDC to use
     * @param slippagePercent Slippage tolerance in basis points (50 = 0.5%)
     */
    function uniswapSwapAndMint(
        address user,
        uint256 totalUsdcAmount,
        uint256 slippagePercent
    ) external returns (uint256 tokenId, uint256 amount0Used, uint256 amount1Used) {
        require(msg.sender == address(entryPoint), "only EP");
        require(totalUsdcAmount > 0, "Invalid USDC amount");

        // Transfer USDC from user to this contract
        IERC20(UniswapV3Constants.ARBITRUM_USDC).safeTransferFrom(user, address(this), totalUsdcAmount);

        // Perform swap operation
        (uint256 wethReceived, uint256 usdcForLiquidity) = _performSwap(totalUsdcAmount, slippagePercent);

        // Add liquidity and return tokenId and amounts used
        return _addLiquidity(user, usdcForLiquidity, wethReceived);
    }

    // Current just support 50/50 liquidity provision
    function _performSwap(
        uint256 totalUsdcAmount,
        uint256 slippagePercent
    ) internal returns (uint256 wethReceived, uint256 usdcForLiquidity) {
        // Calculate optimal amounts for 50/50 split
        uint256 wethForLiquidity;
        (, usdcForLiquidity, wethForLiquidity) = UniswapV3ProviderLib.calculateSwapAmountForFullLiquidity(
            UniswapV3Constants.ARBITRUM_WETH_USDC_500_POOL,
            totalUsdcAmount
        );

        // Calculate minimum WETH output with slippage protection
        uint256 minWethOut = UniswapV3ProviderLib.calculateMinWethOut(
            UniswapV3Constants.ARBITRUM_WETH_USDC_500_POOL,
            usdcForLiquidity,
            slippagePercent
        );

        // Swap USDC to WETH using SwapRouter
        wethReceived = UniswapV3ProviderLib.swapUSDCToWETH(UniswapV3Constants.ARBITRUM_SWAP_ROUTER, address(this), usdcForLiquidity, minWethOut);

        require(wethReceived > 0, "Swap failed: no output received");
        require(wethReceived >= minWethOut, "Swap failed: insufficient output");

        // Emit swap event
        emit SwapExecuted(totalUsdcAmount, usdcForLiquidity, wethReceived);
    }

    function _addLiquidity(
        address user,
        uint256 usdcForLiquidity,
        uint256 wethReceived
    ) internal returns (uint256 tokenId, uint256 amount0Used, uint256 amount1Used) {
        // Calculate amounts for liquidity provision
        (uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min) = UniswapV3ProviderLib
            .calculateLiquidityAmounts(usdcForLiquidity, wethReceived);

        // Add liquidity using NonfungiblePositionManager
        (uint256 tokenIdResult, , uint256 amount0UsedFinal, uint256 amount1UsedFinal) = UniswapV3ProviderLib
            .addLiquidityWithPositionManager(
                UniswapV3Constants.ARBITRUM_WETH_USDC_500_POOL,
                user,
                amount0Desired,
                amount1Desired,
                amount0Min,
                amount1Min
            );

        emit SwapAndMintExecuted(usdcForLiquidity, wethReceived, amount0UsedFinal, amount1UsedFinal);

        return (tokenIdResult, amount0UsedFinal, amount1UsedFinal);
    }

    receive() external payable {}
}
