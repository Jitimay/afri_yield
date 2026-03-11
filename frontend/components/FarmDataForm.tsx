'use client';

import { useState } from 'react';
import { FarmData, CropType, calculateRiskScore, RiskAssessment } from '@/lib/riskEngine';

interface Props {
  onAssessment: (assessment: RiskAssessment) => void;
}

export default function FarmDataForm({ onAssessment }: Props) {
  const [formData, setFormData] = useState<FarmData>({
    cropType: 'Coffee',
    estimatedYield: 50,
    soilQuality: 50,
    rainfall: 1000,
    marketVolatility: 30
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FarmData, string>>>({});
  const [isDemoMode, setIsDemoMode] = useState(false);

  const cropTypes: CropType[] = ['Coffee', 'Maize', 'Beans', 'Tea', 'Cassava'];

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FarmData, string>> = {};

    if (formData.estimatedYield < 0 || formData.estimatedYield > 100) {
      newErrors.estimatedYield = 'Yield must be between 0 and 100 tons/ha';
    }

    if (formData.soilQuality < 0 || formData.soilQuality > 100) {
      newErrors.soilQuality = 'Soil quality must be between 0 and 100';
    }

    if (formData.rainfall <= 0) {
      newErrors.rainfall = 'Rainfall must be a positive number';
    }

    if (formData.marketVolatility < 0 || formData.marketVolatility > 100) {
      newErrors.marketVolatility = 'Market volatility must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const assessment = calculateRiskScore(formData);
      onAssessment(assessment);
    }
  };

  const handleDemoMode = () => {
    const demoData: FarmData = {
      cropType: 'Coffee',
      estimatedYield: 75,
      soilQuality: 80,
      rainfall: 1200,
      marketVolatility: 30
    };
    setFormData(demoData);
    setIsDemoMode(true);
    const assessment = calculateRiskScore(demoData);
    onAssessment(assessment);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isDemoMode && (
        <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded">
          Demo mode active - using sample data
        </div>
      )}

      {/* Crop Type */}
      <div>
        <label className="block text-sm font-medium mb-2">Crop Type</label>
        <select
          value={formData.cropType}
          onChange={(e) => setFormData({ ...formData, cropType: e.target.value as CropType })}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        >
          {cropTypes.map(crop => (
            <option key={crop} value={crop}>{crop}</option>
          ))}
        </select>
      </div>

      {/* Estimated Yield */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Estimated Yield (tons/hectare): {formData.estimatedYield}
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={formData.estimatedYield}
          onChange={(e) => setFormData({ ...formData, estimatedYield: Number(e.target.value) })}
          className="w-full"
        />
        {errors.estimatedYield && (
          <p className="text-red-500 text-sm mt-1">{errors.estimatedYield}</p>
        )}
      </div>

      {/* Soil Quality */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Soil Quality: {formData.soilQuality}
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={formData.soilQuality}
          onChange={(e) => setFormData({ ...formData, soilQuality: Number(e.target.value) })}
          className="w-full"
        />
        {errors.soilQuality && (
          <p className="text-red-500 text-sm mt-1">{errors.soilQuality}</p>
        )}
      </div>

      {/* Rainfall */}
      <div>
        <label className="block text-sm font-medium mb-2">Rainfall (mm)</label>
        <input
          type="number"
          value={formData.rainfall}
          onChange={(e) => setFormData({ ...formData, rainfall: Number(e.target.value) })}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
        {errors.rainfall && (
          <p className="text-red-500 text-sm mt-1">{errors.rainfall}</p>
        )}
      </div>

      {/* Market Volatility */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Market Volatility: {formData.marketVolatility}
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={formData.marketVolatility}
          onChange={(e) => setFormData({ ...formData, marketVolatility: Number(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Low</span>
          <span>High</span>
        </div>
        {errors.marketVolatility && (
          <p className="text-red-500 text-sm mt-1">{errors.marketVolatility}</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition"
        >
          Assess Credit
        </button>
        <button
          type="button"
          onClick={handleDemoMode}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          Demo Mode
        </button>
      </div>
    </form>
  );
}
