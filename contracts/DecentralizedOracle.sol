// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract DecentralizedOracle is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IERC20 public pasToken;
    struct Validator {
        uint256 stake;
        uint256 rewards;
        uint256 outlierCount;
        uint256 registrationTime;
        bool isActive;
    }
    
    mapping(address => Validator) public validators;
    mapping(address => mapping(address => uint256)) public riskScores;
    mapping(address => uint256) public finalizedScores;
    mapping(address => address[]) public submissions;
    mapping(address => uint256) public unbondingAmount;
    mapping(address => uint256) public unbondingDeadline;
    
    uint256 public constant MIN_STAKE = 100 ether;
    uint256 public constant CONSENSUS_THRESHOLD = 3;
    uint256 public constant UNBONDING_PERIOD = 7 days;
    uint256 public constant SLASH_PERCENTAGE = 10;
    
    event ValidatorRegistered(address validator, uint256 stake);
    event RiskScoreSubmitted(address validator, address farmer, uint256 score);
    event RiskScoreFinalized(address farmer, uint256 finalScore, address[] validators);
    event RewardsDistributed(address[] validators, uint256 totalRewards);
    event ValidatorSlashed(address validator, uint256 amount);
    event UnbondingStarted(address validator, uint256 amount, uint256 deadline);
    
    constructor(address _pasToken) Ownable(msg.sender) {
        pasToken = IERC20(_pasToken);
    }
    
    function registerValidator(uint256 stakeAmount) external {
        require(stakeAmount >= MIN_STAKE, "Insufficient stake");
        require(!validators[msg.sender].isActive, "Already registered");
        
        pasToken.safeTransferFrom(msg.sender, address(this), stakeAmount);
        
        validators[msg.sender] = Validator({
            stake: stakeAmount,
            rewards: 0,
            outlierCount: 0,
            registrationTime: block.timestamp,
            isActive: true
        });
        
        emit ValidatorRegistered(msg.sender, stakeAmount);
    }
    
    function unregisterValidator() external {
        require(validators[msg.sender].isActive, "Not active validator");
        
        uint256 amount = validators[msg.sender].stake;
        validators[msg.sender].isActive = false;
        unbondingAmount[msg.sender] = amount;
        unbondingDeadline[msg.sender] = block.timestamp + UNBONDING_PERIOD;
        
        emit UnbondingStarted(msg.sender, amount, unbondingDeadline[msg.sender]);
    }
    
    function withdrawUnbondedStake() external nonReentrant {
        require(unbondingAmount[msg.sender] > 0, "No unbonding stake");
        require(block.timestamp >= unbondingDeadline[msg.sender], "Still unbonding");
        
        uint256 amount = unbondingAmount[msg.sender];
        unbondingAmount[msg.sender] = 0;
        unbondingDeadline[msg.sender] = 0;
        
        pasToken.safeTransfer(msg.sender, amount);
    }
    
    function submitRiskScore(address farmer, uint256 score) external {
        require(validators[msg.sender].isActive, "Not active validator");
        require(score <= 100, "Invalid score");
        require(riskScores[farmer][msg.sender] == 0, "Already submitted");
        
        riskScores[farmer][msg.sender] = score;
        submissions[farmer].push(msg.sender);
        
        emit RiskScoreSubmitted(msg.sender, farmer, score);
        
        if (submissions[farmer].length >= CONSENSUS_THRESHOLD) {
            finalizeConsensus(farmer);
        }
    }
    
    function finalizeConsensus(address farmer) public {
        require(submissions[farmer].length >= CONSENSUS_THRESHOLD, "Insufficient submissions");
        
        address[] memory subs = submissions[farmer];
        uint256[] memory scores = new uint256[](subs.length);
        
        for (uint256 i = 0; i < subs.length; i++) {
            scores[i] = riskScores[farmer][subs[i]];
        }
        
        uint256 median = _calculateMedian(scores);
        finalizedScores[farmer] = median;
        
        _distributeRewards(subs, scores, median);
        _detectOutliers(subs, scores, median);
        
        emit RiskScoreFinalized(farmer, median, subs);
    }
    
    function _distributeRewards(address[] memory subs, uint256[] memory scores, uint256 median) internal {
        uint256 totalReward = 1 ether; // 1 DOT per consensus
        uint256 rewardPerValidator = totalReward / subs.length;
        
        for (uint256 i = 0; i < subs.length; i++) {
            validators[subs[i]].rewards += rewardPerValidator;
        }
        
        emit RewardsDistributed(subs, totalReward);
    }
    
    function _detectOutliers(address[] memory subs, uint256[] memory scores, uint256 median) internal {
        for (uint256 i = 0; i < subs.length; i++) {
            if (_abs(scores[i], median) > 20) { // 20 point deviation
                validators[subs[i]].outlierCount++;
                
                if (validators[subs[i]].outlierCount >= 3) {
                    _slashValidator(subs[i]);
                }
            }
        }
    }
    
    function _slashValidator(address validator) internal {
        uint256 slashAmount = (validators[validator].stake * SLASH_PERCENTAGE) / 100;
        validators[validator].stake -= slashAmount;
        
        emit ValidatorSlashed(validator, slashAmount);
    }
    
    function claimRewards() external nonReentrant {
        uint256 rewards = validators[msg.sender].rewards;
        require(rewards > 0, "No rewards");
        
        validators[msg.sender].rewards = 0;
        pasToken.safeTransfer(msg.sender, rewards);
    }
    
    function _calculateMedian(uint256[] memory scores) internal pure returns (uint256) {
        for (uint256 i = 0; i < scores.length - 1; i++) {
            for (uint256 j = 0; j < scores.length - i - 1; j++) {
                if (scores[j] > scores[j + 1]) {
                    uint256 temp = scores[j];
                    scores[j] = scores[j + 1];
                    scores[j + 1] = temp;
                }
            }
        }
        
        uint256 middle = scores.length / 2;
        return scores.length % 2 == 0 
            ? (scores[middle - 1] + scores[middle]) / 2 
            : scores[middle];
    }
    
    function _abs(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a - b : b - a;
    }
    
    function getRiskScore(address farmer) external view returns (uint256) {
        return finalizedScores[farmer];
    }
}
