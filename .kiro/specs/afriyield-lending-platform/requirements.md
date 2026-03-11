# Requirements Document

## Introduction

AfriYield is an AI-powered stablecoin micro-lending decentralized application (dApp) built on Polkadot that empowers smallholder farmers in East Africa to access instant micro-loans through AI-driven risk scoring. The platform enables lenders to deposit stablecoins into lending pools and earn yields while providing transparent, decentralized lending infrastructure with low transaction fees.

## Glossary

- **AfriYield_System**: The complete dApp including smart contracts, frontend interface, and AI risk scoring components
- **Farmer**: A user who requests micro-loans by providing farm data for AI risk assessment
- **Lender**: A user who deposits stablecoins into lending pools to earn yields
- **Risk_Score**: A numerical value (0-100) calculated by AI algorithms based on farm data inputs
- **Lending_Pool**: Smart contract that holds deposited stablecoins and manages loan distribution
- **Mock_Stablecoin**: Test ERC-20 token representing stablecoins (e.g., AUSD) on Moonbase Alpha testnet
- **Moonbase_Alpha**: Moonbeam parachain testnet providing EVM/Solidity compatibility on Polkadot
- **Wallet_Extension**: Browser extension (Talisman or Polkadot.js) for blockchain interactions
- **Risk_Threshold**: Minimum risk score (70) required for loan approval
- **APY**: Annual Percentage Yield earned by lenders on deposited funds

## Requirements

### Requirement 1: Wallet Connection and Account Management

**User Story:** As a user, I want to connect my Polkadot wallet to the dApp, so that I can interact with the blockchain and manage my account.

#### Acceptance Criteria

1. WHEN a user visits the dApp THEN the AfriYield_System SHALL display a wallet connection button prominently on the interface
2. WHEN a user clicks the wallet connection button THEN the AfriYield_System SHALL detect if Talisman or Polkadot.js extension is installed
3. IF no wallet extension is detected THEN the AfriYield_System SHALL display an error message with installation instructions
4. WHEN a wallet extension is detected and user approves connection THEN the AfriYield_System SHALL display the connected wallet address
5. WHEN a wallet is connected THEN the AfriYield_System SHALL display the user's testnet balance for DOT and Mock_Stablecoin
6. WHEN a user disconnects their wallet THEN the AfriYield_System SHALL clear all session data and return to the initial state

### Requirement 2: Farm Data Input and AI Risk Assessment

**User Story:** As a farmer, I want to input my farm data and receive an AI-generated risk score, so that I can determine my loan eligibility.

#### Acceptance Criteria

1. WHEN a farmer accesses the farmer dashboard THEN the AfriYield_System SHALL display a form with crop type dropdown, estimated yield input, soil quality slider, rainfall input, and market volatility slider
2. WHEN a farmer selects a crop type THEN the AfriYield_System SHALL accept values from the predefined list (Coffee, Maize, Beans, Tea, Cassava)
3. WHEN a farmer inputs estimated yield THEN the AfriYield_System SHALL validate the input is a number between 0 and 100 tons per hectare
4. WHEN a farmer adjusts soil quality slider THEN the AfriYield_System SHALL accept values between 0 and 100
5. WHEN a farmer inputs rainfall data THEN the AfriYield_System SHALL validate the input is a positive number in millimeters
6. WHEN a farmer adjusts market volatility slider THEN the AfriYield_System SHALL map Low to High values to a 0-100 scale
7. WHEN a farmer clicks "Assess Credit" button with valid inputs THEN the AfriYield_System SHALL calculate Risk_Score using the formula: (yield × 0.4) + (soil × 0.3) + (rainfall × 0.2) - (volatility × 0.1)
8. WHEN Risk_Score is calculated THEN the AfriYield_System SHALL display the score with a color-coded gauge (green for score >= 70, yellow for 50-69, red for < 50)
9. WHEN Risk_Score is displayed THEN the AfriYield_System SHALL provide a tooltip explanation of the score components

### Requirement 3: Loan Request and Approval

**User Story:** As a farmer, I want to request a micro-loan based on my risk score, so that I can receive stablecoin funding for my agricultural needs.

#### Acceptance Criteria

1. WHEN a farmer has a Risk_Score >= Risk_Threshold THEN the AfriYield_System SHALL enable the loan request interface
2. WHEN a farmer has a Risk_Score < Risk_Threshold THEN the AfriYield_System SHALL disable loan request and display an explanation message
3. WHEN a farmer inputs a loan amount THEN the AfriYield_System SHALL validate the amount is between 50 and 500 Mock_Stablecoin units
4. WHEN a farmer clicks "Request Loan" with valid amount and sufficient Risk_Score THEN the AfriYield_System SHALL call the smart contract requestLoan function with amount and Risk_Score parameters
5. WHEN a loan request transaction is submitted THEN the AfriYield_System SHALL display transaction status (pending, success, or failed)
6. WHEN a loan request transaction succeeds THEN the AfriYield_System SHALL display a link to view the transaction on Polkadot block explorer
7. IF Lending_Pool has insufficient funds THEN the AfriYield_System SHALL reject the loan request and display an error message
8. WHEN a loan is approved THEN the AfriYield_System SHALL transfer Mock_Stablecoin from Lending_Pool to the farmer's wallet address
9. WHEN a loan is approved THEN the AfriYield_System SHALL emit a LoanApproved event with borrower address, amount, and Risk_Score

### Requirement 4: Lender Deposit and Yield Management

**User Story:** As a lender, I want to deposit stablecoins into the lending pool and earn yields, so that I can generate passive income while supporting farmers.

#### Acceptance Criteria

1. WHEN a lender accesses the lender dashboard THEN the AfriYield_System SHALL display current Lending_Pool balance, active loans count, and current APY
2. WHEN a lender clicks the deposit button THEN the AfriYield_System SHALL display an input field for deposit amount
3. WHEN a lender inputs a deposit amount and confirms THEN the AfriYield_System SHALL call the smart contract depositLenderFunds function
4. WHEN a deposit transaction succeeds THEN the AfriYield_System SHALL update the displayed pool balance and lender's contribution
5. WHEN time passes THEN the AfriYield_System SHALL calculate accrued yields based on a fixed APY rate (5-10%)
6. WHEN a lender clicks the withdraw button THEN the AfriYield_System SHALL display available principal and accrued yields
7. WHEN a lender confirms withdrawal THEN the AfriYield_System SHALL transfer the requested amount from Lending_Pool to the lender's wallet
8. WHEN a withdrawal would leave insufficient funds for active loans THEN the AfriYield_System SHALL reject the withdrawal and display an error message

### Requirement 5: Loan Repayment

**User Story:** As a farmer, I want to repay my loan, so that I can maintain good credit standing and access future loans.

#### Acceptance Criteria

1. WHEN a farmer has an active loan THEN the AfriYield_System SHALL display loan details including amount, due date, and repayment status
2. WHEN a farmer clicks the repay button THEN the AfriYield_System SHALL display the outstanding loan amount
3. WHEN a farmer confirms repayment with sufficient Mock_Stablecoin balance THEN the AfriYield_System SHALL call the smart contract repayLoan function
4. WHEN a repayment transaction succeeds THEN the AfriYield_System SHALL update the loan status to "Repaid"
5. WHEN a repayment transaction succeeds THEN the AfriYield_System SHALL return funds to the Lending_Pool
6. WHEN a repayment is completed THEN the AfriYield_System SHALL emit a LoanRepaid event with borrower address and amount

### Requirement 6: Transparency Dashboard

**User Story:** As any user, I want to view all on-chain loan data and aggregate statistics, so that I can verify the platform's transparency and performance.

#### Acceptance Criteria

1. WHEN a user accesses the transparency dashboard THEN the AfriYield_System SHALL display a table of all loans with borrower address, amount, Risk_Score, status, and repayment due date
2. WHEN displaying borrower addresses THEN the AfriYield_System SHALL truncate addresses for readability (e.g., 0x1234...5678)
3. WHEN a user views the transparency dashboard THEN the AfriYield_System SHALL display aggregate statistics including total loans issued, average Risk_Score, and repayment rate
4. WHEN a user clicks on a loan entry THEN the AfriYield_System SHALL display detailed loan information including transaction hash and block number
5. WHEN new loans are created or repaid THEN the AfriYield_System SHALL update the transparency dashboard in real-time

### Requirement 7: Smart Contract - Lending Pool Management

**User Story:** As the system, I want to manage lending pool operations through secure smart contracts, so that all transactions are transparent and trustless.

#### Acceptance Criteria

1. THE AfriYieldLendingPool contract SHALL implement ERC-20 interface for Mock_Stablecoin operations
2. THE AfriYieldLendingPool contract SHALL provide a depositLenderFunds function that accepts uint amount parameter
3. WHEN depositLenderFunds is called THEN the contract SHALL transfer Mock_Stablecoin from caller to contract address
4. THE AfriYieldLendingPool contract SHALL provide a requestLoan function that accepts uint amount and uint riskScore parameters
5. WHEN requestLoan is called with riskScore >= Risk_Threshold THEN the contract SHALL create a loan record
6. THE AfriYieldLendingPool contract SHALL provide an approveLoan function that transfers funds to borrower
7. WHEN approveLoan is called THEN the contract SHALL emit a LoanApproved event
8. THE AfriYieldLendingPool contract SHALL provide a repayLoan function that accepts uint amount parameter
9. WHEN repayLoan is called THEN the contract SHALL transfer Mock_Stablecoin from borrower back to contract
10. THE AfriYieldLendingPool contract SHALL track total deposits, active loans, and yield accruals
11. THE AfriYieldLendingPool contract SHALL use OpenZeppelin SafeMath and ReentrancyGuard for security

### Requirement 8: Smart Contract - Risk Score Oracle

**User Story:** As the system, I want to store and retrieve risk scores on-chain, so that loan decisions are verifiable and transparent.

#### Acceptance Criteria

1. THE AfriYieldOracle contract SHALL provide a function to store Risk_Score for a given address
2. THE AfriYieldOracle contract SHALL provide a function to retrieve Risk_Score for a given address
3. WHEN storing a Risk_Score THEN the contract SHALL validate the score is between 0 and 100
4. THE AfriYieldOracle contract SHALL use access control modifiers to restrict score updates to authorized addresses
5. WHEN a Risk_Score is updated THEN the contract SHALL emit a RiskScoreUpdated event

### Requirement 9: Frontend Responsiveness and User Experience

**User Story:** As a user on any device, I want a responsive and intuitive interface, so that I can easily interact with the dApp on desktop or mobile.

#### Acceptance Criteria

1. WHEN a user accesses the dApp on mobile devices THEN the AfriYield_System SHALL display a mobile-optimized layout using Tailwind CSS breakpoints
2. WHEN a user accesses the dApp on desktop THEN the AfriYield_System SHALL display a full-featured layout with sidebar navigation
3. WHEN a transaction is processing THEN the AfriYield_System SHALL display a loading spinner with status message
4. WHEN an error occurs THEN the AfriYield_System SHALL display a user-friendly error message with suggested actions
5. THE AfriYield_System SHALL provide a dark mode toggle that persists user preference
6. WHEN forms are submitted with invalid data THEN the AfriYield_System SHALL display inline validation errors
7. THE AfriYield_System SHALL provide smooth transitions and animations for state changes

### Requirement 10: Demo Mode and Testing Features

**User Story:** As a hackathon judge or demo viewer, I want to quickly test the dApp with pre-filled data, so that I can evaluate functionality without manual data entry.

#### Acceptance Criteria

1. WHEN a user clicks "Demo Mode" button THEN the AfriYield_System SHALL pre-fill the farm data form with sample values
2. WHERE demo mode is enabled THEN the AfriYield_System SHALL use mock data: Crop=Coffee, Yield=75, Soil=80, Rainfall=1200, Volatility=30
3. WHEN demo mode is active THEN the AfriYield_System SHALL display a banner indicating demo mode is enabled
4. THE AfriYield_System SHALL provide links to testnet faucets for obtaining test DOT and Mock_Stablecoin
5. THE AfriYield_System SHALL include a help section with quick start instructions and video demo link

### Requirement 11: Deployment and Configuration

**User Story:** As a developer, I want clear deployment scripts and configuration, so that I can deploy contracts to Moonbase Alpha and host the frontend.

#### Acceptance Criteria

1. THE AfriYield_System SHALL include Hardhat configuration for Moonbase_Alpha testnet deployment
2. THE AfriYield_System SHALL provide deployment scripts that deploy AfriYieldLendingPool and AfriYieldOracle contracts
3. WHEN deployment scripts are executed THEN the system SHALL output deployed contract addresses
4. THE AfriYield_System SHALL include environment variable configuration for RPC endpoints and contract addresses
5. THE AfriYield_System SHALL provide a README with step-by-step setup, deployment, and testing instructions
6. THE AfriYield_System SHALL be deployable to Vercel or Netlify with a single command
7. THE AfriYield_System SHALL include a package.json with all required dependencies and scripts

### Requirement 12: Security and Best Practices

**User Story:** As a user, I want the platform to be secure and follow best practices, so that my funds and data are protected.

#### Acceptance Criteria

1. THE AfriYieldLendingPool contract SHALL use OpenZeppelin ReentrancyGuard to prevent reentrancy attacks
2. THE AfriYieldLendingPool contract SHALL use OpenZeppelin SafeERC20 for safe token transfers
3. THE AfriYield_System SHALL validate all user inputs on both client-side and contract-side
4. THE AfriYield_System SHALL use access control modifiers (onlyOwner) for administrative functions
5. WHEN handling sensitive operations THEN the contracts SHALL emit events for transparency
6. THE AfriYield_System SHALL include basic unit tests for all smart contract functions
7. THE AfriYield_System SHALL include frontend tests for critical user flows
8. THE AfriYield_System SHALL use environment variables for sensitive configuration data
