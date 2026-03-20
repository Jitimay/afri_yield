// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IDecentralizedOracle {
    function getRiskScore(address farmer) external view returns (uint256);
}

interface IRiskCalculator {
    struct FarmData {
        uint8 cropType;
        uint256 estimatedYield;
        uint8 soilQuality;
        uint256 rainfall;
        uint8 marketVolatility;
        uint256 farmSize;
        uint8 yearsExperience;
        uint8 previousLoans;
    }
    function calculateRiskScore(FarmData memory data) external returns (uint256);
}

contract AfriYieldLendingPool is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public stablecoin;
    IERC20 public pasToken;
    IDecentralizedOracle public oracle;
    IRiskCalculator public riskCalculator;
    address public xcmBridge;
    
    uint256 public totalDeposits;
    uint256 public totalLoans;
    uint256 public constant APY = 8;
    uint256 public constant RISK_THRESHOLD = 70;
    uint256 public loanCounter;
    uint256 public insurancePool;
    uint256 public constant INSURANCE_RATE = 5;
    uint256 public pasRewardsPool;

    // PAS collateral
    mapping(address => uint256) public pasCollateral;
    mapping(address => uint256) public pasRewards;

    struct Loan {
        address borrower;
        uint256 amount;
        uint256 riskScore;
        uint256 timestamp;
        uint256 dueDate;
        bool isActive;
        bool isRepaid;
        uint256 collateralAmount;
    }

    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public borrowerLoans;
    mapping(address => uint256) public lenderDeposits;
    mapping(address => uint256) public lenderYields;
    mapping(address => uint256) public depositTimestamp;

    event LenderDeposit(address indexed lender, uint256 amount);
    event CrossChainDepositCredited(address indexed lender, uint256 amount);
    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 riskScore);
    event LoanApproved(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event PASCollateralDeposited(address indexed borrower, uint256 amount);
    event CollateralLiquidated(address indexed borrower, uint256 loanId, uint256 amount);
    event PASRewardsDistributed(address indexed lender, uint256 amount);
    event YieldAccrued(address indexed lender, uint256 amount);
    event FundsWithdrawn(address indexed lender, uint256 amount);

    constructor(address _stablecoin, address _pasToken, address _oracle, address _riskCalculator) Ownable(msg.sender) {
        stablecoin = IERC20(_stablecoin);
        pasToken = IERC20(_pasToken);
        oracle = IDecentralizedOracle(_oracle);
        riskCalculator = IRiskCalculator(_riskCalculator);
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

    function creditCrossChainDeposit(address lender, uint256 amount) external {
        require(msg.sender == xcmBridge, "Only XCM bridge");
        
        uint256 insuranceFee = (amount * INSURANCE_RATE) / 100;
        insurancePool += insuranceFee;
        uint256 netDeposit = amount - insuranceFee;
        
        lenderDeposits[lender] += netDeposit;
        totalDeposits += netDeposit;
        depositTimestamp[lender] = block.timestamp;
        
        emit CrossChainDepositCredited(lender, netDeposit);
    }

    function depositPASCollateral(uint256 amount) external nonReentrant {
        require(amount > 0, "Must deposit PAS");
        
        pasToken.safeTransferFrom(msg.sender, address(this), amount);
        pasCollateral[msg.sender] += amount;
        
        emit PASCollateralDeposited(msg.sender, amount);
    }

    function requestLoan(uint256 amount, uint256 riskScore) external nonReentrant {
        require(riskScore >= RISK_THRESHOLD, "Risk score below threshold");
        require(amount >= 50 * 10**18 && amount <= 500 * 10**18, "Invalid loan amount");
        require(stablecoin.balanceOf(address(this)) >= amount, "Insufficient pool balance");
        
        // Check oracle score first, fallback to provided score
        uint256 oracleScore = oracle.getRiskScore(msg.sender);
        uint256 finalScore = oracleScore > 0 ? oracleScore : riskScore;
        
        // Check PAS collateral if provided
        uint256 collateralValue = pasCollateral[msg.sender] * getPASPrice() / 1e18;
        uint256 maxLoanWithCollateral = (collateralValue * 70) / 100; // 70% LTV
        
        if (pasCollateral[msg.sender] > 0) {
            require(amount <= maxLoanWithCollateral, "Insufficient collateral");
        }
        
        loanCounter++;
        uint256 loanId = loanCounter;
        
        loans[loanId] = Loan({
            borrower: msg.sender,
            amount: amount,
            riskScore: finalScore,
            timestamp: block.timestamp,
            dueDate: block.timestamp + 90 days,
            isActive: true,
            isRepaid: false,
            collateralAmount: pasCollateral[msg.sender]
        });
        
        borrowerLoans[msg.sender].push(loanId);
        totalLoans += amount;
        
        emit LoanRequested(loanId, msg.sender, amount, finalScore);
        
        stablecoin.safeTransfer(msg.sender, amount);
        
        emit LoanApproved(loanId, msg.sender, amount);
    }

    function requestLoanWithFarmData(
        uint256 amount,
        IRiskCalculator.FarmData memory farmData
    ) external nonReentrant {
        require(amount >= 50 * 10**18 && amount <= 500 * 10**18, "Invalid loan amount");
        require(stablecoin.balanceOf(address(this)) >= amount, "Insufficient pool balance");
        
        uint256 calculatedScore = riskCalculator.calculateRiskScore(farmData);
        require(calculatedScore >= RISK_THRESHOLD, "Risk score below threshold");
        
        // Check oracle score first
        uint256 oracleScore = oracle.getRiskScore(msg.sender);
        uint256 finalScore = oracleScore > 0 ? oracleScore : calculatedScore;
        
        loanCounter++;
        uint256 loanId = loanCounter;
        
        loans[loanId] = Loan({
            borrower: msg.sender,
            amount: amount,
            riskScore: finalScore,
            timestamp: block.timestamp,
            dueDate: block.timestamp + 90 days,
            isActive: true,
            isRepaid: false,
            collateralAmount: pasCollateral[msg.sender]
        });
        
        borrowerLoans[msg.sender].push(loanId);
        totalLoans += amount;
        
        emit LoanRequested(loanId, msg.sender, amount, finalScore);
        
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
        
        // Return PAS collateral if any
        if (loan.collateralAmount > 0) {
            uint256 collateralToReturn = pasCollateral[msg.sender];
            pasCollateral[msg.sender] = 0;
            pasToken.safeTransfer(msg.sender, collateralToReturn);
        }
        
        emit LoanRepaid(loanId, msg.sender, loan.amount);
    }

    function liquidateCollateral(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.isActive, "Loan not active");
        require(block.timestamp > loan.dueDate, "Loan not overdue");
        
        uint256 collateralValue = loan.collateralAmount * getPASPrice() / 1e18;
        uint256 requiredValue = (loan.amount * 70) / 100;
        
        require(collateralValue < requiredValue, "Collateral sufficient");
        
        // Transfer PAS to pool
        pasRewardsPool += loan.collateralAmount;
        pasCollateral[loan.borrower] = 0;
        
        loan.isActive = false;
        totalLoans -= loan.amount;
        
        emit CollateralLiquidated(loan.borrower, loanId, loan.collateralAmount);
    }

    function calculateYield(address lender) public view returns (uint256) {
        uint256 deposit = lenderDeposits[lender];
        if (deposit == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - depositTimestamp[lender];
        uint256 yield = (deposit * APY * timeElapsed) / (365 days * 100);
        
        return yield;
    }

    function calculatePASRewards(address lender) public view returns (uint256) {
        uint256 deposit = lenderDeposits[lender];
        if (deposit == 0 || pasRewardsPool == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - depositTimestamp[lender];
        uint256 rewards = (deposit * pasRewardsPool * timeElapsed) / (totalDeposits * 30 days);
        
        return rewards;
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
        
        // Calculate and distribute PAS rewards
        uint256 pasReward = calculatePASRewards(msg.sender);
        if (pasReward > 0 && pasRewardsPool >= pasReward) {
            pasRewards[msg.sender] += pasReward;
            pasRewardsPool -= pasReward;
            pasToken.safeTransfer(msg.sender, pasReward);
            emit PASRewardsDistributed(msg.sender, pasReward);
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

    function claimPASRewards() external nonReentrant {
        uint256 rewards = pasRewards[msg.sender];
        require(rewards > 0, "No rewards to claim");
        
        pasRewards[msg.sender] = 0;
        pasToken.safeTransfer(msg.sender, rewards);
        
        emit PASRewardsDistributed(msg.sender, rewards);
    }

    function fundPASRewardsPool(uint256 amount) external onlyOwner {
        pasToken.safeTransferFrom(msg.sender, address(this), amount);
        pasRewardsPool += amount;
    }

    function getPASPrice() public pure returns (uint256) {
        return 5 * 1e18; // $5 per PAS (simplified)
    }

    function setXCMBridge(address _xcmBridge) external onlyOwner {
        xcmBridge = _xcmBridge;
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

    function getBorrowerLoans(address borrower) external view returns (uint256[] memory) {
        return borrowerLoans[borrower];
    }
}
