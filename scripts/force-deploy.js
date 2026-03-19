const hre = require("hardhat");

async function main() {
  console.log("Force deploying to", hre.network.name);
  
  const [signer] = await hre.ethers.getSigners();
  console.log("Deployer:", await signer.getAddress());
  
  try {
    const MockStablecoin = await hre.ethers.getContractFactory("MockStablecoin");
    
    // Manual gas settings
    const gasPrice = await hre.ethers.provider.getFeeData();
    console.log("Gas price:", gasPrice.gasPrice?.toString());
    
    const stablecoin = await MockStablecoin.deploy({
      gasLimit: 2000000,
      gasPrice: 50000000 // Very low gas price
    });
    
    console.log("Transaction sent, waiting...");
    await stablecoin.waitForDeployment();
    
    const address = await stablecoin.getAddress();
    console.log("SUCCESS! MockStablecoin deployed to:", address);
    
  } catch (error) {
    console.error("Error:", error.message);
    if (error.code) console.error("Error code:", error.code);
  }
}

main().catch(console.error);
