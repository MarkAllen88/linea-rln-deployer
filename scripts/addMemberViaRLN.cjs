require("dotenv/config");
const hre = require("hardhat");
const ethers = hre.ethers;

// ---------------------------------------------------------------
// ✅ NEW CONFIG – use the freshly‑deployed Semaphore address
// ---------------------------------------------------------------
const SEMAPHORE_ADDR = "0xc56051a03165Fca9717170557da334fd15c0e173"; // <-- replace with yours
const IDENTITY_COMMITMENT = "0x5f3c9a7e2d1b4f8a6c9e3d7b0a1f2c4d8e9b7a6c3d5e1f0a2b4c6d8e9f1a3b5"; // any uint256

// ---------------------------------------------------------------
// Main logic – deploy forwarder, then add the member
// ---------------------------------------------------------------
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer (owner):", deployer.address);

  // Deploy the forwarder (RLN contract) pointing at the new Semaphore
  const RlnFactory = await ethers.getContractFactory("RlnForwarder", deployer);
  const rln = await RlnFactory.deploy(SEMAPHORE_ADDR);
  await rln.waitForDeployment();
  console.log("🚀 RLN forwarder deployed at:", rln.target);

  // Register the member via the authorized RLN contract
  const tx = await rln.registerMember(IDENTITY_COMMITMENT);
  const receipt = await tx.wait();
  console.log("✅ Member added – tx hash:", receipt.transactionHash);
}

// ---------------------------------------------------------------
main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});
