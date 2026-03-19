const hre = require("hardhat");

async function main() {
  console.log("Deploying single contract to", hre.network.name);
  
  try {
    // Deploy MockStablecoin only
    console.log("\nDeploying MockStablecoin...");
    const MockStablecoin = await hre.ethers.getContractFactory("MockStablecoin");
    const stablecoin = await MockStablecoin.deploy();
    await stablecoin.waitForDeployment();
    const stablecoinAddress = await stablecoin.getAddress();
    console.log("MockStablecoin deployed to:", stablecoinAddress);
    
  } catch (error) {
    console.error("Deployment failed:", error.message);
  }
}

main().catch(console.error);
