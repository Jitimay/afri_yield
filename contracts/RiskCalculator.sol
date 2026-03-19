// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RiskCalculator {
    struct FarmData {
        uint8 cropType; // 0=Coffee, 1=Tea, 2=Maize, 3=Beans, 4=Cassava
        uint256 estimatedYield; // kg per hectare
        uint8 soilQuality; // 1-10 scale
        uint256 rainfall; // mm per year
        uint8 marketVolatility; // 1-10 scale
        uint256 farmSize; // hectares
        uint8 yearsExperience; // years
        uint8 previousLoans; // number of previous loans
    }
    
    mapping(uint8 => uint256) public cropMultipliers;
    
    event RiskScoreCalculated(address farmer, uint256 score, bytes32 dataHash);
    
    constructor() {
        cropMultipliers[0] = 120; // Coffee: 1.2x
        cropMultipliers[1] = 110; // Tea: 1.1x
        cropMultipliers[2] = 100; // Maize: 1.0x
        cropMultipliers[3] = 90;  // Beans: 0.9x
        cropMultipliers[4] = 80;  // Cassava: 0.8x
    }
    
    function calculateRiskScore(FarmData memory data) external returns (uint256) {
        require(data.cropType <= 4, "Invalid crop type");
        require(data.soilQuality >= 1 && data.soilQuality <= 10, "Invalid soil quality");
        require(data.marketVolatility >= 1 && data.marketVolatility <= 10, "Invalid volatility");
        require(data.farmSize > 0, "Invalid farm size");
        
        uint256 score = 0;
        
        // Yield contribution (25%)
        uint256 yieldScore = (data.estimatedYield * 25) / 1000; // Normalize to 0-25
        if (yieldScore > 25) yieldScore = 25;
        score += yieldScore;
        
        // Soil quality contribution (20%)
        score += (data.soilQuality * 20) / 10;
        
        // Rainfall contribution (15%)
        uint256 rainfallScore = normalizeRainfall(data.rainfall);
        score += (rainfallScore * 15) / 100;
        
        // Apply crop multiplier (10%)
        uint256 cropBonus = (10 * cropMultipliers[data.cropType]) / 100;
        score += cropBonus;
        
        // Market volatility (10% - inverse)
        score += (10 * (11 - data.marketVolatility)) / 10;
        
        // Farm size contribution (10%)
        uint256 sizeScore = data.farmSize >= 5 ? 10 : (data.farmSize * 2);
        score += sizeScore;
        
        // Experience contribution (5%)
        uint256 expScore = data.yearsExperience >= 10 ? 5 : (data.yearsExperience / 2);
        score += expScore;
        
        // Previous loans history (5%)
        uint256 historyScore = data.previousLoans >= 3 ? 5 : data.previousLoans;
        score += historyScore;
        
        if (score > 100) score = 100;
        
        bytes32 dataHash = keccak256(abi.encode(data));
        emit RiskScoreCalculated(msg.sender, score, dataHash);
        
        return score;
    }
    
    function normalizeRainfall(uint256 rainfall) public pure returns (uint256) {
        if (rainfall >= 800 && rainfall <= 1500) {
            return 100; // Optimal range
        } else if (rainfall >= 600 && rainfall < 800) {
            return 80; // Below optimal
        } else if (rainfall > 1500 && rainfall <= 2000) {
            return 80; // Above optimal
        } else if (rainfall >= 400 && rainfall < 600) {
            return 60; // Low
        } else if (rainfall > 2000 && rainfall <= 2500) {
            return 60; // High
        } else {
            return 20; // Extreme (too low or too high)
        }
    }
    
    function validateFarmData(FarmData memory data) external pure returns (bool) {
        return data.cropType <= 4 &&
               data.soilQuality >= 1 && data.soilQuality <= 10 &&
               data.marketVolatility >= 1 && data.marketVolatility <= 10 &&
               data.farmSize > 0 &&
               data.estimatedYield > 0;
    }
}
