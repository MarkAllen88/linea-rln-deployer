// scripts/checkEnv.mjs
import "dotenv/config";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function die(msg) {
  console.error("❌", msg);
  process.exit(1);
}

// 1️⃣ RPC
const rpc = process.env.LINEA_SEPOLIA_RPC_URL;
if (!rpc) die("LINEA_SEPOLIA_RPC_URL missing in .env");
const provider = new ethers.JsonRpcProvider(rpc);
console.log("✅ RPC URL OK");

// 2️⃣ Signer
const pk = process.env.DEPLOYER_PRIVATE_KEY;
if (!pk) die("DEPLOYER_PRIVATE_KEY missing");
const signer = new ethers.Wallet(pk, provider);
console.log("✅ Signer address:", signer.address);

// 3️⃣ Token
const tokenAddr = process.env.STABLE_TOKEN_ADDRESS;
if (!tokenAddr) die("STABLE_TOKEN_ADDRESS missing");
const tokenAbi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];
const token = new ethers.Contract(tokenAddr, tokenAbi, provider);
try {
  const [name, sym, dec] = await Promise.all([
    token.name(),
    token.symbol(),
    token.decimals(),
  ]);
  console.log(`✅ Token ${name} (${sym}) @ ${tokenAddr}, decimals=${dec}`);
} catch (e) {
  die(`Failed to talk to token contract: ${e}`);
}

// 4️⃣ RLN contract
let rlnAddr = process.env.RLN_CONTRACT_ADDRESS;
if (!rlnAddr) {
  // fallback: read from .deploy file
  const deployPath = path.resolve(__dirname, "..", ".deploy");
  if (fs.existsSync(deployPath)) {
    const { address } = JSON.parse(fs.readFileSync(deployPath, "utf8"));
    rlnAddr = address;
    console.log("ℹ️ RLN address taken from .deploy:", rlnAddr);
  } else {
    die("RLN_CONTRACT_ADDRESS missing and .deploy not found");
  }
}
const rlnAbi = ["function treeDepth() view returns (uint256)"];
const rln = new ethers.Contract(rlnAddr, rlnAbi, provider);
try {
  const depth = await rln.treeDepth();
  console.log(`✅ RLN contract @ ${rlnAddr}, treeDepth=${depth}`);
} catch (e) {
  die(`Failed to talk to RLN contract: ${e}`);
}

// 5️⃣ Chain ID
const net = await provider.getNetwork();
console.log(`✅ Connected to chainId ${net.chainId}`);
if (net.chainId !== Number(process.env.CHAIN_ID || 59141))
  console.warn(
    "⚠️ Chain ID in .env does not match RPC network – you may get a revert."
  );

process.exit(0);
