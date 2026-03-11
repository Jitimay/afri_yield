'use client';

import WalletConnect from '@/components/WalletConnect';
import PoolStats from '@/components/PoolStats';
import DepositForm from '@/components/DepositForm';
import WithdrawForm from '@/components/WithdrawForm';

export default function LenderPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">AfriYield - Lender Dashboard</h1>
            <WalletConnect />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Pool Statistics</h2>
            <PoolStats />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Deposit Funds</h2>
            <DepositForm />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Withdraw Funds</h2>
            <WithdrawForm />
          </div>
        </div>
      </main>
    </div>
  );
}
