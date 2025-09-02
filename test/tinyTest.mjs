// scripts/tinyTest.mjs
// ------------------------------------------------------------
// Tiny sanity‑check script for the RLN deployment
// ------------------------------------------------------------
import "dotenv/config";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

console.log("🔧 Running tinyTest.mjs");

// ---------------------------------------------------------------------
// 1️⃣ Load RPC URL & basic config
// ---------------------------------------------------------------------
const rpcUrl = process.env.LINEA_SEPOLIA_RPC_URL;
if (!rpcUrl) {
  console.error("❌ Missing LINEA_SEPOLIA_RPC_URL in .env");
  process.exit(1);
}
console.log("🔗 RPC URL:", rpcUrl);

// ---------------------------------------------------------------------
// 2️⃣ Provider (read‑only)
// ---------------------------------------------------------------------
const provider = new ethers.JsonRpcProvider(rpcUrl);
console.log("🛰️ Provider created");

// ---------------------------------------------------------------------
// 3️⃣ Load contract ABI
// ---------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const artifactPath = path.resolve(
  __dirname,
  "..",
  "artifacts",
  "contracts",
  "RLN.sol",
  "RLN.json"
);
if (!fs.existsSync(artifactPath)) {
  console.error(
    "❌ Artifact not found at:",
    artifactPath,
    "\nRun `npm run compile` (or `npx hardhat compile`) first."
  );
  process.exit(1);
}
const { abi } = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
console.log(`📦 ABI loaded (${abi.length} entries)`);

// ---------------------------------------------------------------------
// 4️⃣ Attach to the deployed contract
// ---------------------------------------------------------------------
const contractAddress = "0x0c75D496A1A81D81E3E94b78dCb096C70Efc4cF0";
console.log("🏷️ Contract address:", contractAddress);
const rlN = new ethers.Contract(contractAddress, abi, provider);

// ---------------------------------------------------------------------
// 5️⃣ Call a couple of view functions
// ---------------------------------------------------------------------
async function runChecks() {
  // Tree depth (we already know it’s 20, but we verify it)
  if (typeof rlN.treeDepth === "function") {
    const depth = await rlN.treeDepth();
    console.log("🔎 treeDepth =", depth.toString());
  } else {
    console.warn("⚠️ No treeDepth() getter found");
  }

  // Membership deposit amount (uint256, 18 decimals)
  if (typeof rlN.membershipDepositAmount === "function") {
    const amt = await rlN.membershipDepositAmount();
    console.log(
      "💰 membershipDepositAmount =",
      ethers.formatUnits(amt, 18),
      "tokens"
    );
  } else {
    console.warn("⚠️ No membershipDepositAmount() getter found");
  }

  console.log("✅ tinyTest completed successfully");
  process.exit(0);
}

runChecks().catch((err) => {
  console.error("❌ tinyTest failed:", err);
  process.exit(1);
});
