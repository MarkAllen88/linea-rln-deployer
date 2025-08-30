const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RLN", function () {
  let rln, owner, addr1;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    const RLN = await ethers.getContractFactory("RLN");
    rln = await RLN.deploy(/* ctor args if any */);
    await rln.deployed();
  });

  it("should initialize with the correct token address", async () => {
    const token = await rln.stableToken(); // replace with your getter
    expect(token).to.equal(process.env.STABLE_TOKEN_ADDRESS);
  });

  // Add more tests for rate‑limiting logic, membership proofs, etc.
});
