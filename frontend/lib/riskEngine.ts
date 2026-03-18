export type CropType = 'Coffee' | 'Maize' | 'Beans' | 'Tea' | 'Cassava';

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

export function normalizeRainfall(rainfall: number): number {
  if (rainfall >= 800 && rainfall <= 1500) return 100;
  if (rainfall < 400 || rainfall > 2000) return 0;
  if (rainfall < 800) return (rainfall - 400) / 4;
  return 100 - ((rainfall - 1500) / 5);
}

const CROP_MULTIPLIERS: Record<CropType, number> = {
  'Coffee': 1.2,
  'Tea': 1.1,
  'Maize': 1.0,
  'Beans': 0.9,
  'Cassava': 0.8
};

export function calculateRiskScore(data: FarmData): RiskAssessment {
  const weights = {
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
  const sizeScore = Math.min((data.farmSize || 1) * 10, 100);
  const experienceScore = Math.min((data.yearsExperience || 1) * 5, 100);
  const historyScore = (data.previousLoans || 0) > 0 ? Math.min(data.previousLoans * 20, 100) : 50;
  
  const yieldContribution = data.estimatedYield * weights.yield;
  const soilContribution = data.soilQuality * weights.soil;
  const rainfallContribution = rainfallScore * weights.rainfall;
  const volatilityPenalty = Math.abs(data.marketVolatility * weights.volatility);
  
  const rawScore = (
    yieldContribution +
    soilContribution +
    rainfallContribution -
    volatilityPenalty +
    sizeScore * weights.size +
    experienceScore * weights.experience +
    historyScore * weights.history
  ) * cropMultiplier;
  
  const finalScore = Math.max(0, Math.min(100, rawScore));
  const isEligible = finalScore >= 70;
  
  let recommendation = '';
  if (finalScore >= 70) {
    recommendation = 'Excellent! You qualify for a micro-loan.';
  } else if (finalScore >= 50) {
    recommendation = 'Moderate score. Consider improving soil quality.';
  } else {
    recommendation = 'Focus on improving yield estimates and soil quality.';
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
