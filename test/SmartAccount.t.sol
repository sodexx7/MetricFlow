// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test, console } from "forge-std/Test.sol";
import { IEntryPoint, EntryPoint } from "account-abstraction/core/EntryPoint.sol";
import { PackedUserOperation } from "account-abstraction/interfaces/PackedUserOperation.sol";
import "account-abstraction/interfaces/IEntryPointSimulations.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { SmartAccount } from "../src/SmartAccount.sol";

// Mock ERC20 token for testing
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract SmartAccountTest is Test {
    EntryPoint ep;
    SmartAccount acc;
    MockERC20 mockUSDC;
    MockERC20 mockWETH;
    address owner = address(0xABCD);

    function setUp() public {
        ep = new EntryPoint(); // local deploy
        vm.prank(owner);
        acc = new SmartAccount(address(ep));

        // Create mock tokens for testing
        mockUSDC = new MockERC20("Mock USDC", "USDC", 1000000e6); // 1M USDC
        mockWETH = new MockERC20("Mock WETH", "WETH", 1000e18); // 1000 WETH

        // fund the account so it can pay for ops when EP settles
        vm.deal(address(acc), 1 ether);
    }

    function testWithdrawUSDC() public {
        uint256 depositAmount = 1000e6; // 1000 USDC
        uint256 withdrawAmount = 500e6; // 500 USDC

        // Transfer mock USDC to the smart account
        mockUSDC.transfer(address(acc), depositAmount);

        // Check initial balances
        uint256 initialAccountBalance = mockUSDC.balanceOf(address(acc));
        uint256 initialOwnerBalance = mockUSDC.balanceOf(owner);

        console.log("Initial account USDC:", initialAccountBalance);
        console.log("Initial owner USDC:", initialOwnerBalance);

        // Owner withdraws USDC
        vm.prank(owner);
        acc.withdrawToken(address(mockUSDC), owner, withdrawAmount);

        // Check final balances
        uint256 finalAccountBalance = mockUSDC.balanceOf(address(acc));
        uint256 finalOwnerBalance = mockUSDC.balanceOf(owner);

        console.log("Final account USDC:", finalAccountBalance);
        console.log("Final owner USDC:", finalOwnerBalance);

        // Assertions
        assertEq(finalAccountBalance, initialAccountBalance - withdrawAmount, "Account balance should decrease");
        assertEq(finalOwnerBalance, initialOwnerBalance + withdrawAmount, "Owner balance should increase");
    }

    function testWithdrawWETH() public {
        uint256 depositAmount = 1e18; // 1 WETH
        uint256 withdrawAmount = 0.5e18; // 0.5 WETH

        // Transfer mock WETH to the smart account
        mockWETH.transfer(address(acc), depositAmount);

        // Check initial balances
        uint256 initialAccountBalance = mockWETH.balanceOf(address(acc));
        uint256 initialOwnerBalance = mockWETH.balanceOf(owner);

        console.log("Initial account WETH:", initialAccountBalance);
        console.log("Initial owner WETH:", initialOwnerBalance);

        // Owner withdraws WETH
        vm.prank(owner);
        acc.withdrawToken(address(mockWETH), owner, withdrawAmount);

        // Check final balances
        uint256 finalAccountBalance = mockWETH.balanceOf(address(acc));
        uint256 finalOwnerBalance = mockWETH.balanceOf(owner);

        console.log("Final account WETH:", finalAccountBalance);
        console.log("Final owner WETH:", finalOwnerBalance);

        // Assertions
        assertEq(finalAccountBalance, initialAccountBalance - withdrawAmount, "Account balance should decrease");
        assertEq(finalOwnerBalance, initialOwnerBalance + withdrawAmount, "Owner balance should increase");
    }

    function testWithdrawETH() public {
        uint256 depositAmount = 1 ether;
        uint256 withdrawAmount = 0.5 ether;

        // Fund the smart account with ETH
        vm.deal(address(acc), depositAmount);

        // Check initial balances
        uint256 initialAccountBalance = address(acc).balance;
        uint256 initialOwnerBalance = owner.balance;

        console.log("Initial account ETH:", initialAccountBalance);
        console.log("Initial owner ETH:", initialOwnerBalance);

        // Owner withdraws ETH
        vm.prank(owner);
        acc.withdrawETH(owner, withdrawAmount);

        // Check final balances
        uint256 finalAccountBalance = address(acc).balance;
        uint256 finalOwnerBalance = owner.balance;

        console.log("Final account ETH:", finalAccountBalance);
        console.log("Final owner ETH:", finalOwnerBalance);

        // Assertions
        assertEq(finalAccountBalance, initialAccountBalance - withdrawAmount, "Account ETH balance should decrease");
        assertEq(finalOwnerBalance, initialOwnerBalance + withdrawAmount, "Owner ETH balance should increase");
    }
}
