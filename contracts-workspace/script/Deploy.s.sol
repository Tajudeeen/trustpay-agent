// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ReputationRegistry} from "../contracts/ReputationRegistry.sol";

contract DeployReputationRegistry is Script {
    function run() external returns (ReputationRegistry registry) {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        registry = new ReputationRegistry();
        vm.stopBroadcast();

        console.log("ReputationRegistry deployed at:", address(registry));
        console.log("Set NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS=%s in .env.local", address(registry));
    }
}
