// scripts/deploy-fee-collector.cjs
// ---------------------------------------------------------------
// No env vars are required for this contract.
// Deploy SimpleFeeCollector to the network you specify with
// `--network`. This script works with ethers v6 (the version
// bundled in Hardhat toolbox).
// ---------------------------------------------------------------
const hre = require("hardhat");

async function main() {
  // Grab the first signer (the account whose private key you put in .env)
  const [deployer] = await hre.ethers.getSigners();

  // Provider‑level balance (ethers v6)
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("\n📡 Deploying SimpleFeeCollector with address:", deployer.address);
  console.log("💰 Deployer balance (wei):", balance.toString());

  // Get the contract factory (compiled from contracts/SimpleFeeCollector.sol)
  const FeeCollectorFactory = await hre.ethers.getContractFactory("SimpleFeeCollector");

  // Deploy – the constructor takes no arguments
  const feeCollector = await FeeCollectorFactory.deploy();

  // Wait until the deployment transaction is mined
  await feeCollector.waitForDeployment();

  console.log("\n✅ SimpleFeeCollector deployed to:", feeCollector.target);
}

// Standard Hardhat entry‑point handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
