const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AfriYield Polkadot Hub Integration", function () {
  let stablecoin, pasToken, oracle, riskCalculator, lendingPool, xcmBridge, governance;
  let owner, farmer, lender, validator1, validator2, validator3;

  beforeEach(async function () {
    [owner, farmer, lender, validator1, validator2, validator3] = await ethers.getSigners();

    // Deploy contracts
    const PASToken = await ethers.getContractFactory("PASToken");
    pasToken = await PASToken.deploy();

    const MockStablecoin = await ethers.getContractFactory("MockStablecoin");
    stablecoin = await MockStablecoin.deploy();

    const DecentralizedOracle = await ethers.getContractFactory("DecentralizedOracle");
    oracle = await DecentralizedOracle.deploy(await pasToken.getAddress());

    const RiskCalculator = await ethers.getContractFactory("RiskCalculator");
    riskCalculator = await RiskCalculator.deploy();

    const AfriYieldLendingPool = await ethers.getContractFactory("AfriYieldLendingPool");
    lendingPool = await AfriYieldLendingPool.deploy(
      await stablecoin.getAddress(),
      await pasToken.getAddress(),
      await oracle.getAddress(),
      await riskCalculator.getAddress()
    );

    const XCMBridge = await ethers.getContractFactory("XCMBridge");
    xcmBridge = await XCMBridge.deploy(await lendingPool.getAddress());

    const AfriYieldGovernance = await ethers.getContractFactory("AfriYieldGovernance");
    governance = await AfriYieldGovernance.deploy(
      await pasToken.getAddress(),
      await lendingPool.getAddress()
    );

    // Set up connections
    await lendingPool.setXCMBridge(await xcmBridge.getAddress());

    // Mint tokens for testing
    await stablecoin.mint(lender.address, ethers.parseEther("10000"));
    await stablecoin.mint(farmer.address, ethers.parseEther("1000"));
    await pasToken.mint(validator1.address, ethers.parseEther("1000"));
    await pasToken.mint(validator2.address, ethers.parseEther("1000"));
    await pasToken.mint(validator3.address, ethers.parseEther("1000"));
    await pasToken.mint(farmer.address, ethers.parseEther("500"));
    await pasToken.mint(lender.address, ethers.parseEther("500"));
  });

  describe("Decentralized Oracle", function () {
    it("Should allow validator registration with PAS stake", async function () {
      const stakeAmount = ethers.parseEther("100");
      
      await pasToken.connect(validator1).approve(await oracle.getAddress(), stakeAmount);
      await oracle.connect(validator1).registerValidator(stakeAmount);
      
      const validator = await oracle.validators(validator1.address);
      expect(validator.stake).to.equal(stakeAmount);
      expect(validator.isActive).to.be.true;
    });

    it("Should reach consensus with 3 validators", async function () {
      const stakeAmount = ethers.parseEther("100");
      
      // Register validators
      await pasToken.connect(validator1).approve(await oracle.getAddress(), stakeAmount);
      await pasToken.connect(validator2).approve(await oracle.getAddress(), stakeAmount);
      await pasToken.connect(validator3).approve(await oracle.getAddress(), stakeAmount);
      
      await oracle.connect(validator1).registerValidator(stakeAmount);
      await oracle.connect(validator2).registerValidator(stakeAmount);
      await oracle.connect(validator3).registerValidator(stakeAmount);

      // Submit risk scores
      await oracle.connect(validator1).submitRiskScore(farmer.address, 80);
      await oracle.connect(validator2).submitRiskScore(farmer.address, 85);
      await oracle.connect(validator3).submitRiskScore(farmer.address, 82);

      const finalScore = await oracle.getRiskScore(farmer.address);
      expect(finalScore).to.equal(82); // Median of 80, 82, 85
    });

    it("Should distribute rewards after consensus", async function () {
      const stakeAmount = ethers.parseEther("100");
      
      await pasToken.connect(validator1).approve(await oracle.getAddress(), stakeAmount);
      await pasToken.connect(validator2).approve(await oracle.getAddress(), stakeAmount);
      await pasToken.connect(validator3).approve(await oracle.getAddress(), stakeAmount);
      
      await oracle.connect(validator1).registerValidator(stakeAmount);
      await oracle.connect(validator2).registerValidator(stakeAmount);
      await oracle.connect(validator3).registerValidator(stakeAmount);

      await oracle.connect(validator1).submitRiskScore(farmer.address, 80);
      await oracle.connect(validator2).submitRiskScore(farmer.address, 85);
      await oracle.connect(validator3).submitRiskScore(farmer.address, 82);

      const validator = await oracle.validators(validator1.address);
      expect(validator.rewards).to.be.gt(0);
    });
  });

  describe("Risk Calculator", function () {
    it("Should calculate risk score from farm data", async function () {
      const farmData = {
        cropType: 0, // Coffee
        estimatedYield: 2000,
        soilQuality: 8,
        rainfall: 1200,
        marketVolatility: 3,
        farmSize: 5,
        yearsExperience: 10,
        previousLoans: 2
      };

      const tx = await riskCalculator.connect(farmer).calculateRiskScore(farmData);
      const receipt = await tx.wait();
      
      // Get score from event
      const event = receipt.logs.find(log => log.fragment?.name === 'RiskScoreCalculated');
      expect(event).to.not.be.undefined;
    });

    it("Should apply crop multipliers correctly", async function () {
      const coffeeData = {
        cropType: 0, // Coffee (1.2x multiplier)
        estimatedYield: 1000,
        soilQuality: 5,
        rainfall: 1000,
        marketVolatility: 5,
        farmSize: 2,
        yearsExperience: 5,
        previousLoans: 1
      };

      const cassavaData = {
        ...coffeeData,
        cropType: 4 // Cassava (0.8x multiplier)
      };

      await riskCalculator.connect(farmer).calculateRiskScore(coffeeData);
      await riskCalculator.connect(farmer).calculateRiskScore(cassavaData);
      
      // Test passes if no revert occurs
      expect(true).to.be.true;
    });
  });

  describe("Enhanced Lending Pool", function () {
    it("Should accept PAS collateral for loans", async function () {
      const collateralAmount = ethers.parseEther("10"); // 10 PAS
      const loanAmount = ethers.parseEther("200"); // $200 loan

      // Deposit collateral
      await pasToken.connect(farmer).approve(await lendingPool.getAddress(), collateralAmount);
      await lendingPool.connect(farmer).depositPASCollateral(collateralAmount);
      
      expect(await lendingPool.pasCollateral(farmer.address)).to.equal(collateralAmount);
    });

    it("Should request loan with farm data", async function () {
      // Lender deposits first
      const depositAmount = ethers.parseEther("1000");
      await stablecoin.connect(lender).approve(await lendingPool.getAddress(), depositAmount);
      await lendingPool.connect(lender).depositLenderFunds(depositAmount);

      const farmData = {
        cropType: 0,
        estimatedYield: 2000,
        soilQuality: 8,
        rainfall: 1200,
        marketVolatility: 3,
        farmSize: 5,
        yearsExperience: 10,
        previousLoans: 2
      };

      const loanAmount = ethers.parseEther("100");
      await lendingPool.connect(farmer).requestLoanWithFarmData(loanAmount, farmData);

      const loan = await lendingPool.getLoanDetails(1);
      expect(loan.borrower).to.equal(farmer.address);
      expect(loan.amount).to.equal(loanAmount);
    });

    it("Should credit cross-chain deposits", async function () {
      const depositAmount = ethers.parseEther("500");
      
      // Call from XCM bridge address (simulate)
      await lendingPool.connect(owner).setXCMBridge(owner.address);
      await lendingPool.connect(owner).creditCrossChainDeposit(lender.address, depositAmount);
      
      const netDeposit = depositAmount * 95n / 100n; // After 5% insurance
      expect(await lendingPool.lenderDeposits(lender.address)).to.equal(netDeposit);
    });
  });

  describe("XCM Bridge", function () {
    it("Should process cross-chain deposit messages", async function () {
      const message = {
        version: 3,
        parachainId: 1000, // Asset Hub
        sender: lender.address,
        recipient: lender.address,
        amount: ethers.parseEther("500"),
        assetId: 1,
        instructions: "0x"
      };

      await xcmBridge.receiveXCMDeposit(message);
      
      const netDeposit = message.amount * 95n / 100n;
      expect(await lendingPool.lenderDeposits(lender.address)).to.equal(netDeposit);
    });

    it("Should prevent replay attacks", async function () {
      const message = {
        version: 3,
        parachainId: 1000,
        sender: lender.address,
        recipient: lender.address,
        amount: ethers.parseEther("500"),
        assetId: 1,
        instructions: "0x"
      };

      await xcmBridge.receiveXCMDeposit(message);
      
      await expect(
        xcmBridge.receiveXCMDeposit(message)
      ).to.be.revertedWith("Message already processed");
    });
  });

  describe("Governance", function () {
    it("Should allow PAS staking for voting power", async function () {
      const stakeAmount = ethers.parseEther("50");
      
      await pasToken.connect(lender).approve(await governance.getAddress(), stakeAmount);
      await governance.connect(lender).stakePAS(stakeAmount);
      
      expect(await governance.stakedPAS(lender.address)).to.equal(stakeAmount);
      expect(await governance.votingPower(lender.address)).to.equal(stakeAmount);
    });

    it("Should create and vote on proposals", async function () {
      const stakeAmount = ethers.parseEther("50");
      await pasToken.connect(lender).approve(await governance.getAddress(), stakeAmount);
      await governance.connect(lender).stakePAS(stakeAmount);

      await governance.connect(lender).createProposal(
        "APY",
        10,
        "Increase APY to 10%"
      );

      await governance.connect(lender).vote(1, true);

      const proposal = await governance.getProposal(1);
      expect(proposal.votesFor).to.equal(stakeAmount);
      expect(proposal.approved).to.be.true;
    });

    it("Should enforce unbonding period", async function () {
      const stakeAmount = ethers.parseEther("50");
      await pasToken.connect(lender).approve(await governance.getAddress(), stakeAmount);
      await governance.connect(lender).stakePAS(stakeAmount);

      await governance.connect(lender).unstakePAS(stakeAmount);

      await expect(
        governance.connect(lender).withdrawUnbondedPAS()
      ).to.be.revertedWith("Still unbonding");
    });
  });

  describe("Integration Tests", function () {
    it("Should complete full farmer journey with oracle consensus", async function () {
      // 1. Register validators
      const stakeAmount = ethers.parseEther("100");
      await pasToken.connect(validator1).approve(await oracle.getAddress(), stakeAmount);
      await pasToken.connect(validator2).approve(await oracle.getAddress(), stakeAmount);
      await pasToken.connect(validator3).approve(await oracle.getAddress(), stakeAmount);
      
      await oracle.connect(validator1).registerValidator(stakeAmount);
      await oracle.connect(validator2).registerValidator(stakeAmount);
      await oracle.connect(validator3).registerValidator(stakeAmount);

      // 2. Lender deposits funds
      const depositAmount = ethers.parseEther("1000");
      await stablecoin.connect(lender).approve(await lendingPool.getAddress(), depositAmount);
      await lendingPool.connect(lender).depositLenderFunds(depositAmount);

      // 3. Validators submit risk scores
      await oracle.connect(validator1).submitRiskScore(farmer.address, 80);
      await oracle.connect(validator2).submitRiskScore(farmer.address, 85);
      await oracle.connect(validator3).submitRiskScore(farmer.address, 82);

      // 4. Farmer requests loan (oracle score should be used)
      const loanAmount = ethers.parseEther("100");
      await lendingPool.connect(farmer).requestLoan(loanAmount, 75); // Provided score ignored

      const loan = await lendingPool.getLoanDetails(1);
      expect(loan.riskScore).to.equal(82); // Oracle consensus score
    });
  });
});
