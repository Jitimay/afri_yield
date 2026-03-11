// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AfriYieldOracle
 * @dev Stores and manages risk scores on-chain for transparency
 */
contract AfriYieldOracle is Ownable {
    // Mapping from farmer address to risk score (0-100)
    mapping(address => uint256) public riskScores;
    
    // Mapping from farmer address to last update timestamp
    mapping(address => uint256) public lastUpdated;

    // Events
    event RiskScoreUpdated(address indexed farmer, uint256 score, uint256 timestamp);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Update risk score for a farmer
     * @param farmer Address of the farmer
     * @param score Risk score (0-100)
     */
    function updateRiskScore(address farmer, uint256 score) external onlyOwner {
        require(score <= 100, "Risk score must be between 0 and 100");
        
        riskScores[farmer] = score;
        lastUpdated[farmer] = block.timestamp;
        
        emit RiskScoreUpdated(farmer, score, block.timestamp);
    }

    /**
     * @dev Get risk score for a farmer
     * @param farmer Address of the farmer
     * @return Risk score
     */
    function getRiskScore(address farmer) external view returns (uint256) {
        return riskScores[farmer];
    }
}
