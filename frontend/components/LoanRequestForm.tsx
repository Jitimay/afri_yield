'use client';

import { useState } from 'react';
import { useWallet } from '@/lib/walletContext';
import { getContractService } from '@/lib/contractService';
import { RiskAssessment } from '@/lib/riskEngine';
import { ethers } from 'ethers';

interface Props {
  riskAssessment: RiskAssessment | null;
  onSuccess?: () => void;
}

export default function LoanRequestForm({ riskAssessment, onSuccess }: Props) {
  const { wallet } = useWallet();
  const [amount, setAmount] = useState('100');
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const isEnabled = wallet.isConnected && riskAssessment && riskAssessment.isEligible;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEnabled || !riskAssessment) return;

    const amountNum = parseFloat(amount);
    if (amountNum < 50 || amountNum > 500) {
      setError('Loan amount must be between 50 and 500 AUSD');
      return;
    }

    setStatus('pending');
    setError(null);
    setTxHash(null);

    try {
      const contractService = getContractService();
      await contractService.initialize();

      const amountWei = ethers.parseEther(amount);
      const tx = await contractService.requestLoan(amountWei, riskAssessment.score);
      
      setTxHash(tx.hash);
      await tx.wait();
      
      setStatus('success');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Loan request failed:', err);
      setStatus('error');
      setError(err.message || 'Failed to request loan');
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="text-center text-gray-500 py-8">
        Please connect your wallet to request a loan
      </div>
    );
  }

  if (!riskAssessment) {
    return (
      <div className="text-center text-gray-500 py-8">
        Complete the farm data assessment first
      </div>
    );
  }

  if (!riskAssessment.isEligible) {
    return (
      <div className="text-center text-red-600 py-8">
        Your risk score is below the threshold (70). Improve your farm data to qualify for a loan.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Loan Amount (AUSD)
        </label>
        <input
          type="number"
          min="50"
          max="500"
          step="10"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={status === 'pending'}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
        />
        <p className="text-xs text-gray-500 mt-1">
          Minimum: 50 AUSD | Maximum: 500 AUSD
        </p>
      </div>

      <button
        type="submit"
        disabled={!isEnabled || status === 'pending'}
        className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'pending' ? 'Processing...' : 'Request Loan'}
      </button>

      {status === 'pending' && (
        <div className="text-center text-sm text-gray-600">
          Transaction pending... Please wait.
        </div>
      )}

      {status === 'success' && txHash && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg p-4">
          <div className="font-semibold text-green-800 dark:text-green-200">
            ✓ Loan Approved!
          </div>
          <a
            href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:underline"
          >
            View on Explorer →
          </a>
        </div>
      )}

      {status === 'error' && error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}
    </form>
  );
}
