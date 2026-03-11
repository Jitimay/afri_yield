'use client';

import { useState } from 'react';
import WalletConnect from '@/components/WalletConnect';
import FarmDataForm from '@/components/FarmDataForm';
import RiskScoreGauge from '@/components/RiskScoreGauge';
import LoanRequestForm from '@/components/LoanRequestForm';
import ActiveLoansTable from '@/components/ActiveLoansTable';
import { RiskAssessment } from '@/lib/riskEngine';

export default function FarmerPage() {
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [refreshLoans, setRefreshLoans] = useState(0);

  const handleLoanSuccess = () => {
    setRefreshLoans(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🌾</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
                <p className="text-gray-600">Get AI credit scoring and request micro-loans</p>
              </div>
            </div>
            <WalletConnect />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Farm Data & Risk Score */}
          <div className="lg:col-span-2 space-y-8">
            {/* Farm Data Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <span className="mr-3">📊</span>
                  Farm Assessment
                </h2>
              </div>
              <div className="p-6">
                <FarmDataForm onAssessment={setRiskAssessment} />
              </div>
            </div>

            {/* Risk Score Display */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <span className="mr-3">🎯</span>
                  Credit Score Results
                </h2>
              </div>
              <div className="p-6">
                {riskAssessment ? (
                  <RiskScoreGauge assessment={riskAssessment} />
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📋</span>
                    </div>
                    Complete the farm data form to see your credit score
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Loan Actions */}
          <div className="space-y-8">
            {/* Loan Request */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <span className="mr-3">💰</span>
                  Request Loan
                </h2>
              </div>
              <div className="p-6">
                <LoanRequestForm 
                  riskAssessment={riskAssessment} 
                  onSuccess={handleLoanSuccess}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Loan Terms</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-emerald-100">Amount Range</span>
                  <span className="font-semibold">50-500 AUSD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-100">Duration</span>
                  <span className="font-semibold">90 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-100">Min. Score</span>
                  <span className="font-semibold">70/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-100">Approval</span>
                  <span className="font-semibold">Instant</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Loans */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <span className="mr-3">📋</span>
                Your Active Loans
              </h2>
            </div>
            <div className="p-6">
              <ActiveLoansTable key={refreshLoans} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
