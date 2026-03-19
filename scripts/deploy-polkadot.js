const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment to", hre.network.name);
  
  // Deploy MockStablecoin
  console.log("\n1. Deploying MockStablecoin...");
  const MockStablecoin = await hre.ethers.getContractFactory("MockStablecoin");
  const stablecoin = await MockStablecoin.deploy();
  await stablecoin.waitForDeployment();
  const stablecoinAddress = await stablecoin.getAddress();
  console.log("MockStablecoin deployed to:", stablecoinAddress);

  // Deploy DecentralizedOracle
  console.log("\n2. Deploying DecentralizedOracle...");
  const DecentralizedOracle = await hre.ethers.getContractFactory("DecentralizedOracle");
  const oracle = await DecentralizedOracle.deploy();
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("DecentralizedOracle deployed to:", oracleAddress);

  // Deploy RiskCalculator
  console.log("\n3. Deploying RiskCalculator...");
  const RiskCalculator = await hre.ethers.getContractFactory("RiskCalculator");
  const riskCalculator = await RiskCalculator.deploy();
  await riskCalculator.waitForDeployment();
  const riskCalculatorAddress = await riskCalculator.getAddress();
  console.log("RiskCalculator deployed to:", riskCalculatorAddress);

  // Deploy AfriYieldLendingPool
  console.log("\n4. Deploying AfriYieldLendingPool...");
  const AfriYieldLendingPool = await hre.ethers.getContractFactory("AfriYieldLendingPool");
  const lendingPool = await AfriYieldLendingPool.deploy(
    stablecoinAddress,
    oracleAddress,
    riskCalculatorAddress
  );
  await lendingPool.waitForDeployment();
  const lendingPoolAddress = await lendingPool.getAddress();
  console.log("AfriYieldLendingPool deployed to:", lendingPoolAddress);

  // Deploy XCMBridge
  console.log("\n5. Deploying XCMBridge...");
  const XCMBridge = await hre.ethers.getContractFactory("XCMBridge");
  const xcmBridge = await XCMBridge.deploy(lendingPoolAddress);
  await xcmBridge.waitForDeployment();
  const xcmBridgeAddress = await xcmBridge.getAddress();
  console.log("XCMBridge deployed to:", xcmBridgeAddress);

  // Deploy AfriYieldGovernance
  console.log("\n6. Deploying AfriYieldGovernance...");
  const AfriYieldGovernance = await hre.ethers.getContractFactory("AfriYieldGovernance");
  const governance = await AfriYieldGovernance.deploy(lendingPoolAddress);
  await governance.waitForDeployment();
  const governanceAddress = await governance.getAddress();
  console.log("AfriYieldGovernance deployed to:", governanceAddress);

  // Set up contract connections
  console.log("\n7. Setting up contract connections...");
  await lendingPool.setXCMBridge(xcmBridgeAddress);
  console.log("✓ XCM Bridge connected to Lending Pool");

  // Save deployment addresses
  const deployments = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contracts: {
      MockStablecoin: stablecoinAddress,
      DecentralizedOracle: oracleAddress,
      RiskCalculator: riskCalculatorAddress,
      AfriYieldLendingPool: lendingPoolAddress,
      XCMBridge: xcmBridgeAddress,
      AfriYieldGovernance: governanceAddress
    },
    timestamp: new Date().toISOString()
  };

  const deploymentsPath = path.join(__dirname, "..", "deployments.json");
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log("\n✅ Deployment addresses saved to deployments.json");

  // Print summary
  console.log("\n📋 Deployment Summary:");
  console.log("========================");
  console.log("Network:", hre.network.name);
  console.log("MockStablecoin:", stablecoinAddress);
  console.log("DecentralizedOracle:", oracleAddress);
  console.log("RiskCalculator:", riskCalculatorAddress);
  console.log("AfriYieldLendingPool:", lendingPoolAddress);
  console.log("XCMBridge:", xcmBridgeAddress);
  console.log("AfriYieldGovernance:", governanceAddress);
  console.log("========================\n");

  console.log("🎉 Deployment complete!");
  console.log("\nNext steps:");
  console.log("1. Update frontend/.env with these contract addresses");
  console.log("2. Verify contracts on block explorer");
  console.log("3. Register validators for decentralized oracle");
  console.log("4. Test cross-chain functionality");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
