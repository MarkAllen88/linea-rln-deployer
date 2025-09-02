// scripts/addMember.cjs
require("dotenv/config");
const hre = require("hardhat");
const ethers = hre.ethers;

// -----------------------------------------------------------------
// Fill in the values you already have
// -----------------------------------------------------------------
const SEMAPHORE_ADDR = "0x0E9984bd55E942e03a307e2339aafF7C8701383B"; // your Semaphore address
const IDENTITY_COMMITMENT = "0x5f3c9a7e2d1b4f8a6c9e3d7b0a1f2c4d8e9b7a6c3d5e1f0a2b4c6d8e9f1a3b5";

// -----------------------------------------------------------------
async function main() {
  // Load the contract (owner signer will be the first account Hardhat knows)
  const [deployer] = await ethers.getSigners();
  const semaphore = await ethers.getContractAt("Semaphore", SEMAPHORE_ADDR);
  const semaphoreAsOwner = semaphore.connect(deployer);

  console.log("👤 Deployer (owner):", deployer.address);

  // Send the transaction
  const tx = await semaphoreAsOwner.addMember(IDENTITY_COMMITMENT);
  const receipt = await tx.wait();

  console.log("✅ Member added – tx hash:", receipt.transactionHash);
}
main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});
