// scripts/deploySemaphore.js
// ---------------------------------------------------------------
// Plain CommonJS deployment script – works with Hardhat “run”
// ---------------------------------------------------------------
require("dotenv/config");               // loads .env automatically
const hre = require("hardhat");         // gives us ethers, network, etc.
const ethers = hre.ethers;

// -----------------------------------------------------------------
// Helper – abort if a required env var is missing
// -----------------------------------------------------------------
function requiredEnv(name) {
  const val = process.env[name];
  if (!val) {
    throw new Error(`❗️ Missing ${name} in .env – please add it.`);
  }
  return val;
}

// -----------------------------------------------------------------
// MAIN – deploy Semaphore
// -----------------------------------------------------------------
async function main() {
  // ----- Load constructor args -------------------------------------------------
  const treeDepthStr = process.env.TREE_DEPTH || requiredEnv("TREE_DEPTH");
  const treeDepth = Number(treeDepthStr);
  if (isNaN(treeDepth) || treeDepth <= 0) {
    throw new Error(`❌ Invalid TREE_DEPTH value: "${treeDepthStr}"`);
  }

  console.log("\n🚀 Deploying Semaphore with parameters:");
  console.log(`   treeDepth : ${treeDepth}`);

  // ----- Get the contract factory ---------------------------------------------
  const SemaphoreFactory = await ethers.getContractFactory("Semaphore");

  // ----- Deploy ---------------------------------------------------------------
  const semaphore = await SemaphoreFactory.deploy(treeDepth);

  // ----- Wait for the deployment to be mined (covers v5 & v6) -----------------
  if (typeof semaphore.deployed === "function") {
    // ethers v5 style
    await semaphore.deployed();
    console.log(`✅ Semaphore deployed at: ${semaphore.address}`);
  } else if (typeof semaphore.waitForDeployment === "function") {
    // ethers v6 style
    await semaphore.waitForDeployment();
    const addr = (semaphore.target ?? (await semaphore.getAddress()));
    console.log(`✅ Semaphore deployed at: ${addr}`);
  } else {
    throw new Error("Unable to determine deployment method for the contract instance.");
  }

  // -------------------------------------------------------------------------
  // OPTIONAL: write the address to a local file (uncomment if you want it)
  // -------------------------------------------------------------------------
     const fs = require("fs");
     const path = require("path");
     const outPath = path.resolve(__dirname, "..", ".semaphore-deploy");
     fs.writeFileSync(outPath, JSON.stringify({ address: semaphore.address }, null, 2));
     console.log(`📝 Deployment address saved to: ${outPath}`);
}

// ---------------------------------------------------------------------
// Run the script
// ---------------------------------------------------------------------
main()
  .catch((err) => {
    console.error("\n❌ Deployment failed:", err);
    process.exit(1);
  });
