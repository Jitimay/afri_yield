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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">AfriYield - Farmer Dashboard</h1>
            <WalletConnect />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Farm Data Input */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Farm Data Assessment</h2>
            <FarmDataForm onAssessment={setRiskAssessment} />
          </div>

          {/* Risk Score Display */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Credit Score</h2>
            {riskAssessment ? (
              <RiskScoreGauge assessment={riskAssessment} />
            ) : (
              <div className="text-center text-gray-500 py-12">
                Complete the farm data form to see your credit score
              </div>
            )}
          </div>

          {/* Loan Request */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Request Loan</h2>
            <LoanRequestForm 
              riskAssessment={riskAssessment} 
              onSuccess={handleLoanSuccess}
            />
          </div>

          {/* Active Loans */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Your Active Loans</h2>
            <ActiveLoansTable key={refreshLoans} />
          </div>
        </div>
      </main>
    </div>
  );
}
