# 🚀 AfriYield Server Deployment Guide

## 🔒 **Security Setup Complete**

✅ **Sensitive files protected by .gitignore:**
- Private keys (`.env` files)
- Contract addresses (`deployments.json`)
- Build artifacts and cache
- Node modules and temporary files

## 📋 **Deployment Steps**

### 1. **Clone Repository**
```bash
git clone <your-repo-url>
cd afriyield
```

### 2. **Install Dependencies**
```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend && npm install && cd ..
```

### 3. **Configure Environment**
```bash
# Create environment files (NOT in git)
cp .env.example .env
cp frontend/.env.example frontend/.env

# Edit .env with your deployment private key
nano .env

# Edit frontend/.env with contract addresses
nano frontend/.env
```

### 4. **Deploy Contracts** (if needed)
```bash
# Deploy to Moonbase Alpha
npm run deploy:moonbase

# Copy addresses to frontend/.env
```

### 5. **Build Frontend**
```bash
cd frontend
npm run build
```

### 6. **Deploy Options**

#### **Option A: Vercel (Recommended)**
```bash
cd frontend
npm install -g vercel
vercel --prod
```

#### **Option B: Netlify**
```bash
cd frontend
npm run build
# Upload 'out' folder to Netlify
```

#### **Option C: VPS/Server**
```bash
cd frontend
npm run build
npm start
# Or use PM2 for production
```

## 🔧 **Environment Variables Needed**

### **Root `.env`**
```bash
MOONBASE_RPC_URL=https://rpc.api.moonbase.moonbeam.network
PRIVATE_KEY=your_deployment_private_key_here
NETWORK=moonbaseAlpha
CHAIN_ID=1287
```

### **Frontend `.env`**
```bash
NEXT_PUBLIC_LENDING_POOL_ADDRESS=0x...
NEXT_PUBLIC_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_STABLECOIN_ADDRESS=0x...
NEXT_PUBLIC_NETWORK=moonbaseAlpha
NEXT_PUBLIC_CHAIN_ID=1287
NEXT_PUBLIC_RPC_URL=https://rpc.api.moonbase.moonbeam.network
```

## ⚠️ **Security Checklist**

- ✅ Private keys NOT in repository
- ✅ Environment files ignored by git
- ✅ Contract addresses configurable
- ✅ No hardcoded secrets in code
- ✅ Build artifacts excluded
- ✅ Node modules ignored

## 🌐 **Live Deployment URLs**

After deployment, update these:
- **Frontend**: https://your-domain.com
- **Contracts**: Moonbase Alpha testnet
- **Block Explorer**: https://moonbase.moonscan.io/

## 📝 **Notes**

- Contracts are on **Moonbase Alpha testnet**
- Users need **DEV tokens** for gas fees
- **AUSD tokens** can be minted from contract
- All transactions are **free** (testnet)

**Your repository is now secure for public deployment!** 🔒✅
