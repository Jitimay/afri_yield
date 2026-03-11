'use client';

import { useState, useEffect } from 'react';
import { getContractService, Loan } from '@/lib/contractService';
import { ethers } from 'ethers';

export default function AggregateStats() {
  const [stats, setStats] = useState({
    totalLoans: 0,
    totalVolume: '0',
    averageRiskScore: 0,
    repaymentRate: 0,
    activeLoans: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const contractService = getContractService();
      await contractService.initialize();
      
      const loans = await contractService.getAllLoans();
      
      if (loans.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate total volume
      const totalVolume = loans.reduce((sum, loan) => sum + loan.amount, BigInt(0));
      
      // Calculate average risk score
      const avgRiskScore = loans.reduce((sum, loan) => sum + loan.riskScore, 0) / loans.length;
      
      // Calculate repayment rate
      const repaidLoans = loans.filter(l => l.isRepaid).length;
      const repaymentRate = (repaidLoans / loans.length) * 100;
      
      // Count active loans
      const activeLoans = loans.filter(l => l.isActive && !l.isRepaid).length;
      
      setStats({
        totalLoans: loans.length,
        totalVolume: ethers.formatEther(totalVolume),
        averageRiskScore: Math.round(avgRiskScore),
        repaymentRate: Math.round(repaymentRate),
        activeLoans
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-8">
        Loading statistics...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">Total Loans</div>
        <div className="text-2xl font-bold text-blue-600">{stats.totalLoans}</div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">Total Volume</div>
        <div className="text-2xl font-bold text-green-600">
          {parseFloat(stats.totalVolume).toFixed(0)} AUSD
        </div>
      </div>

      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">Avg Risk Score</div>
        <div className="text-2xl font-bold text-purple-600">{stats.averageRiskScore}</div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">Repayment Rate</div>
        <div className="text-2xl font-bold text-yellow-600">{stats.repaymentRate}%</div>
      </div>

      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">Active Loans</div>
        <div className="text-2xl font-bold text-orange-600">{stats.activeLoans}</div>
      </div>
    </div>
  );
}
