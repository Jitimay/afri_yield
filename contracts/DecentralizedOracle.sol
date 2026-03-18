// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DecentralizedOracle {
    struct RiskData {
        uint256 score;
        uint256 timestamp;
        uint256 votes;
    }
    
    mapping(address => RiskData) public riskScores;
    mapping(address => mapping(address => bool)) public hasVoted;
    address[] public validators;
    uint256 public constant MIN_VALIDATORS = 3;
    
    event RiskScoreUpdated(address farmer, uint256 score);
    
    function addValidator(address validator) external {
        validators.push(validator);
    }
    
    function submitRiskScore(address farmer, uint256 score) external {
        require(isValidator(msg.sender), "Not validator");
        require(!hasVoted[farmer][msg.sender], "Already voted");
        
        hasVoted[farmer][msg.sender] = true;
        riskScores[farmer].votes++;
        
        if (riskScores[farmer].votes >= MIN_VALIDATORS) {
            riskScores[farmer].score = score;
            riskScores[farmer].timestamp = block.timestamp;
            emit RiskScoreUpdated(farmer, score);
        }
    }
    
    function isValidator(address addr) public view returns (bool) {
        for (uint i = 0; i < validators.length; i++) {
            if (validators[i] == addr) return true;
        }
        return false;
    }
    
    function getRiskScore(address farmer) external view returns (uint256) {
        return riskScores[farmer].score;
    }
}
