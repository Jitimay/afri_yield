'use client';

import WalletConnect from '@/components/WalletConnect';
import LoansTable from '@/components/LoansTable';
import AggregateStats from '@/components/AggregateStats';

export default function TransparencyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Transparency Hub</h1>
                <p className="text-gray-600">Complete platform visibility and real-time data</p>
              </div>
            </div>
            <WalletConnect />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Aggregate Statistics */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <span className="mr-3">📈</span>
                Platform Statistics
              </h2>
            </div>
            <div className="p-6">
              <AggregateStats />
            </div>
          </div>

          {/* All Loans Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <span className="mr-3">📋</span>
                All Platform Loans
              </h2>
            </div>
            <div className="p-6">
              <LoansTable />
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">🌾 For Farmers</h3>
              <p className="text-emerald-100 text-sm">
                All loan data is publicly visible to ensure trust and accountability in the lending process.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">💰 For Lenders</h3>
              <p className="text-blue-100 text-sm">
                Monitor platform performance and loan repayment rates to make informed investment decisions.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-3">🔍 Full Transparency</h3>
              <p className="text-purple-100 text-sm">
                Every transaction is recorded on-chain, providing complete transparency and auditability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
