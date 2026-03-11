'use client';

import { useState } from 'react';
import { useWallet } from '@/lib/walletContext';
import { getContractService } from '@/lib/contractService';
import { ethers } from 'ethers';

export default function DepositForm() {
  const { wallet, updateBalances } = useWallet();
  const [amount, setAmount] = useState('100');
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.isConnected) return;

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setStatus('pending');
    setError(null);
    setTxHash(null);

    try {
      const contractService = getContractService();
      await contractService.initialize();

      const amountWei = ethers.parseEther(amount);
      const tx = await contractService.depositFunds(amountWei);
      
      setTxHash(tx.hash);
      await tx.wait();
      
      setStatus('success');
      setAmount('100');
      await updateBalances();
    } catch (err: any) {
      console.error('Deposit failed:', err);
      setStatus('error');
      setError(err.message || 'Failed to deposit funds');
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="text-center text-gray-500 py-8">
        Please connect your wallet to deposit funds
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Deposit Amount (AUSD)
        </label>
        <input
          type="number"
          min="0"
          step="10"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={status === 'pending'}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
        />
        <p className="text-xs text-gray-500 mt-1">
          Your balance: {wallet.balance.ausd} AUSD
        </p>
      </div>

      <button
        type="submit"
        disabled={status === 'pending'}
        className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'pending' ? 'Processing...' : 'Deposit Funds'}
      </button>

      {status === 'pending' && (
        <div className="text-center text-sm text-gray-600">
          Transaction pending... Please wait.
        </div>
      )}

      {status === 'success' && txHash && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg p-4">
          <div className="font-semibold text-green-800 dark:text-green-200">
            ✓ Deposit Successful!
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
