const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const artifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../artifacts/contracts/ReputationRegistry.sol/ReputationRegistry.json"),
      "utf8"
    )
  );

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, deployer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\nReputationRegistry deployed:", address);
  console.log("\nAdd to .env.local:");
  console.log("REGISTRY_ADDRESS=" + address);
  console.log("NEXT_PUBLIC_REGISTRY_ADDRESS=" + address);
}

main().catch((e) => { console.error(e); process.exit(1); });