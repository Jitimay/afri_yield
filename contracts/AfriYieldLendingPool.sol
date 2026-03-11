// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AfriYieldLendingPool is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable stablecoin;
    
    struct Loan {
        address borrower;
        uint256 amount;
        uint256 riskScore;
        uint256 timestamp;
        uint256 dueDate;
        bool isActive;
        bool isRepaid;
    }

    mapping(address => uint256) public lenderDeposits;
    mapping(address => uint256) public depositTimestamps;
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public borrowerLoans;
    
    uint256 public nextLoanId = 1;
    uint256 public totalDeposits;
    uint256 public totalLoans;
    uint256 public constant APY = 8; // 8% APY
    uint256 public constant LOAN_DURATION = 90 days;
    uint256 public constant MIN_RISK_SCORE = 70;

    event LenderDeposit(address indexed lender, uint256 amount);
    event LoanApproved(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount);

    constructor(address _stablecoin) Ownable(msg.sender) {
        stablecoin = IERC20(_stablecoin);
    }

    function depositLenderFunds(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        stablecoin.safeTransferFrom(msg.sender, address(this), amount);
        
        lenderDeposits[msg.sender] += amount;
        depositTimestamps[msg.sender] = block.timestamp;
        totalDeposits += amount;
        
        emit LenderDeposit(msg.sender, amount);
    }

    function requestLoan(uint256 amount, uint256 riskScore) external nonReentrant {
        require(amount >= 50e18 && amount <= 500e18, "Loan amount must be 50-500 AUSD");
        require(riskScore >= MIN_RISK_SCORE, "Risk score too low");
        require(stablecoin.balanceOf(address(this)) >= amount, "Insufficient liquidity");
        
        // Check if borrower has active loans
        uint256[] memory borrowerLoanIds = borrowerLoans[msg.sender];
        for (uint256 i = 0; i < borrowerLoanIds.length; i++) {
            require(!loans[borrowerLoanIds[i]].isActive, "Active loan exists");
        }

        uint256 loanId = nextLoanId++;
        loans[loanId] = Loan({
            borrower: msg.sender,
            amount: amount,
            riskScore: riskScore,
            timestamp: block.timestamp,
            dueDate: block.timestamp + LOAN_DURATION,
            isActive: true,
            isRepaid: false
        });

        borrowerLoans[msg.sender].push(loanId);
        totalLoans += amount;

        stablecoin.safeTransfer(msg.sender, amount);
        emit LoanApproved(loanId, msg.sender, amount);
    }

    function repayLoan(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.borrower == msg.sender, "Not loan borrower");
        require(loan.isActive && !loan.isRepaid, "Loan not active");
        require(block.timestamp <= loan.dueDate, "Loan overdue");

        stablecoin.safeTransferFrom(msg.sender, address(this), loan.amount);
        
        loan.isActive = false;
        loan.isRepaid = true;
        totalLoans -= loan.amount;

        emit LoanRepaid(loanId, msg.sender, loan.amount);
    }

    function withdrawFunds(uint256 amount) external nonReentrant {
        require(lenderDeposits[msg.sender] >= amount, "Insufficient deposit");
        
        uint256 yield = calculateYield(msg.sender);
        uint256 totalWithdraw = amount + yield;
        
        require(stablecoin.balanceOf(address(this)) >= totalWithdraw, "Insufficient liquidity");

        lenderDeposits[msg.sender] -= amount;
        totalDeposits -= amount;
        depositTimestamps[msg.sender] = block.timestamp;

        stablecoin.safeTransfer(msg.sender, totalWithdraw);
    }

    function calculateYield(address lender) public view returns (uint256) {
        uint256 deposit = lenderDeposits[lender];
        if (deposit == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - depositTimestamps[lender];
        return (deposit * APY * timeElapsed) / (365 days * 100);
    }

    function getLoanDetails(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }

    function getAllLoans() external view returns (Loan[] memory) {
        Loan[] memory allLoans = new Loan[](nextLoanId - 1);
        for (uint256 i = 1; i < nextLoanId; i++) {
            allLoans[i - 1] = loans[i];
        }
        return allLoans;
    }

    function getPoolStats() external view returns (uint256, uint256, uint256, uint256) {
        uint256 availableLiquidity = stablecoin.balanceOf(address(this));
        uint256 activeLoansCount = 0;
        
        for (uint256 i = 1; i < nextLoanId; i++) {
            if (loans[i].isActive) activeLoansCount++;
        }
        
        return (totalDeposits, totalLoans, availableLiquidity, activeLoansCount);
    }

    function getBorrowerLoans(address borrower) external view returns (uint256[] memory) {
        return borrowerLoans[borrower];
    }
}
