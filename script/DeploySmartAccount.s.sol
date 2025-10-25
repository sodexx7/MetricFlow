// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Script, console } from "forge-std/Script.sol";
import { SmartAccount } from "../src/SmartAccount.sol";

contract DeploySmartAccount is Script {
    // Default EntryPoint addresses for different networks
    address constant ARBITRUM_ENTRYPOINT = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;
    address constant ARBITRUM_SEPOLIA_ENTRYPOINT = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;
    address constant ETHEREUM_ENTRYPOINT = 0x0000000071727De22E5E9d8BAf0edAc6f37da032;

    function run() external {
        // Get the deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("ARB_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Get EntryPoint address (default to Arbitrum)
        address entryPoint = vm.envOr("ENTRYPOINT_ADDRESS", ARBITRUM_ENTRYPOINT);

        console.log("Deploying SmartAccount...");
        console.log("Deployer address:", deployer);
        console.log("EntryPoint address:", entryPoint);
        console.log("Deployer balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy SmartAccount
        SmartAccount smartAccount = new SmartAccount(entryPoint);

        vm.stopBroadcast();

        console.log("SmartAccount deployed at:", address(smartAccount));
        console.log("Owner:", smartAccount.owner());

        // Save deployment information
        _saveDeploymentInfo(address(smartAccount), deployer, entryPoint);
        
        // Copy contract artifacts
        _copyContractArtifacts();

        // Verify contract on block explorer
        console.log("Verifying contract...");
        _verifyContract(address(smartAccount), entryPoint);
    }

    function _verifyContract(address contractAddress, address entryPoint) internal {
        // Get verification API key from environment (optional)
        string memory apiKey = vm.envOr("ETHERSCAN_API_KEY", string(""));

        if (bytes(apiKey).length > 0) {
            try vm.ffi(_buildVerifyCommand(contractAddress, entryPoint, apiKey)) {
                console.log("Contract verification initiated successfully");
                console.log("Check verification status on block explorer");
            } catch {
                console.log("Contract verification failed - run manually:");
                console.log("forge verify-contract", contractAddress, "src/SmartAccount.sol:SmartAccount");
                console.log("--constructor-args", _encodeConstructorArgs(entryPoint));
            }
        } else {
            console.log("No ETHERSCAN_API_KEY provided. To verify manually:");
            console.log("forge verify-contract", contractAddress, "src/SmartAccount.sol:SmartAccount");
            console.log("--constructor-args", _encodeConstructorArgs(entryPoint));
        }
    }

    function _buildVerifyCommand(
        address contractAddress,
        address entryPoint,
        string memory apiKey
    ) internal pure returns (string[] memory) {
        string[] memory command = new string[](7);
        command[0] = "forge";
        command[1] = "verify-contract";
        command[2] = vm.toString(contractAddress);
        command[3] = "src/SmartAccount.sol:SmartAccount";
        command[4] = "--constructor-args";
        command[5] = _encodeConstructorArgs(entryPoint);
        command[6] = string(abi.encodePacked("--etherscan-api-key=", apiKey));
        return command;
    }

    function _encodeConstructorArgs(address entryPoint) internal pure returns (string memory) {
        return vm.toString(abi.encode(entryPoint));
    }

    function _saveDeploymentInfo(address contractAddress, address deployer, address entryPoint) internal {
        console.log("Saving deployment info to deployments/arbitrum-mainnet/");
        
        // Create deployment info JSON
        string memory deploymentInfo = string(abi.encodePacked(
            '{\n',
            '  "network": "arbitrum-mainnet",\n',
            '  "chainId": 42161,\n',
            '  "contracts": {\n',
            '    "SmartAccount": {\n',
            '      "address": "', vm.toString(contractAddress), '",\n',
            '      "deployer": "', vm.toString(deployer), '",\n',
            '      "deploymentTx": "",\n',
            '      "blockNumber": ', vm.toString(block.number), ',\n',
            '      "blockHash": "",\n',
            '      "timestamp": "', vm.toString(block.timestamp), '",\n',
            '      "constructorArgs": {\n',
            '        "entryPoint": "', vm.toString(entryPoint), '"\n',
            '      },\n',
            '      "verified": false,\n',
            '      "verificationTx": ""\n',
            '    }\n',
            '  },\n',
            '  "deploymentDate": "', vm.toString(block.timestamp), '",\n',
            '  "gitCommit": "",\n',
            '  "deployerNote": "SmartAccount deployment for Arbitrum mainnet"\n',
            '}'
        ));
        
        // Write to file
        try vm.writeFile("deployments/arbitrum-mainnet/deployment-info.json", deploymentInfo) {
            console.log("Deployment info saved successfully");
        } catch {
            console.log("Failed to save deployment info - continuing anyway");
        }
    }
    
    function _copyContractArtifacts() internal {
        console.log("Copying contract artifacts...");
        
        // Copy SmartAccount.json from out/ to deployments/
        string[] memory copyCommand = new string[](3);
        copyCommand[0] = "cp";
        copyCommand[1] = "out/SmartAccount.sol/SmartAccount.json";
        copyCommand[2] = "deployments/arbitrum-mainnet/SmartAccount.json";
        
        try vm.ffi(copyCommand) {
            console.log("Contract artifacts copied successfully");
        } catch {
            console.log("Failed to copy contract artifacts - please copy manually:");
            console.log("cp out/SmartAccount.sol/SmartAccount.json deployments/arbitrum-mainnet/");
        }
    }
}
