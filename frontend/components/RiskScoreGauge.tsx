'use client';

import { RiskAssessment } from '@/lib/riskEngine';

interface Props {
  assessment: RiskAssessment;
}

export default function RiskScoreGauge({ assessment }: Props) {
  const getColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBgColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 dark:bg-green-900';
    if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  return (
    <div className="space-y-4">
      {/* Score Display */}
      <div className={`${getBgColor(assessment.score)} rounded-lg p-6 text-center`}>
        <div className={`text-6xl font-bold ${getColor(assessment.score)}`}>
          {assessment.score}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Credit Score
        </div>
      </div>

      {/* Eligibility Status */}
      <div className={`p-4 rounded-lg ${assessment.isEligible ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' : 'bg-red-50 dark:bg-red-900/20 border border-red-200'}`}>
        <div className="font-semibold">
          {assessment.isEligible ? '✓ Eligible for Loan' : '✗ Not Eligible'}
        </div>
        <div className="text-sm mt-1">
          {assessment.recommendation}
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm">Score Breakdown:</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Yield Contribution:</span>
            <span className="font-mono">+{assessment.breakdown.yieldContribution}</span>
          </div>
          <div className="flex justify-between">
            <span>Soil Contribution:</span>
            <span className="font-mono">+{assessment.breakdown.soilContribution}</span>
          </div>
          <div className="flex justify-between">
            <span>Rainfall Contribution:</span>
            <span className="font-mono">+{assessment.breakdown.rainfallContribution}</span>
          </div>
          <div className="flex justify-between">
            <span>Volatility Penalty:</span>
            <span className="font-mono text-red-600">-{assessment.breakdown.volatilityPenalty}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
