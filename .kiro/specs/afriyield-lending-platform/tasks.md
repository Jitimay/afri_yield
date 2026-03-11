# Implementation Plan: AfriYield Lending Platform

## Overview

This implementation plan breaks down the AfriYield platform into discrete, manageable tasks. The platform consists of Solidity smart contracts deployed on Moonbase Alpha testnet and a Next.js/TypeScript frontend. Tasks are organized to build incrementally, with testing integrated throughout.

## Tasks

- [x] 1. Project setup and configuration
  - Initialize Hardhat project for smart contracts
  - Initialize Next.js project with TypeScript
  - Configure Hardhat for Moonbase Alpha testnet deployment
  - Set up project structure: /contracts, /frontend, /scripts, /test
  - Create .env.example files with required environment variables
  - Install dependencies: @openzeppelin/contracts, ethers, @polkadot/api, tailwindcss, chart.js
  - Configure Tailwind CSS in Next.js project
  - _Requirements: 11.1, 11.4, 11.7_

- [x] 2. Implement MockStablecoin contract
  - [x] 2.1 Create MockStablecoin.sol contract
    - Inherit from OpenZeppelin ERC20
    - Implement constructor with initial supply (1M AUSD)
    - Add public mint function for faucet functionality
    - _Requirements: 7.1_

  - [ ]* 2.2 Write unit tests for MockStablecoin
    - Test token deployment and initial supply
    - Test mint function
    - Test ERC20 standard functions (transfer, approve, transferFrom)
    - _Requirements: 12.6_

- [x] 3. Implement AfriYieldOracle contract
  - [x] 3.1 Create AfriYieldOracle.sol contract
    - Import OpenZeppelin Ownable for access control
    - Define state variables: riskScores mapping, lastUpdated mapping
    - Implement updateRiskScore function with validation (0-100 range)
    - Implement getRiskScore function
    - Emit RiskScoreUpdated event on updates
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 3.2 Write property test for risk score round-trip
    - **Property 7: Risk score storage round-trip**
    - **Validates: Requirements 8.1, 8.2**
    - Generate random risk scores (0-100)
    - Store then retrieve and verify equality
    - _Requirements: 8.1, 8.2_

  - [ ]* 3.3 Write property test for risk score validation
    - **Property 8: Risk score validation**
    - **Validates: Requirements 8.3**
    - Test valid scores (0-100) are accepted
    - Test invalid scores (>100) are rejected
    - _Requirements: 8.3_

  - [ ]* 3.4 Write property test for access control
    - **Property 9: Access control enforcement**
    - **Validates: Requirements 8.4, 12.4**
    - Test unauthorized addresses cannot update scores
    - Test owner can update scores
    - _Requirements: 8.4, 12.4_

  - [ ]* 3.5 Write unit tests for event emission
    - Test RiskScoreUpdated event is emitted with correct parameters
    - _Requirements: 8.5_

- [x] 4. Implement AfriYieldLendingPool contract
  - [x] 4.1 Create AfriYieldLendingPool.sol contract
    - Import OpenZeppelin: ReentrancyGuard, Ownable, SafeERC20
    - Define Loan struct with all required fields
    - Define state variables: stablecoin, totalDeposits, totalLoans, APY, RISK_THRESHOLD
    - Define mappings: loans, borrowerLoans, lenderDeposits, lenderYields
    - _Requirements: 7.1, 7.2, 7.4, 7.8, 7.10, 7.11, 12.1, 12.2_

  - [x] 4.2 Implement depositLenderFunds function
    - Accept uint256 amount parameter
    - Use SafeERC20 transferFrom to move tokens from lender to contract
    - Update lenderDeposits and totalDeposits
    - Record deposit timestamp for yield calculation
    - Emit LenderDeposit event
    - Add nonReentrant modifier
    - _Requirements: 7.2, 7.3, 12.1, 12.2_

  - [x] 4.3 Implement requestLoan function
    - Accept uint256 amount and uint256 riskScore parameters
    - Validate riskScore >= RISK_THRESHOLD (70)
    - Validate amount between 50 and 500 tokens
    - Check pool has sufficient balance
    - Create loan record with 90-day due date
    - Transfer tokens to borrower using SafeERC20
    - Update totalLoans
    - Emit LoanRequested and LoanApproved events
    - Add nonReentrant modifier
    - _Requirements: 7.4, 7.5, 7.6, 7.7, 3.4, 3.8, 3.9_

  - [x] 4.4 Implement repayLoan function
    - Accept uint256 loanId parameter
    - Validate loan exists and is active
    - Transfer tokens from borrower back to contract using SafeERC20
    - Update loan status to repaid
    - Update totalLoans
    - Emit LoanRepaid event
    - Add nonReentrant modifier
    - _Requirements: 7.8, 7.9, 5.3, 5.4, 5.5, 5.6_

  - [x] 4.5 Implement yield calculation and withdrawal functions
    - Implement calculateYield function using APY formula
    - Implement withdrawFunds function with liquidity protection
    - Validate withdrawal doesn't compromise active loans
    - Update lender balances and emit events
    - Add nonReentrant modifier
    - _Requirements: 4.5, 4.7, 4.8_

  - [x] 4.6 Implement view functions
    - getLoanDetails(uint256 loanId)
    - getAllLoans() returns array of all loans
    - getPoolStats() returns pool statistics
    - getBorrowerLoans(address borrower)
    - _Requirements: 6.1, 6.3_

- [ ] 5. Write smart contract property tests
  - [ ]* 5.1 Write property test for deposit increases pool balance
    - **Property 1: Deposit increases pool balance**
    - **Validates: Requirements 7.3**
    - Generate random deposit amounts
    - Verify pool balance increases by exact amount
    - _Requirements: 7.3_

  - [ ]* 5.2 Write property test for loan approval transfers
    - **Property 2: Loan approval transfers correct amount**
    - **Validates: Requirements 3.8, 7.5**
    - Generate random loan amounts and risk scores >= 70
    - Verify borrower balance increases and pool decreases
    - _Requirements: 3.8, 7.5_

  - [ ]* 5.3 Write property test for loan events
    - **Property 3: Loan approval emits event**
    - **Validates: Requirements 3.9, 7.7**
    - Verify LoanApproved event emission with correct data
    - _Requirements: 3.9, 7.7_

  - [ ]* 5.4 Write property test for repayment
    - **Property 4: Repayment returns funds to pool**
    - **Validates: Requirements 5.5, 7.9**
    - Generate random repayments
    - Verify pool balance increases and loan status updates
    - _Requirements: 5.5, 7.9_

  - [ ]* 5.5 Write property test for pool accounting invariant
    - **Property 6: Pool accounting invariant**
    - **Validates: Requirements 7.10**
    - Perform random sequences of deposits, loans, repayments
    - Verify accounting equation holds
    - _Requirements: 7.10_

  - [ ]* 5.6 Write property test for insufficient liquidity
    - **Property 11: Insufficient liquidity rejection**
    - **Validates: Requirements 3.7**
    - Test loans exceeding pool balance are rejected
    - _Requirements: 3.7_

  - [ ]* 5.7 Write property test for withdrawal protection
    - **Property 12: Withdrawal liquidity protection**
    - **Validates: Requirements 4.8**
    - Test withdrawals compromising active loans are rejected
    - _Requirements: 4.8_

- [x] 6. Checkpoint - Smart contracts complete
  - Ensure all contract tests pass
  - Review contract code for security issues
  - Ask user if questions arise

- [x] 7. Create deployment scripts
  - [x] 7.1 Write deploy.js script
    - Deploy MockStablecoin contract
    - Deploy AfriYieldOracle contract
    - Deploy AfriYieldLendingPool contract with stablecoin address
    - Output all deployed contract addresses
    - Save addresses to deployments.json file
    - _Requirements: 11.2, 11.3_

  - [ ]* 7.2 Test deployment on local Hardhat network
    - Run deployment script locally
    - Verify all contracts deploy successfully
    - _Requirements: 11.2_

- [x] 8. Implement AI risk scoring engine
  - [x] 8.1 Create lib/riskEngine.ts
    - Define FarmData and RiskAssessment interfaces
    - Implement normalizeRainfall function (optimal 800-1500mm)
    - Implement calculateRiskScore function with weighted formula
    - Return score with breakdown of components
    - _Requirements: 2.7_

  - [ ]* 8.2 Write property test for risk score calculation
    - **Property 13: Risk score calculation accuracy**
    - **Validates: Requirements 2.7**
    - Generate random farm data inputs
    - Verify calculated score matches formula
    - Verify score is clamped to 0-100 range
    - _Requirements: 2.7_

  - [ ]* 8.3 Write unit tests for edge cases
    - Test extreme rainfall values
    - Test all zero inputs
    - Test all maximum inputs
    - _Requirements: 2.7_

- [x] 9. Implement contract interaction service
  - [x] 9.1 Create lib/contractService.ts
    - Define ContractService class
    - Initialize ethers.js providers and signers
    - Load contract ABIs and addresses from deployments.json
    - Create contract instances for LendingPool, Oracle, Stablecoin
    - _Requirements: 3.4, 4.3, 5.3_

  - [x] 9.2 Implement deposit and withdrawal methods
    - depositFunds(amount): approve then call depositLenderFunds
    - withdrawFunds(amount): call contract withdrawal
    - Handle transaction receipts and errors
    - _Requirements: 4.3, 4.7_

  - [x] 9.3 Implement loan methods
    - requestLoan(amount, riskScore): call contract requestLoan
    - repayLoan(loanId): approve then call contract repayLoan
    - getLoanDetails(loanId): fetch loan data
    - getAllLoans(): fetch all loans for transparency
    - _Requirements: 3.4, 5.3, 6.1_

  - [x] 9.4 Implement pool statistics methods
    - getPoolStats(): fetch pool balance, active loans, APY
    - calculateYield(address): fetch accrued yields
    - _Requirements: 4.1, 4.5_

- [x] 10. Implement wallet connection component
  - [x] 10.1 Create components/WalletConnect.tsx
    - Detect Polkadot.js or Talisman extension
    - Implement connectWallet function using @polkadot/extension-dapp
    - Implement disconnectWallet function
    - Display connected address (truncated format)
    - Fetch and display DOT and AUSD balances
    - Handle wallet state in React context
    - _Requirements: 1.2, 1.4, 1.5, 1.6_

  - [ ]* 10.2 Write property test for wallet state management
    - **Property 21: Wallet connection state management**
    - **Validates: Requirements 1.4, 1.6**
    - Test connection updates state correctly
    - Test disconnection clears state
    - _Requirements: 1.4, 1.6_

  - [ ]* 10.3 Write unit tests for wallet connection
    - Test extension detection
    - Test error handling for missing extension
    - Test balance fetching
    - _Requirements: 1.2, 1.3_

- [x] 11. Implement farmer dashboard
  - [x] 11.1 Create pages/farmer.tsx
    - Create layout with navigation
    - Import WalletConnect component
    - Create sections for farm data form, risk assessment, loan request
    - _Requirements: 2.1_

  - [x] 11.2 Create components/FarmDataForm.tsx
    - Crop type dropdown with 5 options
    - Estimated yield number input (0-100)
    - Soil quality slider (0-100)
    - Rainfall number input (positive mm)
    - Market volatility slider (0-100)
    - "Assess Credit" button
    - Form validation with inline errors
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 9.6_

  - [ ]* 11.3 Write property tests for input validation
    - **Property 16: Input validation - crop type**
    - **Property 17: Input validation - yield**
    - **Property 18: Input validation - soil quality**
    - **Property 19: Input validation - rainfall**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5**
    - Test valid inputs are accepted
    - Test invalid inputs are rejected
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [x] 11.4 Create components/RiskScoreGauge.tsx
    - Display risk score with Chart.js gauge
    - Color code: green (>=70), yellow (50-69), red (<50)
    - Show score breakdown in tooltip
    - Display eligibility message
    - _Requirements: 2.8, 2.9_

  - [ ]* 11.5 Write property test for color coding
    - **Property 14: Risk score color coding**
    - **Validates: Requirements 2.8**
    - Generate random scores
    - Verify correct color for each range
    - _Requirements: 2.8_

  - [x] 11.6 Create components/LoanRequestForm.tsx
    - Loan amount input (50-500)
    - Enable/disable based on risk score >= 70
    - "Request Loan" button
    - Transaction status display (pending/success/fail)
    - Explorer link on success
    - Error messages for insufficient funds
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6, 3.7_

  - [ ]* 11.7 Write property test for loan interface enablement
    - **Property 15: Loan interface enablement**
    - **Validates: Requirements 3.1, 3.2**
    - Test interface enabled when score >= 70
    - Test interface disabled when score < 70
    - _Requirements: 3.1, 3.2_

  - [ ]* 11.8 Write property test for loan amount validation
    - **Property 20: Input validation - loan amount**
    - **Validates: Requirements 3.3**
    - Test valid amounts (50-500) accepted
    - Test invalid amounts rejected
    - _Requirements: 3.3_

  - [x] 11.9 Create components/ActiveLoansTable.tsx
    - Display farmer's active loans
    - Show loan amount, due date, status
    - "Repay" button for each active loan
    - Handle repayment transactions
    - _Requirements: 5.1, 5.2_

- [x] 12. Implement lender dashboard
  - [x] 12.1 Create pages/lender.tsx
    - Create layout with navigation
    - Import WalletConnect component
    - Create sections for pool stats, deposit, withdraw
    - _Requirements: 4.1_

  - [x] 12.2 Create components/PoolStats.tsx
    - Display total pool balance
    - Display active loans count
    - Display current APY
    - Display user's deposits and yields
    - Auto-update yields over time
    - _Requirements: 4.1, 4.5_

  - [ ]* 12.3 Write property test for yield calculation
    - **Property 27: Yield calculation accuracy**
    - **Validates: Requirements 4.5**
    - Generate random deposit amounts and time periods
    - Verify yield calculation matches APY formula
    - _Requirements: 4.5_

  - [x] 12.4 Create components/DepositForm.tsx
    - Deposit amount input
    - "Deposit" button
    - Handle token approval and deposit transaction
    - Update UI on success
    - _Requirements: 4.2, 4.3, 4.4_

  - [x] 12.5 Create components/WithdrawForm.tsx
    - Display available principal and yields
    - Withdrawal amount input
    - "Withdraw" button
    - Handle withdrawal transaction
    - Error handling for insufficient liquidity
    - _Requirements: 4.6, 4.7, 4.8_

- [x] 13. Implement transparency dashboard
  - [x] 13.1 Create pages/transparency.tsx
    - Create layout with navigation
    - Create sections for loans table and aggregate stats
    - _Requirements: 6.1_

  - [x] 13.2 Create components/LoansTable.tsx
    - Fetch all loans from contract
    - Display table with columns: borrower, amount, risk score, status, due date
    - Truncate addresses to 0x1234...5678 format
    - Implement pagination for large datasets
    - Click loan for detailed view with tx hash and block number
    - _Requirements: 6.1, 6.2, 6.4_

  - [ ]* 13.3 Write property test for address truncation
    - **Property 24: Address truncation**
    - **Validates: Requirements 6.2**
    - Generate random Ethereum addresses
    - Verify truncation format is correct
    - _Requirements: 6.2_

  - [x] 13.4 Create components/AggregateStats.tsx
    - Calculate and display total loans issued
    - Calculate and display average risk score
    - Calculate and display repayment rate
    - Display total volume
    - _Requirements: 6.3_

  - [ ]* 13.5 Write property test for aggregate statistics
    - **Property 25: Aggregate statistics accuracy**
    - **Validates: Requirements 6.3**
    - Generate random loan datasets
    - Verify statistics calculations are correct
    - _Requirements: 6.3_

  - [x] 13.6 Implement real-time updates
    - Listen to contract events (LoanApproved, LoanRepaid)
    - Update dashboard when events are emitted
    - _Requirements: 6.5_

- [ ] 14. Implement demo mode and UX features
  - [x] 14.1 Add demo mode functionality
    - "Demo Mode" button in farmer dashboard
    - Pre-fill form with: Coffee, 75, 80, 1200, 30
    - Display demo mode banner when active
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ] 14.2 Add dark mode toggle
    - Implement dark mode with Tailwind dark: classes
    - Persist preference in localStorage
    - Toggle button in navigation
    - _Requirements: 9.5_

  - [ ]* 14.3 Write property test for dark mode persistence
    - **Property 28: Dark mode persistence**
    - **Validates: Requirements 9.5**
    - Test preference persists across sessions
    - _Requirements: 9.5_

  - [ ] 14.4 Add loading states and error handling
    - Loading spinners for transactions
    - User-friendly error messages
    - Toast notifications for success/error
    - _Requirements: 9.3, 9.4_

  - [ ] 14.5 Add help section and faucet links
    - Create help page with quick start guide
    - Add links to Moonbase Alpha faucet
    - Add link to AUSD token faucet (mint function)
    - Placeholder for video demo link
    - _Requirements: 10.4, 10.5_

  - [ ] 14.6 Implement responsive design
    - Test and adjust layouts for mobile breakpoints
    - Ensure all components work on mobile devices
    - Add mobile-friendly navigation
    - _Requirements: 9.1, 9.2_

- [ ] 15. Checkpoint - Frontend complete
  - Test all user flows end-to-end
  - Verify responsive design on multiple devices
  - Ensure all tests pass
  - Ask user if questions arise

- [x] 16. Create documentation and deployment configs
  - [x] 16.1 Write comprehensive README.md
    - Project overview and features
    - Prerequisites (Node.js, wallet extensions)
    - Installation instructions
    - Local development setup
    - Contract deployment instructions
    - Frontend deployment instructions
    - Testing instructions
    - Testnet faucet links
    - Video demo script outline
    - _Requirements: 11.5_

  - [x] 16.2 Create deployment configuration
    - Configure Vercel/Netlify deployment
    - Set up environment variables for production
    - Create vercel.json or netlify.toml
    - _Requirements: 11.6_

  - [x] 16.3 Create .env.example files
    - Document all required environment variables
    - Provide example values for Moonbase Alpha
    - Include RPC endpoints and contract addresses
    - _Requirements: 11.4, 12.8_

  - [x] 16.4 Add MIT license file
    - Create LICENSE file with MIT license text
    - _Requirements: 12.8_

- [ ] 17. Deploy to Moonbase Alpha testnet
  - [ ] 17.1 Deploy smart contracts
    - Fund deployer wallet with testnet DEV tokens
    - Run deployment script on Moonbase Alpha
    - Verify contracts on Moonscan
    - Save deployed addresses
    - _Requirements: 11.2, 11.3_

  - [ ] 17.2 Update frontend configuration
    - Update contract addresses in frontend config
    - Update RPC endpoints for Moonbase Alpha
    - Test contract interactions from frontend
    - _Requirements: 11.4_

  - [ ] 17.3 Deploy frontend to Vercel/Netlify
    - Connect GitHub repository
    - Configure build settings
    - Set environment variables
    - Deploy and test live URL
    - _Requirements: 11.6_

- [ ] 18. Final testing and polish
  - [ ]* 18.1 Run full test suite
    - Run all smart contract tests
    - Run all frontend tests
    - Verify all property tests pass with 100+ iterations
    - _Requirements: 12.6, 12.7_

  - [ ] 18.2 Manual testing checklist
    - Test wallet connection flow
    - Test farm data input and risk assessment
    - Test loan request and approval
    - Test lender deposit and withdrawal
    - Test loan repayment
    - Test transparency dashboard
    - Test demo mode
    - Test on mobile devices
    - _Requirements: All_

  - [ ] 18.3 Security review
    - Review all contract functions for vulnerabilities
    - Verify ReentrancyGuard is applied correctly
    - Verify access control is enforced
    - Check for integer overflow/underflow issues
    - Verify event emissions
    - _Requirements: 12.1, 12.2, 12.4, 12.5_

  - [ ] 18.4 Performance optimization
    - Optimize contract gas usage
    - Optimize frontend bundle size
    - Test transaction speeds on testnet
    - _Requirements: All_

  - [ ] 18.5 Final polish
    - Fix any UI/UX issues
    - Ensure consistent styling
    - Add smooth animations
    - Proofread all text content
    - _Requirements: 9.7_

- [ ] 19. Prepare hackathon submission
  - [ ] 19.1 Create demo video
    - Record 1-2 minute walkthrough
    - Show wallet connection
    - Show risk assessment
    - Show loan request and approval
    - Show transparency dashboard
    - Upload to YouTube/Loom
    - _Requirements: 10.5_

  - [ ] 19.2 Final README update
    - Add live demo URL
    - Add video demo link
    - Add deployed contract addresses
    - Add screenshots
    - _Requirements: 11.5_

  - [ ] 19.3 Prepare submission materials
    - Project description for DoraHacks
    - List of technologies used
    - Highlight Polkadot/Moonbeam integration
    - Emphasize AI + DeFi innovation
    - Include social impact narrative
    - _Requirements: All_

## Notes

- Tasks marked with `*` are optional test tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation and user feedback
- The implementation follows a bottom-up approach: contracts → services → UI components
- All contract functions use OpenZeppelin security patterns
- Frontend uses TypeScript for type safety
- Testing is integrated throughout development, not left to the end
