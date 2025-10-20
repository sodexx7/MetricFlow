// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {IEntryPoint, EntryPoint} from "account-abstraction/core/EntryPoint.sol";
import {PackedUserOperation} from "account-abstraction/interfaces/PackedUserOperation.sol";
import "account-abstraction/interfaces/IEntryPointSimulations.sol";
import "../src/SmartAccount.sol";

contract SmartAccountTest is Test {
    EntryPoint ep;
    SmartAccount acc;
    address owner = address(0xABCD);

    function setUp() public {
        ep = new EntryPoint(); // local deploy
        acc = new SmartAccount(owner, IEntryPoint(address(ep)));

        // fund the account so it can pay for ops when EP settles
        vm.deal(address(acc), 1 ether);
    }

    function test_handleOps_like_flow() public {
        // Build a minimal UserOperation
        PackedUserOperation memory uo;
        uo.sender = address(acc);
        uo.callData = abi.encodeWithSelector(
            SmartAccount.execute.selector,
            address(0xBEEF),
            0,
            ""
        );

        // Pack verification gas (100000) and call gas (100000) into accountGasLimits
        uint256 verificationGasLimit = 100000;
        uint256 callGasLimit = 100000;
        uo.accountGasLimits = bytes32(
            (verificationGasLimit << 128) | callGasLimit
        );

        // preVerificationGas remains as uint256
        uo.preVerificationGas = 50000;
        // Use:
        uint256 maxPriorityFeePerGas = 1 gwei; // tip for miners
        uint256 maxFeePerGas = tx.gasprice + 1; // max willing to pay
        uo.gasFees = bytes32((maxPriorityFeePerGas << 128) | maxFeePerGas);

        // No signature logic in this toy account; a real account would verify here.

        // The EntryPoint API expects arrays of ops + a beneficiary for fees
        PackedUserOperation[] memory ops = new PackedUserOperation[](1);
        ops[0] = uo;

        IEntryPointSimulations sims = IEntryPointSimulations(address(ep));
        // In tests, we can call simulateValidation / handleOps directly
        sims.simulateValidation(uo); // should not revert if validateUserOp passes
        ep.handleOps(ops, payable(address(0xFEE))); // executes MyAccount.execute()
    }
}
