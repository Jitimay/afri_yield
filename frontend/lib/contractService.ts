import { ethers } from 'ethers';

// Contract ABIs (simplified - will be replaced with actual ABIs after compilation)
const LENDING_POOL_ABI = [
  "function depositLenderFunds(uint256 amount) external",
  "function requestLoan(uint256 amount, uint256 riskScore) external",
  "function repayLoan(uint256 loanId) external",
  "function withdrawFunds(uint256 amount) external",
  "function calculateYield(address lender) external view returns (uint256)",
  "function getLoanDetails(uint256 loanId) external view returns (tuple(address borrower, uint256 amount, uint256 riskScore, uint256 timestamp, uint256 dueDate, bool isActive, bool isRepaid))",
  "function getAllLoans() external view returns (tuple(address borrower, uint256 amount, uint256 riskScore, uint256 timestamp, uint256 dueDate, bool isActive, bool isRepaid)[])",
  "function getPoolStats() external view returns (uint256 totalDeposits, uint256 totalLoans, uint256 availableLiquidity, uint256 activeLoansCount)",
  "function getBorrowerLoans(address borrower) external view returns (uint256[])",
  "event LenderDeposit(address indexed lender, uint256 amount)",
  "event LoanApproved(uint256 indexed loanId, address indexed borrower, uint256 amount)",
  "event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount)"
];

const STABLECOIN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function mint(address to, uint256 amount) external"
];

const ORACLE_ABI = [
  "function updateRiskScore(address farmer, uint256 score) external",
  "function getRiskScore(address farmer) external view returns (uint256)"
];

export interface Loan {
  borrower: string;
  amount: bigint;
  riskScore: number;
  timestamp: bigint;
  dueDate: bigint;
  isActive: boolean;
  isRepaid: boolean;
}

export interface PoolStats {
  totalDeposits: bigint;
  totalLoans: bigint;
  availableLiquidity: bigint;
  activeLoansCount: bigint;
}

export class ContractService {
  private provider: ethers.BrowserProvider;
  private signer: ethers.Signer | null = null;
  private lendingPool: ethers.Contract | null = null;
  private stablecoin: ethers.Contract | null = null;
  private oracle: ethers.Contract | null = null;
  private readonly POLKADOT_HUB_CHAIN_ID = BigInt(420420417);

  constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    } else {
      throw new Error('No Ethereum provider found');
    }
  }

  private async verifyNetwork(): Promise<void> {
    const network = await this.provider.getNetwork();
    if (network.chainId !== this.POLKADOT_HUB_CHAIN_ID) {
      throw new Error(
        `Wrong network detected. Please switch to Polkadot Hub.\n` +
        `Expected Chain ID: ${this.POLKADOT_HUB_CHAIN_ID}\n` +
        `Current Chain ID: ${network.chainId}\n\n` +
        `To add Polkadot Hub to your wallet:\n` +
        `- Network Name: Polkadot Hub\n` +
        `- RPC URL: ${process.env.NEXT_PUBLIC_RPC_URL || 'https://polkadot-hub-rpc.polkadot.io'}\n` +
        `- Chain ID: 420420417\n` +
        `- Currency Symbol: DOT`
      );
    }
  }

  async initialize() {
    try {
      // Verify we're on Polkadot Hub
      await this.verifyNetwork();
      
      this.signer = await this.provider.getSigner();
      
      const lendingPoolAddress = process.env.NEXT_PUBLIC_LENDING_POOL_ADDRESS;
      const stablecoinAddress = process.env.NEXT_PUBLIC_STABLECOIN_ADDRESS;
      const oracleAddress = process.env.NEXT_PUBLIC_ORACLE_ADDRESS;

      if (!lendingPoolAddress || !stablecoinAddress || !oracleAddress) {
        throw new Error(
          'Contract addresses not configured. Please ensure the contracts are deployed to Polkadot Hub and the environment variables are set:\n' +
          '- NEXT_PUBLIC_LENDING_POOL_ADDRESS\n' +
          '- NEXT_PUBLIC_STABLECOIN_ADDRESS\n' +
          '- NEXT_PUBLIC_ORACLE_ADDRESS'
        );
      }

      this.lendingPool = new ethers.Contract(lendingPoolAddress, LENDING_POOL_ABI, this.signer);
      this.stablecoin = new ethers.Contract(stablecoinAddress, STABLECOIN_ABI, this.signer);
      this.oracle = new ethers.Contract(oracleAddress, ORACLE_ABI, this.signer);
    } catch (error: any) {
      if (error.code === 'NETWORK_ERROR') throw new Error('Network connection failed. Please check your internet connection and RPC endpoint.');
      if (error.code === 'UNSUPPORTED_OPERATION') throw new Error('Wallet not connected. Please connect your wallet to continue.');
      throw error;
    }
  }

  // Deposit and withdrawal methods
  async depositFunds(amount: bigint): Promise<ethers.ContractTransactionResponse> {
    await this.verifyNetwork();
    if (!this.stablecoin || !this.lendingPool) throw new Error('Contracts not initialized');
    
    try {
      // Approve spending
      const approveTx = await this.stablecoin.approve(await this.lendingPool.getAddress(), amount);
      await approveTx.wait();
      
      // Deposit
      const depositTx = await this.lendingPool.depositLenderFunds(amount);
      return depositTx;
    } catch (error: any) {
      if (error.code === 'ACTION_REJECTED') throw new Error('Transaction rejected by user');
      if (error.message?.includes('insufficient')) throw new Error('Insufficient balance');
      throw new Error(`Deposit failed: ${error.message}`);
    }
  }

  async withdrawFunds(amount: bigint): Promise<ethers.ContractTransactionResponse> {
    await this.verifyNetwork();
    if (!this.lendingPool) throw new Error('Contracts not initialized');
    return await this.lendingPool.withdrawFunds(amount);
  }

  // Loan methods
  async requestLoan(amount: bigint, riskScore: number): Promise<ethers.ContractTransactionResponse> {
    await this.verifyNetwork();
    if (!this.lendingPool) throw new Error('Contracts not initialized');
    
    try {
      return await this.lendingPool.requestLoan(amount, riskScore);
    } catch (error: any) {
      if (error.code === 'ACTION_REJECTED') throw new Error('Transaction rejected by user');
      if (error.message?.includes('Risk score too low')) throw new Error('Risk score must be ≥70');
      if (error.message?.includes('Insufficient liquidity')) throw new Error('Not enough funds in pool');
      if (error.message?.includes('Loan amount')) throw new Error('Amount must be 50-500 AUSD');
      throw new Error(`Loan request failed: ${error.message}`);
    }
  }

  async repayLoan(loanId: number): Promise<ethers.ContractTransactionResponse> {
    await this.verifyNetwork();
    if (!this.stablecoin || !this.lendingPool) throw new Error('Contracts not initialized');
    
    // Get loan details to know amount
    const loan = await this.getLoanDetails(loanId);
    
    // Approve spending
    const approveTx = await this.stablecoin.approve(await this.lendingPool.getAddress(), loan.amount);
    await approveTx.wait();
    
    // Repay
    const repayTx = await this.lendingPool.repayLoan(loanId);
    return repayTx;
  }

  async getLoanDetails(loanId: number): Promise<Loan> {
    if (!this.lendingPool) throw new Error('Contracts not initialized');
    const loan = await this.lendingPool.getLoanDetails(loanId);
    return {
      borrower: loan[0],
      amount: loan[1],
      riskScore: Number(loan[2]),
      timestamp: loan[3],
      dueDate: loan[4],
      isActive: loan[5],
      isRepaid: loan[6]
    };
  }

  async getAllLoans(): Promise<Loan[]> {
    if (!this.lendingPool) throw new Error('Contracts not initialized');
    const loans = await this.lendingPool.getAllLoans();
    return loans.map((loan: any) => ({
      borrower: loan[0],
      amount: loan[1],
      riskScore: Number(loan[2]),
      timestamp: loan[3],
      dueDate: loan[4],
      isActive: loan[5],
      isRepaid: loan[6]
    }));
  }

  // Pool statistics methods
  async getPoolStats(): Promise<PoolStats> {
    if (!this.lendingPool) throw new Error('Contracts not initialized');
    const stats = await this.lendingPool.getPoolStats();
    return {
      totalDeposits: stats[0],
      totalLoans: stats[1],
      availableLiquidity: stats[2],
      activeLoansCount: stats[3]
    };
  }

  async calculateYield(address: string): Promise<bigint> {
    if (!this.lendingPool) throw new Error('Contracts not initialized');
    return await this.lendingPool.calculateYield(address);
  }

  // Stablecoin methods
  async getStablecoinBalance(address: string): Promise<bigint> {
    if (!this.stablecoin) throw new Error('Contracts not initialized');
    return await this.stablecoin.balanceOf(address);
  }

  async mintStablecoin(amount: bigint): Promise<ethers.ContractTransactionResponse> {
    await this.verifyNetwork();
    if (!this.stablecoin || !this.signer) throw new Error('Contracts not initialized');
    const address = await this.signer.getAddress();
    return await this.stablecoin.mint(address, amount);
  }
}

// Singleton instance
let contractServiceInstance: ContractService | null = null;

export function getContractService(): ContractService {
  if (!contractServiceInstance) {
    contractServiceInstance = new ContractService();
  }
  return contractServiceInstance;
}
