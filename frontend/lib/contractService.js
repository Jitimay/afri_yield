// Add this to frontend/lib/contractService.js
import { ethers } from 'ethers';

export class ContractService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
  }

  async connect() {
    if (typeof window.ethereum !== 'undefined') {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Check if on correct network
      const network = await this.provider.getNetwork();
      if (network.chainId !== 420420417n) {
        throw new Error('Please switch to Polkadot Hub (Paseo) network');
      }
      
      return true;
    }
    throw new Error('MetaMask not found');
  }

  // Get PAS balance
  async getPASBalance(address) {
    return await this.provider.getBalance(address);
  }

  // Get AUSD balance
  async getAUSDBalance(address) {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_STABLECOIN_ADDRESS,
      ['function balanceOf(address) view returns (uint256)'],
      this.provider
    );
    return await contract.balanceOf(address);
  }

  // Deposit PAS collateral
  async depositPASCollateral(amount) {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_LENDING_POOL_ADDRESS,
      ['function depositDOTCollateral() payable'],
      this.signer
    );
    
    return await contract.depositDOTCollateral({ 
      value: ethers.parseEther(amount.toString()) 
    });
  }

  // Request loan with AUSD
  async requestLoan(amount, riskScore) {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_LENDING_POOL_ADDRESS,
      ['function requestLoan(uint256,uint256)'],
      this.signer
    );
    
    return await contract.requestLoan(
      ethers.parseEther(amount.toString()),
      riskScore
    );
  }

  // Deposit AUSD as lender
  async depositAUSD(amount) {
    // First approve AUSD spending
    const ausdContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_STABLECOIN_ADDRESS,
      ['function approve(address,uint256) returns (bool)'],
      this.signer
    );
    
    await ausdContract.approve(
      process.env.NEXT_PUBLIC_LENDING_POOL_ADDRESS,
      ethers.parseEther(amount.toString())
    );

    // Then deposit
    const lendingContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_LENDING_POOL_ADDRESS,
      ['function depositLenderFunds(uint256)'],
      this.signer
    );
    
    return await lendingContract.depositLenderFunds(
      ethers.parseEther(amount.toString())
    );
  }

  // Mint AUSD for testing
  async mintAUSD(amount) {
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_STABLECOIN_ADDRESS,
      ['function mint(address,uint256)'],
      this.signer
    );
    
    const address = await this.signer.getAddress();
    return await contract.mint(address, ethers.parseEther(amount.toString()));
  }
}
