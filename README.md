# AfriYield - AI-Powered Agricultural Lending on Polkadot Hub

AfriYield is the first decentralized micro-lending platform built natively on Polkadot Hub, connecting smallholder farmers in East Africa with global lenders through AI-powered risk assessment and cross-chain capabilities.

## 🌟 Why Polkadot?

AfriYield leverages Polkadot's unique features to solve complex agricultural finance challenges:

- **🔗 Cross-Chain Lending**: Seamless deposits from Asset Hub, Acala, and other parachains via XCM
- **🛡️ Shared Security**: Farmers' funds protected by Polkadot's unified security model
- **🔮 Decentralized Oracle**: Validator consensus for transparent, tamper-proof risk assessment
- **💎 Native DOT Integration**: Collateral, rewards, and governance using Polkadot's native token
- **⚡ Scalability**: Multi-parachain expansion for regional agricultural markets

## 🚀 Key Features

### Decentralized Oracle Network
- Validators stake 100+ DOT to participate in risk assessment
- Consensus mechanism with median score calculation
- Automatic reward distribution and slashing for outliers
- Transparent, on-chain credit scoring

### Cross-Chain Deposits (XCM)
- Accept deposits from Asset Hub (parachain 1000)
- Support for Acala (parachain 2000) and future parachains
- Automatic XCM message processing and validation
- Replay attack protection

### AI-Powered Risk Assessment
- On-chain risk calculation from farm data
- Crop-specific multipliers (Coffee: 1.2x, Tea: 1.1x, etc.)
- Rainfall normalization curves
- Experience and history weighting

### DOT Collateral System
- Optional DOT collateral for better loan terms
- 70% Loan-to-Value ratio
- Automatic liquidation protection
- Collateral return on repayment

### Governance DAO
- Stake DOT for voting power (1:1 ratio)
- 14-day unbonding period
- Proposal creation and voting
- 2-day timelock for execution

## 📊 Technical Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Asset Hub     │    │   Polkadot Hub   │    │     Acala       │
│   (ID: 1000)    │◄──►│   (ID: 420420417)│◄──►│   (ID: 2000)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
            ┌───────▼───┐ ┌───▼────┐ ┌──▼──────┐
            │XCMBridge │ │ Oracle │ │Lending  │
            │Contract  │ │Network │ │Pool     │
            └──────────┘ └────────┘ └─────────┘
```

### Smart Contracts
- **AfriYieldLendingPool**: Core lending logic with DOT integration
- **DecentralizedOracle**: Validator staking and consensus mechanism  
- **RiskCalculator**: On-chain farm data risk assessment
- **XCMBridge**: Cross-chain message processing
- **AfriYieldGovernance**: DOT-based governance system
- **MockStablecoin**: AUSD test token for demonstrations

## 🛠️ Development Setup

### Prerequisites
- Node.js v18+ and npm
- Polkadot.js or Talisman wallet extension
- Polkadot Hub testnet DOT tokens

### Installation

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Polkadot Hub
npm run deploy:polkadot
```

### Environment Configuration

```bash
# Root .env
PRIVATE_KEY=your_private_key_here
POLKADOT_HUB_RPC_URL=https://polkadot-hub-rpc.polkadot.io

# Frontend .env
NEXT_PUBLIC_CHAIN_ID=420420417
NEXT_PUBLIC_RPC_URL=https://polkadot-hub-rpc.polkadot.io
NEXT_PUBLIC_LENDING_POOL_ADDRESS=deployed_address
NEXT_PUBLIC_ORACLE_ADDRESS=deployed_address
NEXT_PUBLIC_RISK_CALCULATOR_ADDRESS=deployed_address
NEXT_PUBLIC_XCM_BRIDGE_ADDRESS=deployed_address
NEXT_PUBLIC_GOVERNANCE_ADDRESS=deployed_address
```

## 🎯 User Flows

### Farmer Journey
1. Connect Polkadot wallet to Polkadot Hub
2. Input farm data (crop type, yield, soil quality, rainfall)
3. Receive AI-calculated risk score from decentralized oracle
4. Optional: Deposit DOT collateral for better terms
5. Request loan (50-500 AUSD) with instant approval
6. Repay loan within 90 days and reclaim collateral

### Lender Journey  
1. Connect wallet and switch to Polkadot Hub
2. Deposit AUSD from Asset Hub or Acala via XCM
3. Earn 8% APY + DOT rewards from lending pool
4. Stake DOT for governance participation
5. Vote on protocol parameters and upgrades
6. Withdraw funds + yields anytime (subject to liquidity)

### Validator Journey
1. Register as oracle validator with 100+ DOT stake
2. Submit risk scores for farmer loan applications
3. Participate in consensus mechanism (3+ validators required)
4. Earn DOT rewards for accurate assessments
5. Risk slashing for consistent outlier behavior

## 🔧 Network Configuration

### Polkadot Hub Testnet
- **Chain ID**: 420420417
- **RPC URL**: https://polkadot-hub-rpc.polkadot.io
- **Explorer**: https://polkadot-hub.subscan.io
- **Faucet**: https://faucet.polkadot-hub.io

### Supported Parachains
- **Asset Hub**: Parachain ID 1000 (AUSD deposits)
- **Acala**: Parachain ID 2000 (aUSD deposits)
- **Future**: Moonbeam, Astar, and other EVM parachains

## 📈 Performance Metrics

### Gas Efficiency
- Risk calculation: <100k gas
- Loan processing: <200k gas  
- Cross-chain deposit: <150k gas
- Oracle consensus: <80k gas per validator

### Scalability
- Target: 10,000+ farmers by 2027
- Loan volume: $1M+ annually
- Cross-chain support: 5+ parachains
- Validator network: 50+ active validators

## 🏆 Hackathon Highlights

### Polkadot-Specific Innovation
- **First agricultural lending platform on Polkadot Hub**
- **Native XCM integration for cross-parachain deposits**
- **Decentralized oracle with DOT staking mechanism**
- **DOT collateral system with automatic liquidation**
- **Governance DAO with DOT-based voting power**

### Technical Excellence
- 6 interconnected smart contracts
- Comprehensive test coverage (15+ tests)
- OpenZeppelin security standards
- Gas-optimized implementations
- Professional frontend with wallet integration

### Real-World Impact
- Addresses $240B agricultural finance gap
- Targets 570M+ smallholder farmers
- Demonstrates Polkadot's utility for emerging markets
- Creates sustainable DeFi use case with social impact

## 🔗 Links

- **Live Demo**: https://afriyield-polkadot.vercel.app
- **Demo Video**: [3-minute walkthrough](./DEMO_VIDEO_SCRIPT.md)
- **Contracts**: Deployed and verified on Polkadot Hub
- **Documentation**: Complete technical docs in `/docs`

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built with ❤️ for the Polkadot Solidity Hackathon**

*Empowering African agriculture through Polkadot's cross-chain infrastructure*
# afri_yield
