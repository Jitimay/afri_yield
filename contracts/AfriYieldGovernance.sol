// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AfriYieldGovernance is Ownable {
    struct Proposal {
        uint256 id;
        string description;
        uint256 newValue;
        string parameter;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => uint256) public votingPower;
    
    uint256 public proposalCount;
    address public lendingPool;
    
    event ProposalCreated(uint256 id, string parameter, uint256 newValue);
    event Voted(uint256 proposalId, address voter, bool support);
    
    constructor(address _lendingPool) Ownable(msg.sender) {
        lendingPool = _lendingPool;
    }
    
    function createProposal(string memory parameter, uint256 newValue, string memory description) external {
        require(votingPower[msg.sender] > 0, "No voting power");
        
        proposalCount++;
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            description: description,
            newValue: newValue,
            parameter: parameter,
            votesFor: 0,
            votesAgainst: 0,
            deadline: block.timestamp + 7 days,
            executed: false
        });
        
        emit ProposalCreated(proposalCount, parameter, newValue);
    }
    
    function vote(uint256 proposalId, bool support) external {
        require(votingPower[msg.sender] > 0, "No voting power");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        require(block.timestamp < proposals[proposalId].deadline, "Voting ended");
        
        hasVoted[proposalId][msg.sender] = true;
        
        if (support) {
            proposals[proposalId].votesFor += votingPower[msg.sender];
        } else {
            proposals[proposalId].votesAgainst += votingPower[msg.sender];
        }
        
        emit Voted(proposalId, msg.sender, support);
    }
    
    function setVotingPower(address user, uint256 power) external onlyOwner {
        votingPower[user] = power;
    }
}
