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

  // Deploy AfriYieldOracle
  console.log("\n2. Deploying AfriYieldOracle...");
  const AfriYieldOracle = await hre.ethers.getContractFactory("AfriYieldOracle");
  const oracle = await AfriYieldOracle.deploy();
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("AfriYieldOracle deployed to:", oracleAddress);

  // Deploy AfriYieldLendingPool
  console.log("\n3. Deploying AfriYieldLendingPool...");
  const AfriYieldLendingPool = await hre.ethers.getContractFactory("AfriYieldLendingPool");
  const lendingPool = await AfriYieldLendingPool.deploy(stablecoinAddress);
  await lendingPool.waitForDeployment();
  const lendingPoolAddress = await lendingPool.getAddress();
  console.log("AfriYieldLendingPool deployed to:", lendingPoolAddress);

  // Save deployment addresses
  const deployments = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contracts: {
      MockStablecoin: stablecoinAddress,
      AfriYieldOracle: oracleAddress,
      AfriYieldLendingPool: lendingPoolAddress
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
  console.log("AfriYieldOracle:", oracleAddress);
  console.log("AfriYieldLendingPool:", lendingPoolAddress);
  console.log("========================\n");

  console.log("🎉 Deployment complete!");
  console.log("\nNext steps:");
  console.log("1. Update frontend/.env with these contract addresses");
  console.log("2. Verify contracts on block explorer (if on testnet)");
  console.log("3. Test contract interactions");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
