// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AfriYieldLendingPool is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public stablecoin;
    uint256 public totalDeposits;
    uint256 public totalLoans;
    uint256 public constant APY = 8;
    uint256 public constant RISK_THRESHOLD = 70;
    uint256 public loanCounter;
    uint256 public insurancePool;
    uint256 public constant INSURANCE_RATE = 5; // 5% of deposits

    struct Loan {
        address borrower;
        uint256 amount;
        uint256 riskScore;
        uint256 timestamp;
        uint256 dueDate;
        bool isActive;
        bool isRepaid;
    }

    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public borrowerLoans;
    mapping(address => uint256) public lenderDeposits;
    mapping(address => uint256) public lenderYields;
    mapping(address => uint256) public depositTimestamp;
    mapping(address => uint256) public votingPower;

    event LenderDeposit(address indexed lender, uint256 amount);
    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 riskScore);
    event LoanApproved(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event YieldAccrued(address indexed lender, uint256 amount);
    event FundsWithdrawn(address indexed lender, uint256 amount);

    constructor(address _stablecoin) Ownable(msg.sender) {
        stablecoin = IERC20(_stablecoin);
    }

    function depositLenderFunds(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        stablecoin.safeTransferFrom(msg.sender, address(this), amount);
        
        uint256 insuranceFee = (amount * INSURANCE_RATE) / 100;
        insurancePool += insuranceFee;
        uint256 netDeposit = amount - insuranceFee;
        
        lenderDeposits[msg.sender] += netDeposit;
        totalDeposits += netDeposit;
        depositTimestamp[msg.sender] = block.timestamp;
        
        emit LenderDeposit(msg.sender, netDeposit);
    }

    function requestLoan(uint256 amount, uint256 riskScore) external nonReentrant {
        require(riskScore >= RISK_THRESHOLD, "Risk score below threshold");
        require(amount >= 50 * 10**18 && amount <= 500 * 10**18, "Invalid loan amount");
        require(stablecoin.balanceOf(address(this)) >= amount, "Insufficient pool balance");
        
        loanCounter++;
        uint256 loanId = loanCounter;
        
        loans[loanId] = Loan({
            borrower: msg.sender,
            amount: amount,
            riskScore: riskScore,
            timestamp: block.timestamp,
            dueDate: block.timestamp + 90 days,
            isActive: true,
            isRepaid: false
        });
        
        borrowerLoans[msg.sender].push(loanId);
        totalLoans += amount;
        
        emit LoanRequested(loanId, msg.sender, amount, riskScore);
        
        stablecoin.safeTransfer(msg.sender, amount);
        
        emit LoanApproved(loanId, msg.sender, amount);
    }

    function repayLoan(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.borrower == msg.sender, "Not loan borrower");
        require(loan.isActive, "Loan not active");
        require(!loan.isRepaid, "Loan already repaid");
        
        stablecoin.safeTransferFrom(msg.sender, address(this), loan.amount);
        
        loan.isActive = false;
        loan.isRepaid = true;
        totalLoans -= loan.amount;
        
        emit LoanRepaid(loanId, msg.sender, loan.amount);
    }

    function calculateYield(address lender) public view returns (uint256) {
        uint256 deposit = lenderDeposits[lender];
        if (deposit == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - depositTimestamp[lender];
        uint256 yield = (deposit * APY * timeElapsed) / (365 days * 100);
        
        return yield;
    }

    function withdrawFunds(uint256 amount) external nonReentrant {
        uint256 availableBalance = lenderDeposits[msg.sender] + calculateYield(msg.sender);
        require(amount <= availableBalance, "Insufficient balance");
        
        uint256 poolBalance = stablecoin.balanceOf(address(this));
        require(poolBalance >= amount, "Insufficient pool liquidity");
        require(poolBalance - amount >= totalLoans, "Would compromise active loans");
        
        uint256 yield = calculateYield(msg.sender);
        if (yield > 0) {
            lenderYields[msg.sender] += yield;
            emit YieldAccrued(msg.sender, yield);
        }
        
        if (amount <= lenderDeposits[msg.sender]) {
            lenderDeposits[msg.sender] -= amount;
        } else {
            uint256 remaining = amount - lenderDeposits[msg.sender];
            lenderDeposits[msg.sender] = 0;
            lenderYields[msg.sender] -= remaining;
        }
        
        totalDeposits -= amount;
        depositTimestamp[msg.sender] = block.timestamp;
        
        stablecoin.safeTransfer(msg.sender, amount);
        
        emit FundsWithdrawn(msg.sender, amount);
    }

    function getLoanDetails(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }

    function getAllLoans() external view returns (Loan[] memory) {
        Loan[] memory allLoans = new Loan[](loanCounter);
        for (uint256 i = 1; i <= loanCounter; i++) {
            allLoans[i - 1] = loans[i];
        }
        return allLoans;
    }

    function getPoolStats() external view returns (
        uint256 _totalDeposits,
        uint256 _totalLoans,
        uint256 _availableLiquidity,
        uint256 _activeLoansCount
    ) {
        _totalDeposits = totalDeposits;
        _totalLoans = totalLoans;
        _availableLiquidity = stablecoin.balanceOf(address(this));
        _activeLoansCount = loanCounter;
    }

    function handleDefault(uint256 loanId) external onlyOwner {
        Loan storage loan = loans[loanId];
        require(loan.isActive && block.timestamp > loan.dueDate, "Loan not defaulted");
        
        if (insurancePool >= loan.amount) {
            insurancePool -= loan.amount;
            loan.isActive = false;
            totalLoans -= loan.amount;
        }
    }

    function setVotingPower(address user, uint256 power) external onlyOwner {
        votingPower[user] = power;
    }

    function getBorrowerLoans(address borrower) external view returns (uint256[] memory) {
        return borrowerLoans[borrower];
    }
}
