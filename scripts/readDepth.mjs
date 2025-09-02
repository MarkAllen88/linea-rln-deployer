/**
 * readDepth.mjs – read a public view function from the RLN contract
 * on Linea Sepolia.  This file is written as an ES‑module because the
 * project has "type": "module" in package.json.
 */

import "dotenv/config";                     // loads .env automatically
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------
// 1️⃣ Show that the script started
// ---------------------------------------------------------------------
console.log("🔎 readDepth.mjs is being executed");

// ---------------------------------------------------------------------
// 2️⃣ Load the RPC URL from .env
// ---------------------------------------------------------------------
const rpcUrl = process.env.LINEA_SEPOLIA_RPC_URL;
if (!rpcUrl) {
  console.error("❌ Missing LINEA_SEPOLIA_RPC_URL in .env");
  process.exit(1);
}
console.log("🔗 RPC URL:", rpcUrl);

// ---------------------------------------------------------------------
// 3️⃣ Create an ethers provider (read‑only)
// ---------------------------------------------------------------------
const provider = new ethers.JsonRpcProvider(rpcUrl);
console.log("🛰️ Provider created");

// ---------------------------------------------------------------------
// 4️⃣ Load the contract ABI from the Hardhat artifact
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
// 5️⃣ Attach to the deployed contract
// ---------------------------------------------------------------------
const contractAddress = "0x0c75D496A1A81D81E3E94b78dCb096C70Efc4cF0";
console.log("🏷️ Contract address:", contractAddress);

const rlN = new ethers.Contract(contractAddress, abi, provider);

// ---------------------------------------------------------------------
// 6️⃣ Call a view function (treeDepth or similar)
// ---------------------------------------------------------------------
async function readDepth() {
  // Try the most common getter name first
  if (typeof rlN.treeDepth === "function") {
    const depth = await rlN.treeDepth();
    console.log("🔎 Tree depth =", depth.toString());
    return;
  }

  // Fallback: look for any public uint256 that sounds like depth
  const candidates = ["depth", "treeDepth", "maxDepth"];
  for (const name of candidates) {
    if (typeof rlN[name] === "function") {
      const val = await rlN[name]();
      console.log(`🔎 ${name} =`, val.toString());
      return;
    }
  }

  console.warn(
    "⚠️ No `treeDepth` (or similar) view function found on the contract."
  );
  console.log("Available read‑only functions:");
  console.log(
    Object.keys(rlN.interface.functions).filter((fn) => !fn.includes("("))
  );
}

// ---------------------------------------------------------------------
// 7️⃣ Execute
// ---------------------------------------------------------------------
await readDepth();

console.log("✅ Script finished");
process.exit(0);
