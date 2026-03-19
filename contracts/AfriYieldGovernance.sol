// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ILendingPool {
    function setAPY(uint256 newAPY) external;
    function setRiskThreshold(uint256 newThreshold) external;
    function setInsuranceRate(uint256 newRate) external;
}

contract AfriYieldGovernance is Ownable, ReentrancyGuard {
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 newValue;
        string parameter;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 creationTime;
        uint256 votingDeadline;
        uint256 executionDeadline;
        bool executed;
        bool approved;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => uint256) public stakedDOT;
    mapping(address => uint256) public votingPower;
    mapping(address => uint256) public unbondingDOT;
    mapping(address => uint256) public unbondingDeadline;
    
    uint256 public proposalCount;
    ILendingPool public lendingPool;
    
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant TIMELOCK_PERIOD = 2 days;
    uint256 public constant UNBONDING_PERIOD = 14 days;
    
    event ProposalCreated(uint256 id, string parameter, uint256 newValue, address proposer);
    event Voted(uint256 proposalId, address voter, bool support, uint256 power);
    event ProposalApproved(uint256 proposalId);
    event ProposalExecuted(uint256 proposalId, string parameter, uint256 newValue);
    event StakeUpdated(address user, uint256 amount);
    event UnbondingStarted(address user, uint256 amount, uint256 deadline);
    
    constructor(address _lendingPool) Ownable(msg.sender) {
        lendingPool = ILendingPool(_lendingPool);
    }
    
    function stakeDOT() external payable {
        require(msg.value > 0, "Must stake DOT");
        
        stakedDOT[msg.sender] += msg.value;
        votingPower[msg.sender] = stakedDOT[msg.sender]; // 1:1 ratio
        
        emit StakeUpdated(msg.sender, stakedDOT[msg.sender]);
    }
    
    function unstakeDOT(uint256 amount) external {
        require(stakedDOT[msg.sender] >= amount, "Insufficient staked DOT");
        
        stakedDOT[msg.sender] -= amount;
        votingPower[msg.sender] = stakedDOT[msg.sender];
        
        unbondingDOT[msg.sender] += amount;
        unbondingDeadline[msg.sender] = block.timestamp + UNBONDING_PERIOD;
        
        emit UnbondingStarted(msg.sender, amount, unbondingDeadline[msg.sender]);
    }
    
    function withdrawUnbondedDOT() external nonReentrant {
        require(unbondingDOT[msg.sender] > 0, "No unbonding DOT");
        require(block.timestamp >= unbondingDeadline[msg.sender], "Still unbonding");
        
        uint256 amount = unbondingDOT[msg.sender];
        unbondingDOT[msg.sender] = 0;
        unbondingDeadline[msg.sender] = 0;
        
        payable(msg.sender).transfer(amount);
    }
    
    function createProposal(
        string memory parameter,
        uint256 newValue,
        string memory description
    ) external {
        require(votingPower[msg.sender] > 0, "No voting power");
        
        proposalCount++;
        uint256 deadline = block.timestamp + VOTING_PERIOD;
        
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            proposer: msg.sender,
            description: description,
            newValue: newValue,
            parameter: parameter,
            votesFor: 0,
            votesAgainst: 0,
            creationTime: block.timestamp,
            votingDeadline: deadline,
            executionDeadline: deadline + TIMELOCK_PERIOD,
            executed: false,
            approved: false
        });
        
        emit ProposalCreated(proposalCount, parameter, newValue, msg.sender);
    }
    
    function vote(uint256 proposalId, bool support) external {
        require(votingPower[msg.sender] > 0, "No voting power");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        require(block.timestamp < proposals[proposalId].votingDeadline, "Voting ended");
        require(unbondingDOT[msg.sender] == 0, "Cannot vote while unbonding");
        
        hasVoted[proposalId][msg.sender] = true;
        uint256 power = votingPower[msg.sender];
        
        if (support) {
            proposals[proposalId].votesFor += power;
        } else {
            proposals[proposalId].votesAgainst += power;
        }
        
        // Check if proposal is approved
        if (proposals[proposalId].votesFor > proposals[proposalId].votesAgainst) {
            proposals[proposalId].approved = true;
            emit ProposalApproved(proposalId);
        }
        
        emit Voted(proposalId, msg.sender, support, power);
    }
    
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        
        require(proposal.approved, "Proposal not approved");
        require(!proposal.executed, "Already executed");
        require(block.timestamp >= proposal.executionDeadline, "Timelock not expired");
        require(block.timestamp < proposal.votingDeadline, "Voting period ended");
        
        proposal.executed = true;
        
        // Execute the proposal based on parameter
        if (keccak256(bytes(proposal.parameter)) == keccak256(bytes("APY"))) {
            lendingPool.setAPY(proposal.newValue);
        } else if (keccak256(bytes(proposal.parameter)) == keccak256(bytes("RISK_THRESHOLD"))) {
            lendingPool.setRiskThreshold(proposal.newValue);
        } else if (keccak256(bytes(proposal.parameter)) == keccak256(bytes("INSURANCE_RATE"))) {
            lendingPool.setInsuranceRate(proposal.newValue);
        }
        
        emit ProposalExecuted(proposalId, proposal.parameter, proposal.newValue);
    }
    
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }
    
    function getActiveProposals() external view returns (Proposal[] memory) {
        uint256 activeCount = 0;
        
        // Count active proposals
        for (uint256 i = 1; i <= proposalCount; i++) {
            if (block.timestamp < proposals[i].votingDeadline && !proposals[i].executed) {
                activeCount++;
            }
        }
        
        // Create array of active proposals
        Proposal[] memory activeProposals = new Proposal[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= proposalCount; i++) {
            if (block.timestamp < proposals[i].votingDeadline && !proposals[i].executed) {
                activeProposals[index] = proposals[i];
                index++;
            }
        }
        
        return activeProposals;
    }
}
