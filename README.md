# AfriYield - AI-Powered Micro-Lending Platform

AfriYield is a decentralized micro-lending platform built on Polkadot's Moonbase Alpha testnet that connects smallholder farmers in East Africa with lenders through AI-powered risk assessment.

## Features

- 🌾 **AI Risk Assessment**: Calculate creditworthiness from farm data (crop type, yield, soil quality, rainfall, market volatility)
- 💰 **Instant Micro-Loans**: Farmers receive 50-500 AUSD loans based on risk scores
- 📊 **Transparent Lending**: All loan data visible on-chain for complete transparency
- 💸 **Lender Yields**: Earn fixed APY (8%) on deposited stablecoins
- 🔒 **Secure Smart Contracts**: Built with OpenZeppelin security standards
- 🌙 **Moonbeam Integration**: Deployed on Moonbase Alpha testnet

## Project Structure

```
afriyield/
├── contracts/          # Solidity smart contracts
├── scripts/           # Deployment scripts
├── test/              # Smart contract tests
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── lib/          # Utility functions and services
│   └── pages/        # Additional routes
├── hardhat.config.js  # Hardhat configuration
└── package.json       # Root dependencies
```

## Prerequisites

- Node.js v18+ and npm
- Polkadot.js or Talisman wallet extension
- Moonbase Alpha testnet DEV tokens (for deployment)

## Installation

### 1. Clone and Install Dependencies

```bash
# Install root dependencies (Hardhat, smart contracts)
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment Variables

```bash
# Copy example env files
cp .env.example .env
cp frontend/.env.example frontend/.env

# Edit .env with your private key for deployment
# Edit frontend/.env with contract addresses after deployment
```

## Development

### Smart Contracts

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to local Hardhat network
npm run deploy:local

# Deploy to Moonbase Alpha testnet
npm run deploy:moonbase
```

### Frontend

```bash
# Start development server
npm run dev:frontend

# Build for production
npm run build:frontend
```

The frontend will be available at `http://localhost:3000`

## Testing

### Smart Contract Tests

```bash
# Run all tests
npm test

# Run with coverage
npx hardhat coverage
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Deployment

### 1. Deploy Smart Contracts to Moonbase Alpha

1. Get testnet DEV tokens from [Moonbase Alpha Faucet](https://faucet.moonbeam.network/)
2. Add your private key to `.env`
3. Deploy contracts:

```bash
npm run deploy:moonbase
```

4. Save the deployed contract addresses

### 2. Update Frontend Configuration

Update `frontend/.env` with deployed contract addresses:

```
NEXT_PUBLIC_LENDING_POOL_ADDRESS=0x...
NEXT_PUBLIC_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_STABLECOIN_ADDRESS=0x...
```

### 3. Deploy Frontend

Deploy to Vercel or Netlify:

```bash
cd frontend
npm run build
# Follow platform-specific deployment instructions
```

## Testnet Faucets

- **Moonbase Alpha DEV**: https://faucet.moonbeam.network/
- **AUSD Mock Stablecoin**: Use the mint function on the deployed MockStablecoin contract

## Architecture

### Smart Contracts

- **AfriYieldLendingPool**: Core lending pool managing deposits, loans, and repayments
- **AfriYieldOracle**: Stores risk scores on-chain for transparency
- **MockStablecoin**: ERC-20 test token (AUSD) for testnet operations

### Frontend

- **Next.js 14**: React framework with TypeScript
- **Tailwind CSS**: Utility-first styling
- **Ethers.js**: Blockchain interactions
- **@polkadot/api**: Wallet integration
- **Chart.js**: Data visualization

## User Flows

### Farmer Flow

1. Connect Polkadot wallet
2. Input farm data (crop type, yield, soil quality, rainfall, volatility)
3. Receive AI-calculated risk score
4. Request loan (50-500 AUSD) if score >= 70
5. Receive instant loan approval and funds
6. Repay loan within 90 days

### Lender Flow

1. Connect Polkadot wallet
2. Deposit AUSD stablecoins to lending pool
3. Earn 8% APY on deposits
4. Withdraw principal + yields anytime (if liquidity available)

### Transparency Dashboard

- View all loans with borrower addresses, amounts, risk scores, and status
- See aggregate statistics (total loans, average risk score, repayment rate)
- Real-time updates via blockchain events

## Security

- OpenZeppelin contracts for security standards
- ReentrancyGuard on all fund transfer functions
- SafeERC20 for token operations
- Access control for administrative functions
- Comprehensive test coverage

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For questions or issues, please open a GitHub issue or contact the team.

---

Built with ❤️ for smallholder farmers in East Africa
# afri_yield
