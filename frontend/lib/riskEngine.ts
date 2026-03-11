export type CropType = 'Coffee' | 'Maize' | 'Beans' | 'Tea' | 'Cassava';

export interface FarmData {
  cropType: CropType;
  estimatedYield: number;    // 0-100 tons/ha
  soilQuality: number;       // 0-100
  rainfall: number;          // mm
  marketVolatility: number;  // 0-100
}

export interface RiskAssessment {
  score: number;
  isEligible: boolean;
  breakdown: {
    yieldContribution: number;
    soilContribution: number;
    rainfallContribution: number;
    volatilityPenalty: number;
  };
  recommendation: string;
}

/**
 * Normalize rainfall to a 0-100 score
 * Optimal range: 800-1500mm = 100 score
 * Below 400mm or above 2000mm = 0 score
 */
export function normalizeRainfall(rainfall: number): number {
  if (rainfall >= 800 && rainfall <= 1500) return 100;
  if (rainfall < 400 || rainfall > 2000) return 0;
  if (rainfall < 800) return (rainfall - 400) / 4;
  return 100 - ((rainfall - 1500) / 5);
}

/**
 * Calculate risk score from farm data
 * Formula: (yield × 0.4) + (soil × 0.3) + (rainfall × 0.2) - (volatility × 0.1)
 */
export function calculateRiskScore(data: FarmData): RiskAssessment {
  // Normalize rainfall
  const rainfallScore = normalizeRainfall(data.rainfall);
  
  // Calculate weighted components
  const yieldContribution = data.estimatedYield * 0.4;
  const soilContribution = data.soilQuality * 0.3;
  const rainfallContribution = rainfallScore * 0.2;
  const volatilityPenalty = data.marketVolatility * 0.1;
  
  // Calculate final score
  const rawScore = yieldContribution + soilContribution + rainfallContribution - volatilityPenalty;
  const finalScore = Math.max(0, Math.min(100, rawScore));
  
  // Determine eligibility
  const isEligible = finalScore >= 70;
  
  // Generate recommendation
  let recommendation = '';
  if (finalScore >= 70) {
    recommendation = 'Excellent! You qualify for a micro-loan. Your farm data shows strong potential for successful harvest.';
  } else if (finalScore >= 50) {
    recommendation = 'Your score is moderate. Consider improving soil quality or adjusting crop selection to increase eligibility.';
  } else {
    recommendation = 'Your current score is below the threshold. Focus on improving yield estimates and soil quality for better eligibility.';
  }
  
  return {
    score: Math.round(finalScore),
    isEligible,
    breakdown: {
      yieldContribution: Math.round(yieldContribution * 10) / 10,
      soilContribution: Math.round(soilContribution * 10) / 10,
      rainfallContribution: Math.round(rainfallContribution * 10) / 10,
      volatilityPenalty: Math.round(volatilityPenalty * 10) / 10
    },
    recommendation
  };
}
