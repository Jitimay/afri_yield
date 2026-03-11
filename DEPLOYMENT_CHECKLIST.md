# AfriYield Deployment Checklist

## Pre-Deployment

### Environment Setup
- [ ] Node.js v18+ installed
- [ ] npm or yarn installed
- [ ] Wallet with testnet DEV tokens
- [ ] Private key added to `.env`

### Dependencies
- [ ] Root dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] No installation errors

### Compilation
- [ ] Smart contracts compile successfully (`npm run compile`)
- [ ] No compilation warnings or errors
- [ ] Artifacts generated in `/artifacts`

## Smart Contract Deployment

### Moonbase Alpha Testnet
- [ ] Faucet DEV tokens received
- [ ] Private key configured in `.env`
- [ ] RPC URL correct in `hardhat.config.js`
- [ ] Deploy script runs successfully (`npm run deploy:moonbase`)
- [ ] All 3 contracts deployed:
  - [ ] MockStablecoin
  - [ ] AfriYieldOracle
  - [ ] AfriYieldLendingPool
- [ ] Contract addresses saved in `deployments.json`
- [ ] Contracts verified on Moonscan (optional)

### Contract Verification
- [ ] MockStablecoin has 1M initial supply
- [ ] Oracle is owned by deployer
- [ ] LendingPool has correct stablecoin address
- [ ] Can call view functions successfully

## Frontend Configuration

### Environment Variables
- [ ] `frontend/.env` created from `.env.example`
- [ ] `NEXT_PUBLIC_LENDING_POOL_ADDRESS` set
- [ ] `NEXT_PUBLIC_ORACLE_ADDRESS` set
- [ ] `NEXT_PUBLIC_STABLECOIN_ADDRESS` set
- [ ] `NEXT_PUBLIC_MOONBASE_RPC_URL` set
- [ ] `NEXT_PUBLIC_CHAIN_ID=1287` set
- [ ] `NEXT_PUBLIC_EXPLORER_URL` set

### Build Test
- [ ] Frontend builds successfully (`npm run build`)
- [ ] No TypeScript errors
- [ ] No build warnings (or acceptable warnings only)

### Development Server
- [ ] Dev server starts (`npm run dev`)
- [ ] Accessible at http://localhost:3000
- [ ] No console errors on page load
- [ ] All pages load correctly:
  - [ ] Home (/)
  - [ ] Farmer (/farmer)
  - [ ] Lender (/lender)
  - [ ] Transparency (/transparency)

## Functional Testing

### Wallet Connection
- [ ] Wallet connect button visible
- [ ] Can connect MetaMask/Talisman/Polkadot.js
- [ ] Address displays correctly
- [ ] Balances show (DEV and AUSD)
- [ ] Can disconnect wallet

### Farmer Dashboard
- [ ] Farm data form loads
- [ ] All input fields work
- [ ] Demo mode button works
- [ ] Risk score calculates correctly
- [ ] Score displays with correct color:
  - [ ] Green for >= 70
  - [ ] Yellow for 50-69
  - [ ] Red for < 50
- [ ] Loan request form enables/disables based on score
- [ ] Can request loan (if eligible)
- [ ] Transaction processes successfully
- [ ] Explorer link works
- [ ] Active loans display
- [ ] Can repay loan

### Lender Dashboard
- [ ] Pool stats load
- [ ] Deposit form works
- [ ] Can approve AUSD spending
- [ ] Can deposit funds
- [ ] Balance updates after deposit
- [ ] Yields calculate correctly
- [ ] Can withdraw funds
- [ ] Liquidity protection works

### Transparency Dashboard
- [ ] All loans display
- [ ] Filter buttons work (All/Active/Repaid)
- [ ] Addresses truncated correctly
- [ ] Risk scores color-coded
- [ ] Aggregate stats calculate correctly
- [ ] Stats update when new loans created

## Token Setup

### AUSD Faucet
- [ ] Can mint AUSD tokens
- [ ] Mint function works on contract
- [ ] Balance updates after minting
- [ ] Sufficient tokens for testing

## End-to-End Testing

### Complete Farmer Flow
- [ ] Connect wallet
- [ ] Mint AUSD tokens
- [ ] Fill farm data
- [ ] Get risk score >= 70
- [ ] Request loan
- [ ] Receive loan funds
- [ ] See loan in active loans
- [ ] Repay loan
- [ ] Loan marked as repaid

### Complete Lender Flow
- [ ] Connect wallet
- [ ] Mint AUSD tokens
- [ ] Deposit to pool
- [ ] View yields accruing
- [ ] Withdraw funds
- [ ] Balance correct after withdrawal

### Cross-User Testing
- [ ] Lender deposits
- [ ] Farmer requests loan
- [ ] Pool balance decreases
- [ ] Farmer repays
- [ ] Pool balance increases
- [ ] Lender can withdraw

## Performance & UX

### Loading States
- [ ] Loading indicators show during transactions
- [ ] Success messages display
- [ ] Error messages are clear
- [ ] Transaction hashes link to explorer

### Responsive Design
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)

### Browser Compatibility
- [ ] Chrome/Brave
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Edge

## Security Checks

### Smart Contracts
- [ ] ReentrancyGuard on all fund transfers
- [ ] SafeERC20 used for token operations
- [ ] Access control on admin functions
- [ ] Input validation in contracts
- [ ] Events emitted for all state changes

### Frontend
- [ ] No private keys in code
- [ ] Environment variables used correctly
- [ ] No sensitive data in console logs
- [ ] HTTPS in production (if deployed)

## Documentation

### Code Documentation
- [ ] README.md complete
- [ ] QUICKSTART.md available
- [ ] FINAL_SUMMARY.md available
- [ ] Comments in complex code sections

### User Documentation
- [ ] How to get testnet tokens
- [ ] How to connect wallet
- [ ] How to use each dashboard
- [ ] Troubleshooting guide

## Production Deployment (Optional)

### Frontend Hosting
- [ ] Vercel/Netlify account created
- [ ] Repository connected
- [ ] Environment variables configured
- [ ] Build settings correct
- [ ] Deployment successful
- [ ] Live URL accessible
- [ ] All features work on live site

### Domain (Optional)
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] DNS propagated

## Post-Deployment

### Monitoring
- [ ] Contract addresses documented
- [ ] Deployment date recorded
- [ ] Initial pool state recorded
- [ ] Test transactions recorded

### Demo Preparation
- [ ] Demo script prepared
- [ ] Test accounts ready
- [ ] Screen recording software ready
- [ ] Backup plan if issues arise

### Hackathon Submission
- [ ] Project description written
- [ ] Screenshots taken
- [ ] Video demo recorded
- [ ] GitHub repository public
- [ ] Live demo URL included
- [ ] Team information complete

## Final Checks

- [ ] All core features working
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] User experience smooth
- [ ] Documentation complete
- [ ] Ready for demo/submission

## Sign-Off

- [ ] Developer tested: ___________
- [ ] Peer reviewed: ___________
- [ ] Ready for production: ___________

---

**Deployment Date**: ___________
**Deployed By**: ___________
**Network**: Moonbase Alpha
**Status**: ___________
