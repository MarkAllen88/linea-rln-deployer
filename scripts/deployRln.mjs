import hardhatPkg from "hardhat";
const { ethers } = hardhatPkg;

// ---------------------------------------------------------------------
// Helper: read env vars (fallback to process.env)
// ---------------------------------------------------------------------
const TEST_STABLE_TOKEN = process.env.TEST_STABLE_TOKEN ||
  "0x0x5ddc2B6825F7eb721b80F5F3976E2BD3F0074817";   // <-- replace if you forget to set .env

if (!TEST_STABLE_TOKEN || TEST_STABLE_TOKEN === "0x0x5ddc2B6825F7eb721b80F5F3976E2BD3F0074817") {
  console.error(
    "❌ ERROR: Please set TEST_STABLE_TOKEN in your .env file (or export it) before running the script."
  );
  process.exit(1);
}

// ---------------------------------------------------------------------
// Main deployment routine
// ---------------------------------------------------------------------
async function main() {
  // -------------------- Parameters (feel free to tweak) --------------------
  const membershipDepositAmount = ethers.parseUnits("1", 18); // 1 token (adjust decimals if needed)
  const treeDepth = 20;               // any > 0
  const feePercentage = 100;          // 1 % (100 basis points)
  const feeReceiver = "0x6C74a2E844B1066de7cbaf0A04714d9A9bD2d0E2"; // your address

  // -------------------- Deploy the RLN contract --------------------
  const RLNFactory = await ethers.getContractFactory("RLN");
  const rln = await RLNFactory.deploy(
    membershipDepositAmount,
    treeDepth,
    feePercentage,
    feeReceiver,
    TEST_STABLE_TOKEN
  );

  // In ethers v6 we wait for the deployment like this:
  await rln.waitForDeployment();

  // Get the final address (v6 uses getAddress())
  const rlnAddress = await rln.getAddress();

  console.log("\n✅ RLN deployed to:", rlnAddress);
  console.log("   Deposit token :", TEST_STABLE_TOKEN);
  console.log(
    "   Membership deposit :", ethers.formatUnits(membershipDepositAmount, 18)
  );
}

// ---------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
