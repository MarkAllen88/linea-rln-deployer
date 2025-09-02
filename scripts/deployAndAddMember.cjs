require("dotenv/config");
const hre = require("hardhat");
const ethers = hre.ethers;

// -------------------------------------------------------------------
// USER‑CONFIGURATION
// -------------------------------------------------------------------
const TREE_DEPTH = 20;   // you can change this if you need a different depth
const IDENTITY_COMMITMENT =
  "0x5f3c9a7e2d1b4f8a6c9e3d7b0a1f2c4d8e9b7a6c3d5e1f0a2b4c6d8e9f1a3b5";

async function main() {
  // ---------------------------------------------------------------
  // 0️⃣ Deployer (owner) signer
  // ---------------------------------------------------------------
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer (owner):", deployer.address);

  // ---------------------------------------------------------------
  // 1️⃣ Deploy Semaphore (needs only the tree depth)
  // ---------------------------------------------------------------
  const SemaphoreFactory = await ethers.getContractFactory("Semaphore", deployer);
  const semaphore = await SemaphoreFactory.deploy(TREE_DEPTH);
  await semaphore.waitForDeployment();
  console.log("🛡️ Semaphore deployed at:", semaphore.target);
  console.log("   ↳ Tree depth:", TREE_DEPTH);

  // ---------------------------------------------------------------
  // 2️⃣ Deploy the RLN forwarder, giving it the Semaphore address
  // ---------------------------------------------------------------
  const RlnFactory = await ethers.getContractFactory("RlnForwarder", deployer);
  const rln = await RlnFactory.deploy(semaphore.target);
  await rln.waitForDeployment();
  console.log("🚀 RLN forwarder deployed at:", rln.target);

  // ---------------------------------------------------------------
  // 3️⃣ Authorise the forwarder inside Semaphore (one‑time only)
  // ---------------------------------------------------------------
  const txSet = await semaphore.setRLNContract(rln.target);
  const receiptSet = await txSet.wait();               // ← ethers v6 returns a receipt with .hash
  console.log(
    "✅ Semaphore now authorises RLN forwarder – tx hash:",
    receiptSet.hash                                 // <-- use .hash, not .transactionHash
  );

  // ---------------------------------------------------------------
  // 4️⃣ Register the member via the forwarder (now authorised)
  // ---------------------------------------------------------------
  const txAdd = await rln.registerMember(IDENTITY_COMMITMENT);
  const receiptAdd = await txAdd.wait();
  console.log("✅ Member added – tx hash:", receiptAdd.hash);
}

// ---------------------------------------------------------------
main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});
