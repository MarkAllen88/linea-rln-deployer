require("dotenv/config");
const hre = require("hardhat");
const ethers = hre.ethers;

// 👉 Replace this with the forwarder you already deployed
const FORWARDER_ADDRESS = "0x765817A7D44B8b86088cAA518DB9eeCD850D82f2";

async function main() {
  // 1️⃣ Deployer (owner) signer
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer (owner):", deployer.address);

  // 2️⃣ Get the compiled Semaphore factory (assumes you have contracts/Semaphore.sol)
  const SemaphoreFactory = await ethers.getContractFactory("Semaphore", deployer);

  // 3️⃣ Deploy Semaphore, passing the forwarder address to the constructor
  //    (most Semaphore implementations accept the RLN address in the ctor)
  const semaphore = await SemaphoreFactory.deploy(FORWARDER_ADDRESS);
  await semaphore.waitForDeployment();

  console.log("🚀 New Semaphore deployed at:", semaphore.target);
  console.log("✅ RLN contract set to:", FORWARDER_ADDRESS);
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});
