// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IAccount} from "account-abstraction/interfaces/IAccount.sol";
import {PackedUserOperation} from "account-abstraction/interfaces/PackedUserOperation.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";

contract SmartAccount is IAccount {
    address public owner;
    IEntryPoint public immutable entryPoint;

    constructor(address _owner, IEntryPoint _ep) {
        owner = _owner;
        entryPoint = _ep;
    }

    // ERC-4337 validation hook
    function validateUserOp(
        PackedUserOperation calldata,
        bytes32,
        uint256 missingAccountFunds
    ) external override returns (uint256 validationData) {
        require(msg.sender == address(entryPoint), "only EP");
        
        // Pay any missing funds to the EntryPoint
        if (missingAccountFunds > 0) {
            (bool success,) = payable(msg.sender).call{value: missingAccountFunds}("");
            require(success, "failed to pay EP");
        }
        
        // naive example: always valid (no signature verification)
        return 0;
    }

    // SmartAccount.execute.selector,
    //         address(0xBEEF),
    //         0,
    //         ""

    // simple executor callable by EntryPoint during handleOps
    function execute(address to, uint256 value, bytes calldata data) external {
        require(msg.sender == address(entryPoint), "only EP");
        (bool ok, ) = to.call{value: value}(data);
        require(ok, "exec failed");
    }

    receive() external payable {}
}
