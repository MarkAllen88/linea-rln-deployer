import hardhat from "hardhat";
const { ethers } = hardhat;               // works with both v5 and v6

async function main() {
  // ----------- load env vars (same as before) ------------
  const token = process.env.STABLE_TOKEN_ADDRESS!;
  const depositStr = process.env.MEMBERSHIP_DEPOSIT!;
  const treeDepthStr = process.env.TREE_DEPTH!;
  const feePctStr = process.env.FEE_PERCENTAGE!;
  const feeReceiver = process.env.FEE_RECEIVER!;

  if (!token) throw new Error("STABLE_TOKEN_ADDRESS not set");
  if (!depositStr) throw new Error("MEMBERSHIP_DEPOSIT not set");
  if (!treeDepthStr) throw new Error("TREE_DEPTH not set");
  if (!feePctStr) throw new Error("FEE_PERCENTAGE not set");
  if (!feeReceiver) throw new Error("FEE_RECEIVER not set");

  // ethers v5: ethers.utils.parseUnits
  // ethers v6: ethers.parseUnits
  const membershipDeposit = (ethers as any).parseUnits
    ? (ethers as any).parseUnits(depositStr, 18)   // v6
    : (ethers as any).utils.parseUnits(depositStr, 18); // v5 fallback

  const treeDepth = Number(treeDepthStr);
  const feePercentage = Number(feePctStr);

  console.log("🚀 Deploying RLN with parameters:");
  console.log(`   token               : ${token}`);
  console.log(`   membershipDeposit   : ${membershipDeposit.toString()}`);
  console.log(`   treeDepth           : ${treeDepth}`);
  console.log(`   feePercentage (bps) : ${feePercentage}`);
  console.log(`   feeReceiver         : ${feeReceiver}`);

  // ----------- deploy ----------
  const RLNFactory = await ethers.getContractFactory("RLN");
  const rln = await RLNFactory.deploy(
    membershipDeposit,
    treeDepth,
    feePercentage,
    feeReceiver,
    token
  );

  // ==== NEW PART: wait for deployment ====
  // ethers v5
  if ((rln as any).deployed) {
    await (rln as any).deployed();
    console.log("✅ RLN deployed at:", (rln as any).address);
  }
  // ethers v6
  else if ((rln as any).waitForDeployment) {
    await (rln as any).waitForDeployment();
    // address is in .target (or you can call .getAddress())
    const addr = (rln as any).target ?? (await (rln as any).getAddress());
    console.log("✅ RLN deployed at:", addr);
  } else {
    throw new Error("Unable to determine deployment method for the contract instance.");
  }
}

// ----------------------------------------------------------------------
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
