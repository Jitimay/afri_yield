'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/lib/walletContext';
import { getContractService, PoolStats as PoolStatsType } from '@/lib/contractService';
import { ethers } from 'ethers';

export default function PoolStats() {
  const { wallet } = useWallet();
  const [stats, setStats] = useState<PoolStatsType | null>(null);
  const [userDeposit, setUserDeposit] = useState<string>('0');
  const [userYield, setUserYield] = useState<string>('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wallet.isConnected) {
      loadStats();
      const interval = setInterval(loadStats, 3000); // Update every 3s
      return () => clearInterval(interval);
    }
  }, [wallet.isConnected, wallet.address]);

  const loadStats = async () => {
    if (!wallet.address) return;
    
    setLoading(true);
    try {
      const contractService = getContractService();
      await contractService.initialize();
      
      const poolStats = await contractService.getPoolStats();
      setStats(poolStats);
      
      const userYieldAmount = await contractService.calculateYield(wallet.address);
      setUserYield(ethers.formatEther(userYieldAmount));
      
      // Note: Would need to add getLenderDeposit to contract service
      // For now, showing 0
      setUserDeposit('0');
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="text-center text-gray-500 py-8">
        Connect wallet to view pool statistics
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="text-center text-gray-500 py-8">
        Loading statistics...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Pool Balance</div>
          <div className="text-2xl font-bold text-primary-600">
            {stats ? ethers.formatEther(stats.totalDeposits) : '0'} AUSD
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Loans</div>
          <div className="text-2xl font-bold text-blue-600">
            {stats ? ethers.formatEther(stats.totalLoans) : '0'} AUSD
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Available Liquidity</div>
          <div className="text-2xl font-bold text-green-600">
            {stats ? ethers.formatEther(stats.availableLiquidity) : '0'} AUSD
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">Current APY</div>
          <div className="text-2xl font-bold text-purple-600">8%</div>
        </div>
      </div>

      <div className="border-t dark:border-gray-700 pt-4">
        <h3 className="font-semibold mb-2">Your Position</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Your Deposits:</span>
            <span className="font-mono">{userDeposit} AUSD</span>
          </div>
          <div className="flex justify-between">
            <span>Accrued Yield:</span>
            <span className="font-mono text-green-600">{userYield} AUSD</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total Value:</span>
            <span className="font-mono">
              {(parseFloat(userDeposit) + parseFloat(userYield)).toFixed(4)} AUSD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
