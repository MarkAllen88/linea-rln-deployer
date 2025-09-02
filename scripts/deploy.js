// scripts/deploy.js (Standalone Node.js script)

import "dotenv/config";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

async function main() {
  console.log("🚀 Starting standalone deployment script...");

  // -------------------------------------------------------------------------
  // Load configuration from .env
  // -------------------------------------------------------------------------
  const rpcUrl = process.env.LINEA_SEPOLIA_RPC_URL;
  const privateKey = process.env.ETH_PRIVATE_KEY;
  const tokenAddress = process.env.STABLE_TOKEN_ADDRESS;

  if (!rpcUrl) throw new Error("❌ Missing LINEA_SEPOLIA_RPC_URL in .env");
  if (!privateKey) throw new Error("❌ Missing ETH_PRIVATE_KEY in .env");
  if (!tokenAddress) throw new Error("❌ Missing STABLE_TOKEN_ADDRESS in .env");

  // -------------------------------------------------------------------------
  // Connect to the blockchain
  // -------------------------------------------------------------------------
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  console.log(`\n🛰️ Deploying contracts with account: ${signer.address}`);

  // -------------------------------------------------------------------------
  // Safety check – make sure the deployer has at least a tiny amount of ETH
  // -------------------------------------------------------------------------
  const minBalance = ethers.parseUnits("0.001", "ether"); // 0.001 ETH ≈ 10 USD on testnet
  const balance = await provider.getBalance(signer.address);
  if (balance < minBalance) {
    console.error(
      `⚠️  Deployer balance (${ethers.formatEther(
        balance
      )} ETH) is below the safety threshold (${ethers.formatEther(
        minBalance
      )} ETH). Please fund the address via the Linea Sepolia faucet before proceeding.`
    );
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // Constructor arguments for RLN.sol
  // -------------------------------------------------------------------------
  const membershipDepositAmount = ethers.parseUnits("1", 18);
  const treeDepth = 20;
  const feePercentage = 100;
  const feeReceiver = signer.address;
  const depositToken = tokenAddress;

  // -------------------------------------------------------------------------
  // Load contract artifact (ABI + bytecode)
  // -------------------------------------------------------------------------
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
    throw new Error("❌ Contract artifact not found. Run 'npm run compile' first.");
  }

  const { abi, bytecode } = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  // -------------------------------------------------------------------------
  // OPTIONAL: Force a low gas price (uncomment if you really need it)
  // -------------------------------------------------------------------------
  // const feeData = await provider.getFeeData();
  // const txOverrides = { gasPrice: ethers.parseUnits("0.002", "gwei") };
  // console.log(
  //   `\n⛽ Overriding gas price to: ${ethers.formatUnits(
  //     txOverrides.gasPrice,
  //     "gwei"
  //   )} Gwei`
  // );

  // By default we let the node suggest the optimal price:
  const txOverrides = {};

  // -------------------------------------------------------------------------
  // Deploy the contract
  // -------------------------------------------------------------------------
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  console.log(" Deploying RLN contract...");

  const contract = await factory.deploy(
    membershipDepositAmount,
    treeDepth,
    feePercentage,
    feeReceiver,
    depositToken,
    txOverrides
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log(
    `\n✅ RLN contract deployed successfully to address: ${contractAddress}`
  );

  // -------------------------------------------------------------------------
  // Save the deployment address locally
  // -------------------------------------------------------------------------
  const deployInfo = { address: contractAddress };
  const deployFilePath = path.resolve(__dirname, "..", ".deploy");
  fs.writeFileSync(deployFilePath, JSON.stringify(deployInfo, null, 2));

  console.log(`📝 Deployment address saved to: ${deployFilePath}`);
}

// ---------------------------------------------------------------------------
// Run the script
// ---------------------------------------------------------------------------
main().catch((error) => {
  console.error("\n❌ Deployment failed:", error);
  process.exit(1);
});
