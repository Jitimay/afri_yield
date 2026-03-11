'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  balance: {
    native: string;
    ausd: string;
  };
}

interface WalletContextType {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  updateBalances: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    balance: {
      native: '0',
      ausd: '0'
    }
  });

  const connectWallet = async () => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Please install MetaMask, Talisman, or Polkadot.js extension');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      setWallet(prev => ({
        ...prev,
        address,
        isConnected: true
      }));

      await updateBalances();
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setWallet({
      address: null,
      isConnected: false,
      balance: {
        native: '0',
        ausd: '0'
      }
    });
    localStorage.removeItem('walletConnected');
  };

  const updateBalances = async () => {
    try {
      if (!wallet.address && !window.ethereum) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Get native balance (DEV tokens)
      const nativeBalance = await provider.getBalance(address);
      const nativeFormatted = ethers.formatEther(nativeBalance);

      // Get AUSD balance
      let ausdFormatted = '0';
      const stablecoinAddress = process.env.NEXT_PUBLIC_STABLECOIN_ADDRESS;
      if (stablecoinAddress) {
        const stablecoinAbi = ['function balanceOf(address) view returns (uint256)'];
        const stablecoin = new ethers.Contract(stablecoinAddress, stablecoinAbi, provider);
        const ausdBalance = await stablecoin.balanceOf(address);
        ausdFormatted = ethers.formatEther(ausdBalance);
      }

      setWallet(prev => ({
        ...prev,
        balance: {
          native: parseFloat(nativeFormatted).toFixed(4),
          ausd: parseFloat(ausdFormatted).toFixed(2)
        }
      }));
    } catch (error) {
      console.error('Failed to update balances:', error);
    }
  };

  // Auto-connect if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected');
    if (wasConnected === 'true') {
      connectWallet().catch(console.error);
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWallet(prev => ({
            ...prev,
            address: accounts[0]
          }));
          updateBalances();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  // Save connection state
  useEffect(() => {
    if (wallet.isConnected) {
      localStorage.setItem('walletConnected', 'true');
    }
  }, [wallet.isConnected]);

  return (
    <WalletContext.Provider value={{ wallet, connectWallet, disconnectWallet, updateBalances }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
