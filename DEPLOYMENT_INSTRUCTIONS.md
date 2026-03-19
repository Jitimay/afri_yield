# Polkadot Hub Deployment Instructions

## Overview

The deployment script has been updated to deploy the core AfriYield contracts to Polkadot Hub network. The script is now ready for deployment.

## What Was Updated

### 1. Deployment Script (`scripts/deploy.js`)

The script now:
- Deploys **MockStablecoin** contract (AUSD token)
- Deploys **DecentralizedOracle** contract (enhanced version for multi-validator consensus)
- Deploys **AfriYieldLendingPool** contract (enhanced version with oracle integration)
- Saves deployment addresses to `deployments.json` with network info
- Displays comprehensive deployment summary with chain ID

### 2. Network Configuration

The Hardhat configuration (`hardhat.config.js`) already includes the Polkadot Hub network:
- **Network Name**: polkadotHub
- **RPC URL**: https://polkadot-hub-rpc.polkadot.io
- **Chain ID**: 420420420
- **Gas Price**: 1 gwei

## Prerequisites

Before deploying, ensure you have:

1. **Private Key**: Set `PRIVATE_KEY` in your `.env` file
   ```bash
   PRIVATE_KEY=your_private_key_here
   ```

2. **DOT Tokens**: Ensure your wallet has sufficient DOT for:
   - Contract deployment gas fees
   - Initial contract interactions

3. **RPC Access**: Verify the Polkadot Hub RPC endpoint is accessible
   ```bash
   curl https://polkadot-hub-rpc.polkadot.io
   ```

## Deployment Steps

### Step 1: Verify Environment

```bash
# Check that your .env file has the private key
cat .env | grep PRIVATE_KEY

# Verify Hardhat can connect to Polkadot Hub
npx hardhat console --network polkadotHub
```

### Step 2: Run Deployment

You can deploy using either method:

**Method 1: Using npm script (Recommended)**
```bash
npm run deploy:polkadot
```

**Method 2: Using Hardhat directly**
```bash
npx hardhat run scripts/deploy.js --network polkadotHub
```

### Step 3: Verify Deployment

The script will:
1. Deploy all three contracts sequentially
2. Save addresses to `deployments.json`
3. Display a deployment summary

Expected output:
```
Starting deployment to polkadotHub

1. Deploying MockStablecoin...
MockStablecoin deployed to: 0x...

2. Deploying DecentralizedOracle...
DecentralizedOracle deployed to: 0x...

3. Deploying AfriYieldLendingPool...
AfriYieldLendingPool deployed to: 0x...

✅ Deployment addresses saved to deployments.json

📋 Deployment Summary:
========================
Network: polkadotHub
Chain ID: 420420420
MockStablecoin: 0x...
DecentralizedOracle: 0x...
AfriYieldLendingPool: 0x...
========================

🎉 Deployment complete!
```

### Step 4: Update Frontend Configuration

After successful deployment, update `frontend/.env`:

```bash
# Copy the contract addresses from deployments.json
NEXT_PUBLIC_CHAIN_ID=420420420
NEXT_PUBLIC_RPC_URL=https://polkadot-hub-rpc.polkadot.io
NEXT_PUBLIC_LENDING_POOL_ADDRESS=<AfriYieldLendingPool address>
NEXT_PUBLIC_ORACLE_ADDRESS=<DecentralizedOracle address>
NEXT_PUBLIC_STABLECOIN_ADDRESS=<MockStablecoin address>
```

### Step 5: Verify Contracts (Optional)

If Polkadot Hub supports contract verification:

```bash
npx hardhat verify --network polkadotHub <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Deployed Contracts

### MockStablecoin
- **Symbol**: AUSD
- **Name**: AfriYield USD
- **Initial Supply**: 1,000,000 AUSD
- **Features**: Public mint function for testing

### DecentralizedOracle
- **Purpose**: Multi-validator risk score consensus
- **Min Validators**: 3
- **Features**: Validator registration, risk score submission, consensus mechanism

### AfriYieldLendingPool
- **Purpose**: Core lending functionality
- **Features**: 
  - Lender deposits with 8% APY
  - Loan requests with risk score validation
  - 5% insurance pool
  - Loan repayment tracking

## Troubleshooting

### Issue: "Insufficient funds for gas"
**Solution**: Ensure your wallet has enough DOT tokens for deployment

### Issue: "Network not found"
**Solution**: Verify `POLKADOT_HUB_RPC_URL` in `.env` or use default RPC

### Issue: "Nonce too high"
**Solution**: Reset your account nonce or wait for pending transactions

### Issue: "Contract deployment failed"
**Solution**: Check contract compilation with `npx hardhat compile`

## Post-Deployment Tasks

1. ✅ Update frontend environment variables
2. ✅ Test contract interactions
3. ✅ Verify contracts on block explorer
4. ✅ Initialize oracle with validators
5. ✅ Fund stablecoin contract for testing
6. ✅ Update documentation with contract addresses

## Contract Addresses

After deployment, addresses will be saved in `deployments.json`:

```json
{
  "network": "polkadotHub",
  "chainId": 420420420,
  "contracts": {
    "MockStablecoin": "0x...",
    "DecentralizedOracle": "0x...",
    "AfriYieldLendingPool": "0x..."
  },
  "timestamp": "2024-..."
}
```

## Next Steps

After successful deployment:

1. **Initialize Oracle**: Add validators to the DecentralizedOracle contract
2. **Test Deposits**: Use the frontend to test lender deposits
3. **Test Loans**: Submit loan requests with risk scores
4. **Monitor**: Check transactions on Polkadot Hub explorer

## Support

For issues or questions:
- Check Hardhat documentation: https://hardhat.org/docs
- Review Polkadot Hub documentation
- Verify network connectivity and gas prices
