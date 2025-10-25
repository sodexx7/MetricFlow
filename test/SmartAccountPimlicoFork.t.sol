// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test, console } from "forge-std/Test.sol";
import { IEntryPoint } from "account-abstraction/interfaces/IEntryPoint.sol";
import { PackedUserOperation } from "account-abstraction/interfaces/PackedUserOperation.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SmartAccount } from "../src/SmartAccount.sol";

import { UniswapV3ProviderLib, IUniswapV3Pool } from "src/protocols/uniswap-v3/UniswapV3ProviderLib.sol";
import { UniswapV3Constants } from "src/protocols/uniswap-v3/constants.sol";

interface INonfungiblePositionManager {
    function balanceOf(address owner) external view returns (uint256);
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
}

contract SmartAccountPimlicoForkTest is Test {
    // Pimlico Arbitrum  EntryPoint
    address constant PIMLICO_ENTRYPOINT = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;
    string arbitrumRpc = vm.envString("ARBITRUM_RPC");

    address constant WHALE = 0x1714400FF23dB4aF24F9fd64e7039e6597f18C2b; // USDC whale

    IEntryPoint ep;
    SmartAccount acc;
    address user = address(0x999);
    address owner = address(0xABCD);
    address beneficiary = address(0xFEE);

    function setUp() public {
        // Fork Arbitrum Sepolia
        vm.createSelectFork(arbitrumRpc);
        // Use Pimlico's EntryPoint
        ep = IEntryPoint(PIMLICO_ENTRYPOINT);

        // Deploy SmartAccount
        vm.prank(owner);
        acc = new SmartAccount(address(ep));

        // // Fund the account
        // vm.deal(address(acc), 1 ether);
    }

    function testUniswapSwapAndMint() public {
        uint256 usdcAmount = 10e6; // 1000 USDC
        uint256 slippagePercent = 50; // 0.5% slippage

        // Transfer USDC from whale to smart account
        vm.prank(WHALE);
        IERC20(UniswapV3Constants.ARBITRUM_USDC).transfer(user, usdcAmount);

        // User approve ETH/UDSC POOL usdcAmount
        vm.prank(user);
        IERC20(UniswapV3Constants.ARBITRUM_USDC).approve(address(acc), usdcAmount);

        // Record initial balances
        uint256 initialUSDC = IERC20(UniswapV3Constants.ARBITRUM_USDC).balanceOf(user);
        uint256 initialLPCount = INonfungiblePositionManager(UniswapV3Constants.ARBITRUM_POSITION_MANAGER).balanceOf(user);
        console.log("Initial user USDC balance:", initialUSDC);
        console.log("Initial user LP NFT count:", initialLPCount);

        // Call uniswapSwapAndMint through EntryPoint
        bytes memory callData = abi.encodeWithSelector(SmartAccount.uniswapSwapAndMint.selector, user, usdcAmount, slippagePercent);

        vm.prank(address(ep));
        (bool success, bytes memory result) = address(acc).call(callData);
        require(success, "uniswapSwapAndMint failed");

        (uint256 tokenId, uint256 amount0Used, uint256 amount1Used) = abi.decode(result, (uint256, uint256, uint256));

        // Check final balances
        uint256 finalUSDC = IERC20(UniswapV3Constants.ARBITRUM_USDC).balanceOf(user);
        uint256 finalLPCount = INonfungiblePositionManager(UniswapV3Constants.ARBITRUM_POSITION_MANAGER).balanceOf(user);

        console.log("Final User USDC:", finalUSDC);
        console.log("Final LP NFT count:", finalLPCount);
        console.log("LP NFT Token ID:", tokenId);
        console.log("Amount0 WETH used:", amount0Used);
        console.log("Amount1 USDC used:", amount1Used);

        // Calculate total value in USDC terms
        // amount0Used = WETH, amount1Used = USDC
        uint256 wethValueInUSDC = UniswapV3ProviderLib.getQuoteWETHToUSDC(UniswapV3Constants.ARBITRUM_WETH_USDC_500_POOL, amount0Used);
        uint256 totalValueInUSDC = amount1Used + wethValueInUSDC;
        console.log("Total liquidity value (USDC):", totalValueInUSDC / 1e6, "USDC");
    }

    receive() external payable {}
}
