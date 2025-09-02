// scripts/checkNetwork.ts
// Works in an ESM‑project that uses Hardhat (CommonJS package)

import hardhat from "hardhat";          // default import gives the whole CommonJS export
const { ethers } = hardhat;             // extract the ethers helper

async function main() {
  const net = await ethers.provider.getNetwork();
  console.log("✅ Connected to network:");
  console.log(`   chainId: ${net.chainId}`);
  console.log(`   name   : ${net.name || "unknown"}`);
}

main().catch((err) => {
  console.error("❌ Error while checking network:", err);
  process.exit(1);
});
