'use client';

import WalletConnect from '@/components/WalletConnect';
import LoansTable from '@/components/LoansTable';
import AggregateStats from '@/components/AggregateStats';

export default function TransparencyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">AfriYield - Transparency Dashboard</h1>
            <WalletConnect />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Aggregate Statistics</h2>
            <AggregateStats />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">All Loans</h2>
            <LoansTable />
          </div>
        </div>
      </main>
    </div>
  );
}
