const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AfriYield Platform", function () {
  let stablecoin, oracle, lendingPool;
  let owner, farmer, lender;

  beforeEach(async function () {
    [owner, farmer, lender] = await ethers.getSigners();

    // Deploy contracts
    const MockStablecoin = await ethers.getContractFactory("MockStablecoin");
    stablecoin = await MockStablecoin.deploy();

    const AfriYieldOracle = await ethers.getContractFactory("AfriYieldOracle");
    oracle = await AfriYieldOracle.deploy();

    const AfriYieldLendingPool = await ethers.getContractFactory("AfriYieldLendingPool");
    lendingPool = await AfriYieldLendingPool.deploy(await stablecoin.getAddress());

    // Mint tokens for testing
    await stablecoin.mint(lender.address, ethers.parseEther("10000"));
    await stablecoin.mint(farmer.address, ethers.parseEther("1000"));
  });

  it("Should allow lender to deposit funds", async function () {
    const depositAmount = ethers.parseEther("1000");
    
    await stablecoin.connect(lender).approve(await lendingPool.getAddress(), depositAmount);
    await lendingPool.connect(lender).depositLenderFunds(depositAmount);
    
    expect(await lendingPool.lenderDeposits(lender.address)).to.equal(depositAmount);
  });

  it("Should allow farmer to request loan with good risk score", async function () {
    // Lender deposits first
    const depositAmount = ethers.parseEther("1000");
    await stablecoin.connect(lender).approve(await lendingPool.getAddress(), depositAmount);
    await lendingPool.connect(lender).depositLenderFunds(depositAmount);

    // Farmer requests loan
    const loanAmount = ethers.parseEther("100");
    const riskScore = 80;
    
    await lendingPool.connect(farmer).requestLoan(loanAmount, riskScore);
    
    const loan = await lendingPool.getLoanDetails(1);
    expect(loan.borrower).to.equal(farmer.address);
    expect(loan.amount).to.equal(loanAmount);
    expect(loan.isActive).to.be.true;
  });

  it("Should reject loan with low risk score", async function () {
    const loanAmount = ethers.parseEther("100");
    const lowRiskScore = 60;
    
    await expect(
      lendingPool.connect(farmer).requestLoan(loanAmount, lowRiskScore)
    ).to.be.revertedWith("Risk score too low");
  });

  it("Should allow loan repayment", async function () {
    // Setup: lender deposits, farmer gets loan
    const depositAmount = ethers.parseEther("1000");
    await stablecoin.connect(lender).approve(await lendingPool.getAddress(), depositAmount);
    await lendingPool.connect(lender).depositLenderFunds(depositAmount);

    const loanAmount = ethers.parseEther("100");
    await lendingPool.connect(farmer).requestLoan(loanAmount, 80);

    // Repay loan
    await stablecoin.connect(farmer).approve(await lendingPool.getAddress(), loanAmount);
    await lendingPool.connect(farmer).repayLoan(1);

    const loan = await lendingPool.getLoanDetails(1);
    expect(loan.isRepaid).to.be.true;
    expect(loan.isActive).to.be.false;
  });
});
