// scripts/mintToRln.ts
import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  // ----- 1️⃣ Load env vars -------------------------------------------------
  const tokenAddr = process.env.STABLE_TOKEN_ADDRESS!;
  const rlnAddr   = "0x3bE1583D4Ec65B608582901E8539940c4ae1aFA7"; // <-- RLN address from deployment

  // ----- 2️⃣ Get signer (the same account you used for deployment) ----------
  const signer = (await ethers.getSigners())[0];

  // ----- 3️⃣ Attach to the TestStableToken contract ------------------------
  const token = await ethers.getContractAt("TestStableToken", tokenAddr, signer);

  // ----- 4️⃣ Amount to mint (same as membershipDeposit) --------------------
  // membershipDeposit = 1 token = 1e18 wei
  const amount = ethers.parseUnits("1", 18); // 1 whole token

  // ----- 5️⃣ Mint directly to the RLN contract -----------------------------
  const tx = await token.mint(rlnAddr, amount);
  console.log("⛽️ Mint tx sent, waiting for receipt...");
  const receipt = await tx.wait();

  console.log("✅ Minted", amount.toString(), "tokens to RLN contract");
  console.log("   Transaction hash :", receipt.transactionHash);
  console.log("   RLN contract      :", rlnAddr);
}

main().catch((err) => {
  console.error("❌ Mint failed:", err);
  process.exit(1);
});
