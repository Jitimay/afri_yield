# AfriYield - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js v18+ installed
- MetaMask, Talisman, or Polkadot.js wallet extension
- Basic understanding of blockchain/Web3

### Step 1: Install Dependencies (2 min)

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Compile Smart Contracts (1 min)

```bash
npm run compile
```

You should see:
```
Compiled 3 Solidity files successfully
```

### Step 3: Deploy to Local Network (Optional - 1 min)

```bash
# Terminal 1: Start local Hardhat node
npx hardhat node

# Terminal 2: Deploy contracts
npm run deploy:local
```

### Step 4: Deploy to Moonbase Alpha Testnet (3 min)

1. Get testnet DEV tokens:
   - Visit: https://faucet.moonbeam.network/
   - Select "Moonbase Alpha"
   - Enter your wallet address
   - Request tokens

2. Configure environment:
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your private key
# PRIVATE_KEY=your_private_key_here
```

3. Deploy:
```bash
npm run deploy:moonbase
```

4. Save the deployed addresses from output

### Step 5: Configure Frontend (1 min)

```bash
cd frontend

# Copy example env
cp .env.example .env

# Edit frontend/.env with deployed addresses:
# NEXT_PUBLIC_LENDING_POOL_ADDRESS=0x...
# NEXT_PUBLIC_ORACLE_ADDRESS=0x...
# NEXT_PUBLIC_STABLECOIN_ADDRESS=0x...
```

### Step 6: Run Frontend (1 min)

```bash
# From frontend directory
npm run dev
```

Visit: http://localhost:3000

### Step 7: Test the Platform (5 min)

#### A. Connect Wallet
1. Click "Connect Wallet"
2. Approve connection in your wallet

#### B. Get Test AUSD Tokens
1. Go to Moonscan: https://moonbase.moonscan.io
2. Find your deployed MockStablecoin contract
3. Call `mint(your_address, 1000000000000000000000)` to mint 1000 AUSD

#### C. Test Farmer Flow
1. Go to "Farmer Dashboard"
2. Fill in farm data or click "Demo Mode"
3. Click "Assess Credit"
4. If eligible, request a loan (e.g., 100 AUSD)
5. Approve transaction
6. See loan in "Active Loans"

#### D. Test Lender Flow
1. Go to "Lender Dashboard"
2. Enter deposit amount (e.g., 500 AUSD)
3. Approve token spending
4. Approve deposit transaction
5. View your position and yields

#### E. View Transparency
1. Go to "Transparency Dashboard"
2. See all loans
3. View aggregate statistics

## 🎯 Common Issues & Solutions

### Issue: "No Ethereum provider found"
**Solution**: Install MetaMask, Talisman, or Polkadot.js extension

### Issue: "Insufficient funds for transaction"
**Solution**: Get more DEV tokens from the faucet

### Issue: "Contract not deployed"
**Solution**: Check that you've deployed contracts and updated frontend/.env

### Issue: "Transaction failed"
**Solution**: 
- Check you have enough DEV for gas
- Check you have enough AUSD for the operation
- Check contract addresses are correct

### Issue: "Risk score below threshold"
**Solution**: Adjust farm data to increase score (higher yield, better soil, optimal rainfall)

## 📚 Next Steps

### For Development
- Read the full README.md
- Review smart contracts in `/contracts`
- Explore frontend components in `/frontend/components`
- Check design document in `.kiro/specs/afriyield-lending-platform/design.md`

### For Testing
- Test all user flows
- Try edge cases (max loan, min loan, withdrawal limits)
- Test with multiple wallets
- Verify on-chain data on Moonscan

### For Deployment
- Deploy to Moonbase Alpha (testnet)
- Test thoroughly
- Prepare demo video
- Submit to hackathon

## 🔗 Useful Links

- **Moonbase Alpha Faucet**: https://faucet.moonbeam.network/
- **Moonbase Explorer**: https://moonbase.moonscan.io
- **Moonbeam Docs**: https://docs.moonbeam.network/
- **Hardhat Docs**: https://hardhat.org/docs

## 💬 Support

If you encounter issues:
1. Check the error message carefully
2. Review the FINAL_SUMMARY.md for known limitations
3. Check contract addresses in frontend/.env
4. Verify you have testnet tokens
5. Check browser console for errors

## 🎉 You're Ready!

You now have a fully functional AI-powered micro-lending platform running on Polkadot's Moonbase Alpha testnet!

**Happy Testing! 🚀**
