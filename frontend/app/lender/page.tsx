'use client';

import WalletConnect from '@/components/WalletConnect';
import PoolStats from '@/components/PoolStats';
import DepositForm from '@/components/DepositForm';
import WithdrawForm from '@/components/WithdrawForm';

export default function LenderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Lender Dashboard</h1>
                <p className="text-gray-600">Deposit funds and earn 8% APY</p>
              </div>
            </div>
            <WalletConnect />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pool Statistics - Full Width */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <span className="mr-3">📊</span>
                  Pool Statistics
                </h2>
              </div>
              <div className="p-6">
                <PoolStats />
              </div>
            </div>
          </div>

          {/* Deposit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <span className="mr-3">💳</span>
                  Deposit Funds
                </h2>
              </div>
              <div className="p-6">
                <DepositForm />
              </div>
            </div>
          </div>

          {/* APY Info Card */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Earning Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-100">Fixed APY</span>
                  <span className="font-semibold text-2xl">8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Compounding</span>
                  <span className="font-semibold">Continuous</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Withdrawal</span>
                  <span className="font-semibold">Anytime</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">How It Works</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-purple-200">1.</span>
                  <span>Deposit AUSD tokens</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-purple-200">2.</span>
                  <span>Earn 8% APY automatically</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-purple-200">3.</span>
                  <span>Withdraw anytime with yields</span>
                </div>
              </div>
            </div>
          </div>

          {/* Withdraw Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <span className="mr-3">💸</span>
                  Withdraw Funds
                </h2>
              </div>
              <div className="p-6">
                <WithdrawForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
