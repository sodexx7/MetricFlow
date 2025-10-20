// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {Test} from "forge-std/Test.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
import {PackedUserOperation} from "account-abstraction/interfaces/PackedUserOperation.sol";
import "../src/SmartAccount.sol";

contract SmartAccountPimlicoForkTest is Test {
    // Pimlico Arbitrum Sepolia EntryPoint
    address constant PIMLICO_ENTRYPOINT =
        0x0000000071727De22E5E9d8BAf0edAc6f37da032;
    string ARBITRUM_SEPOLIA_RPC = vm.envString("ARBITRUM_SEPOLIA_RPC");

    IEntryPoint ep;
    SmartAccount acc;
    address owner = address(0xABCD);
    address beneficiary = address(0xFEE);

    function setUp() public {
        // Fork Arbitrum Sepolia
        vm.createSelectFork(ARBITRUM_SEPOLIA_RPC);
        // Use Pimlico's EntryPoint
        ep = IEntryPoint(PIMLICO_ENTRYPOINT);

        // Deploy SmartAccount
        acc = new SmartAccount(owner, ep);

        // Fund the account
        vm.deal(address(acc), 1 ether);
    }

    function test_fork_setup() public {
        // Verify we're on Arbitrum Sepolia (chain ID 421614)
        assertEq(block.chainid, 421614);

        // Verify EntryPoint exists
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(PIMLICO_ENTRYPOINT)
        }
        assertGt(codeSize, 0, "EntryPoint should have code");

        // Verify SmartAccount setup
        assertEq(address(acc.entryPoint()), PIMLICO_ENTRYPOINT);
        assertEq(acc.owner(), owner);
        assertEq(address(acc).balance, 1 ether);
    }

    function test_basic_userOp_execution() public {
        // Target contract to call
        address target = address(0xBEEF);

        // Build UserOperation
        PackedUserOperation memory uo;
        uo.sender = address(acc);
        uo.callData = abi.encodeWithSelector(
            SmartAccount.execute.selector,
            target,
            0.1 ether,
            ""
        );

        // Gas limits
        uint256 verificationGasLimit = 200000;
        uint256 callGasLimit = 100000;
        uo.accountGasLimits = bytes32(
            (verificationGasLimit << 128) | callGasLimit
        );

        uo.preVerificationGas = 50000;

        // Gas fees for Arbitrum
        uint256 maxPriorityFeePerGas = 0.1 gwei;
        uint256 maxFeePerGas = 1 gwei;
        uo.gasFees = bytes32((maxPriorityFeePerGas << 128) | maxFeePerGas);

        // Create ops array
        PackedUserOperation[] memory ops = new PackedUserOperation[](1);
        ops[0] = uo;

        // Record initial balances
        uint256 initialTargetBalance = target.balance;

        // Execute through EntryPoint
        ep.handleOps(ops, payable(beneficiary));

        // Verify execution
        assertEq(target.balance, initialTargetBalance + 0.1 ether);
    }

    function test_validateUserOp_on_fork() public {
        PackedUserOperation memory uo;
        uo.sender = address(acc);

        uint256 missingFunds = 0.05 ether;

        // Simulate EntryPoint calling validateUserOp
        vm.prank(PIMLICO_ENTRYPOINT);
        uint256 validationData = acc.validateUserOp(
            uo,
            bytes32(0),
            missingFunds
        );

        // Should return 0 for valid operation
        assertEq(validationData, 0);
    }

    function test_entrypoint_exists_on_arbitrum_sepolia() public {
        // Test that we can call EntryPoint functions
        uint256 deposit = ep.balanceOf(address(acc));
        assertEq(deposit, 0); // Should be 0 initially

        // Test deposit functionality
        vm.deal(address(this), 1 ether);
        ep.depositTo{value: 0.5 ether}(address(acc));

        uint256 newDeposit = ep.balanceOf(address(acc));
        assertEq(newDeposit, 0.5 ether);
    }

    function test_execute_with_real_entrypoint() public {
        address target = makeAddr("target");

        // Only EntryPoint should be able to call execute
        vm.prank(PIMLICO_ENTRYPOINT);
        acc.execute(target, 0.1 ether, "");

        assertEq(target.balance, 0.1 ether);
    }

    function test_revert_unauthorized_calls() public {
        // Should revert when not called by EntryPoint
        vm.expectRevert("only EP");
        acc.execute(address(0xBEEF), 0, "");

        PackedUserOperation memory uo;
        vm.expectRevert("only EP");
        acc.validateUserOp(uo, bytes32(0), 0);
    }

    receive() external payable {}
}
