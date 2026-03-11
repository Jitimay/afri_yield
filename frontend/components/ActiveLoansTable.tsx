'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/lib/walletContext';
import { getContractService, Loan } from '@/lib/contractService';
import { ethers } from 'ethers';

export default function ActiveLoansTable() {
  const { wallet } = useWallet();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [repayingLoanId, setRepayingLoanId] = useState<number | null>(null);

  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      loadLoans();
    }
  }, [wallet.isConnected, wallet.address]);

  const loadLoans = async () => {
    if (!wallet.address) return;
    
    setLoading(true);
    try {
      const contractService = getContractService();
      await contractService.initialize();
      
      const allLoans = await contractService.getAllLoans();
      const userLoans = allLoans.filter(
        loan => loan.borrower.toLowerCase() === wallet.address?.toLowerCase() && loan.isActive
      );
      
      setLoans(userLoans);
    } catch (error) {
      console.error('Failed to load loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepay = async (loanId: number) => {
    setRepayingLoanId(loanId);
    try {
      const contractService = getContractService();
      await contractService.initialize();
      
      const tx = await contractService.repayLoan(loanId);
      await tx.wait();
      
      await loadLoans();
    } catch (error: any) {
      console.error('Repayment failed:', error);
      alert(error.message || 'Failed to repay loan');
    } finally {
      setRepayingLoanId(null);
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="text-center text-gray-500 py-8">
        Connect wallet to view your loans
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-8">
        Loading loans...
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No active loans
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loans.map((loan, index) => (
        <div key={index} className="border dark:border-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-semibold">
                {ethers.formatEther(loan.amount)} AUSD
              </div>
              <div className="text-sm text-gray-500">
                Risk Score: {loan.riskScore}
              </div>
            </div>
            <div className="text-right text-sm">
              <div>Due: {new Date(Number(loan.dueDate) * 1000).toLocaleDateString()}</div>
              <div className={loan.isRepaid ? 'text-green-600' : 'text-yellow-600'}>
                {loan.isRepaid ? 'Repaid' : 'Active'}
              </div>
            </div>
          </div>
          
          {loan.isActive && !loan.isRepaid && (
            <button
              onClick={() => handleRepay(index + 1)}
              disabled={repayingLoanId === index + 1}
              className="w-full mt-2 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {repayingLoanId === index + 1 ? 'Repaying...' : 'Repay Loan'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
