'use client';

import { useState, useEffect } from 'react';
import { getContractService, Loan } from '@/lib/contractService';
import { ethers } from 'ethers';

export default function LoansTable() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'repaid'>('all');

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    setLoading(true);
    try {
      const contractService = getContractService();
      await contractService.initialize();
      
      const allLoans = await contractService.getAllLoans();
      setLoans(allLoans);
    } catch (error) {
      console.error('Failed to load loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const filteredLoans = loans.filter(loan => {
    if (filter === 'active') return loan.isActive && !loan.isRepaid;
    if (filter === 'repaid') return loan.isRepaid;
    return true;
  });

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-8">
        Loading loans...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All ({loans.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'active'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Active ({loans.filter(l => l.isActive && !l.isRepaid).length})
        </button>
        <button
          onClick={() => setFilter('repaid')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'repaid'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Repaid ({loans.filter(l => l.isRepaid).length})
        </button>
      </div>

      {/* Loans Table */}
      {filteredLoans.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No loans found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Borrower</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Risk Score</th>
                <th className="px-4 py-2 text-left">Due Date</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((loan, index) => (
                <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 font-mono text-sm">
                    {truncateAddress(loan.borrower)}
                  </td>
                  <td className="px-4 py-3">
                    {ethers.formatEther(loan.amount)} AUSD
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      loan.riskScore >= 70 ? 'bg-green-100 text-green-800' :
                      loan.riskScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {loan.riskScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(Number(loan.dueDate) * 1000).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      loan.isRepaid ? 'bg-green-100 text-green-800' :
                      loan.isActive ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {loan.isRepaid ? 'Repaid' : loan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
