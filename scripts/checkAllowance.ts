import { ethers } from "hardhat";

async function main() {
  const tokenAddr = "0x5ddc2B6825F7eb721b80F5F3976E2BD3F0074817";
  const rlnAddr   = "0xA4d36463b12DaAbc29d114B780f1c71A7293eF7D";

  // Minimal ABI – exactly the interface you posted
  const abi = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  const token = await ethers.getContractAt(abi, tokenAddr);
  const [signer] = await ethers.getSigners();

  const allowance = await token.allowance(signer.address, rlnAddr);
  const balance   = await token.balanceOf(signer.address);
  const dec       = await token.decimals();

  console.log(`Signer: ${signer.address}`);
  console.log(`Balance: ${ethers.formatUnits(balance, dec)} tokens`);
  console.log(`Allowance for RLN: ${ethers.formatUnits(allowance, dec)} tokens`);
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
