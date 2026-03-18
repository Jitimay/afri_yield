const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Governance System", function () {
  let governance, lendingPool, stablecoin;
  let owner, voter1, voter2;

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();

    const MockStablecoin = await ethers.getContractFactory("MockStablecoin");
    stablecoin = await MockStablecoin.deploy();

    const AfriYieldLendingPool = await ethers.getContractFactory("AfriYieldLendingPool");
    lendingPool = await AfriYieldLendingPool.deploy(await stablecoin.getAddress());

    const AfriYieldGovernance = await ethers.getContractFactory("AfriYieldGovernance");
    governance = await AfriYieldGovernance.deploy(await lendingPool.getAddress());
  });

  it("Should create proposal", async function () {
    await governance.setVotingPower(voter1.address, 100);
    await governance.connect(voter1).createProposal("APY", 10, "Increase APY to 10%");
    
    const proposal = await governance.proposals(1);
    expect(proposal.parameter).to.equal("APY");
    expect(proposal.newValue).to.equal(10);
  });

  it("Should allow voting", async function () {
    await governance.setVotingPower(voter1.address, 100);
    await governance.connect(voter1).createProposal("APY", 10, "Increase APY");
    
    await governance.setVotingPower(voter2.address, 50);
    await governance.connect(voter2).vote(1, true);
    
    const proposal = await governance.proposals(1);
    expect(proposal.votesFor).to.equal(50);
  });
});
