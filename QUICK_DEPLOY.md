# Quick Deployment Guide - Polkadot Hub

## TL;DR

```bash
# 1. Set your private key in .env
echo "PRIVATE_KEY=your_private_key_here" >> .env

# 2. Deploy to Polkadot Hub
npm run deploy:polkadot

# OR use the full command
npx hardhat run scripts/deploy.js --network polkadotHub

# 3. Check deployments.json for contract addresses
cat deployments.json
```

## What Gets Deployed

1. **MockStablecoin** (AUSD) - Test stablecoin with public mint
2. **DecentralizedOracle** - Multi-validator risk score consensus
3. **AfriYieldLendingPool** - Core lending pool with 8% APY

## Network Details

- **Network**: Polkadot Hub
- **Chain ID**: 420420420
- **RPC**: https://polkadot-hub-rpc.polkadot.io
- **Currency**: DOT

## After Deployment

Update `frontend/.env` with the new contract addresses from `deployments.json`:

```bash
NEXT_PUBLIC_CHAIN_ID=420420420
NEXT_PUBLIC_LENDING_POOL_ADDRESS=<from deployments.json>
NEXT_PUBLIC_ORACLE_ADDRESS=<from deployments.json>
NEXT_PUBLIC_STABLECOIN_ADDRESS=<from deployments.json>
```

## Troubleshooting

- **No DOT?** Get testnet DOT from Polkadot Hub faucet
- **Wrong network?** Check `.env` has correct `POLKADOT_HUB_RPC_URL`
- **Deployment fails?** Run `npm run compile` first to check for errors

## Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Start Hardhat console
npx hardhat console --network polkadotHub

# Deploy contracts one by one
const MockStablecoin = await ethers.getContractFactory("MockStablecoin");
const stablecoin = await MockStablecoin.deploy();
await stablecoin.waitForDeployment();
console.log("MockStablecoin:", await stablecoin.getAddress());

const DecentralizedOracle = await ethers.getContractFactory("DecentralizedOracle");
const oracle = await DecentralizedOracle.deploy();
await oracle.waitForDeployment();
console.log("DecentralizedOracle:", await oracle.getAddress());

const AfriYieldLendingPool = await ethers.getContractFactory("AfriYieldLendingPool");
const pool = await AfriYieldLendingPool.deploy(await stablecoin.getAddress());
await pool.waitForDeployment();
console.log("AfriYieldLendingPool:", await pool.getAddress());
```

## Verification

After deployment, verify on Polkadot Hub explorer:
- https://polkadot-hub.subscan.io

Search for your contract addresses to confirm deployment.
