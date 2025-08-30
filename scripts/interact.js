// scripts/interact.js (Standalone Node.js script)

import "dotenv/config";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

async function main() {
  console.log("🚀 Running standalone interaction script...");

  const rpcUrl = process.env.LINEA_SEPOLIA_RPC_URL;
  if (!rpcUrl) {
    throw new Error("❌ Missing LINEA_SEPOLIA_RPC_URL in your .env file.");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  console.log(`���� Connected to network via RPC.`);
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  const artifactPath = path.resolve(__dirname, "..", "artifacts", "contracts", "RLN.sol", "RLN.json");
  if (!fs.existsSync(artifactPath)) {
    throw new Error("❌ Contract artifact not found. Please run 'npm run compile' first.");
  }
  const { abi: rlnAbi } = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  const deployInfoPath = path.resolve(__dirname, "..", ".deploy");
  if (!fs.existsSync(deployInfoPath)) {
    throw new Error("❌ .deploy file missing. Please run 'npm run deploy' first.");
  }
  const { address: rlnAddress } = JSON.parse(fs.readFileSync(deployInfoPath, "utf8"));
  
  console.log(`��� Interacting with RLN contract at: ${rlnAddress}`);

  const rln = new ethers.Contract(rlnAddress, rlnAbi, provider);

  try {
    console.log("\n⏳ Calling `treeDepth()`...");
    const treeDepthResult = await rln.treeDepth();
    console.log("��� Contract call for `treeDepth()` succeeded. Result:", treeDepthResult.toString());

    console.log("\n⏳ Calling `depositToken()`...");
    const tokenAddressResult = await rln.depositToken();
    console.log("✅ Contract call for `depositToken()` succeeded. Result:", tokenAddressResult);

  } catch (err) {
    console.error("❌ Contract call failed:", err.message);
  }
}

main().catch((error) => {
  console.error("\n💥 Script failed with error:", error);
  process.exit(1);
});

