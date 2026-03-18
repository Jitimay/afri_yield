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
export interface FarmData {
  cropType: CropType;
  estimatedYield: number;
  soilQuality: number;
  rainfall: number;
  marketVolatility: number;
  farmSize: number;
  yearsExperience: number;
  previousLoans: number;
}

export interface MLWeights {
  yield: number;
  soil: number;
  rainfall: number;
  volatility: number;
  size: number;
  experience: number;
  history: number;
}

const CROP_MULTIPLIERS: Record<CropType, number> = {
  'Coffee': 1.2,
  'Tea': 1.1,
  'Maize': 1.0,
  'Beans': 0.9,
  'Cassava': 0.8
};

export function calculateMLRiskScore(data: FarmData): RiskAssessment {
  const weights: MLWeights = {
    yield: 0.25,
    soil: 0.20,
    rainfall: 0.15,
    volatility: -0.10,
    size: 0.15,
    experience: 0.10,
    history: 0.15
  };
  
  const rainfallScore = normalizeRainfall(data.rainfall);
  const cropMultiplier = CROP_MULTIPLIERS[data.cropType];
  const sizeScore = Math.min(data.farmSize * 10, 100);
  const experienceScore = Math.min(data.yearsExperience * 5, 100);
  const historyScore = data.previousLoans > 0 ? Math.min(data.previousLoans * 20, 100) : 50;
  
  const rawScore = (
    data.estimatedYield * weights.yield +
    data.soilQuality * weights.soil +
    rainfallScore * weights.rainfall +
    data.marketVolatility * weights.volatility +
    sizeScore * weights.size +
    experienceScore * weights.experience +
    historyScore * weights.history
  ) * cropMultiplier;
  
  const score = Math.max(0, Math.min(100, rawScore));
  
  return {
    score,
    isEligible: score >= 70,
    breakdown: {
      yieldContribution: data.estimatedYield * weights.yield,
      soilContribution: data.soilQuality * weights.soil,
      rainfallContribution: rainfallScore * weights.rainfall,
      volatilityPenalty: Math.abs(data.marketVolatility * weights.volatility)
    },
    recommendation: score >= 70 ? "Eligible for loan" : "Improve farm metrics"
  };
}
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
