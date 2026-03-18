const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Decentralized Oracle", function () {
  let oracle;
  let owner, validator1, validator2, validator3, farmer;

  beforeEach(async function () {
    [owner, validator1, validator2, validator3, farmer] = await ethers.getSigners();

    const DecentralizedOracle = await ethers.getContractFactory("DecentralizedOracle");
    oracle = await DecentralizedOracle.deploy();

    await oracle.addValidator(validator1.address);
    await oracle.addValidator(validator2.address);
    await oracle.addValidator(validator3.address);
  });

  it("Should require multiple validators for score update", async function () {
    await oracle.connect(validator1).submitRiskScore(farmer.address, 85);
    await oracle.connect(validator2).submitRiskScore(farmer.address, 85);
    
    let score = await oracle.getRiskScore(farmer.address);
    expect(score).to.equal(0); // Not enough votes yet
    
    await oracle.connect(validator3).submitRiskScore(farmer.address, 85);
    score = await oracle.getRiskScore(farmer.address);
    expect(score).to.equal(85);
  });

  it("Should prevent double voting", async function () {
    await oracle.connect(validator1).submitRiskScore(farmer.address, 85);
    
    await expect(
      oracle.connect(validator1).submitRiskScore(farmer.address, 90)
    ).to.be.revertedWith("Already voted");
  });
});
