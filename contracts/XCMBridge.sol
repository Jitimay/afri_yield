// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ILendingPool {
    function creditCrossChainDeposit(address lender, uint256 amount) external;
}

contract XCMBridge is Ownable, ReentrancyGuard {
    address public constant XCM_PRECOMPILE = 0x0000000000000000000000000000000000000804;
    
    ILendingPool public lendingPool;
    mapping(uint32 => bool) public supportedParachains;
    mapping(bytes32 => bool) public processedMessages;
    
    struct XCMMessage {
        uint8 version;
        uint32 parachainId;
        address sender;
        address recipient;
        uint256 amount;
        uint32 assetId;
        bytes instructions;
    }
    
    event CrossChainDeposit(address indexed lender, uint256 amount, uint32 parachainId);
    event CrossChainTransfer(address indexed recipient, uint256 amount, uint32 parachainId);
    event ParachainAdded(uint32 parachainId);
    
    constructor(address _lendingPool) Ownable(msg.sender) {
        lendingPool = ILendingPool(_lendingPool);
        
        // Add default supported parachains
        supportedParachains[1000] = true; // Asset Hub
        supportedParachains[2000] = true; // Acala
    }
    
    function receiveXCMDeposit(XCMMessage memory message) external nonReentrant {
        require(message.version == 3, "Unsupported XCM version");
        require(supportedParachains[message.parachainId], "Unsupported parachain");
        
        bytes32 messageHash = keccak256(abi.encode(message));
        require(!processedMessages[messageHash], "Message already processed");
        
        processedMessages[messageHash] = true;
        
        lendingPool.creditCrossChainDeposit(message.recipient, message.amount);
        
        emit CrossChainDeposit(message.recipient, message.amount, message.parachainId);
    }
    
    function sendXCMTransfer(
        address recipient,
        uint256 amount,
        uint32 parachainId
    ) external nonReentrant {
        require(supportedParachains[parachainId], "Unsupported parachain");
        require(amount > 0, "Invalid amount");
        
        // Construct XCM message with WithdrawAsset and DepositAsset instructions
        bytes memory xcmMessage = abi.encodePacked(
            uint8(3), // XCM version
            parachainId,
            recipient,
            amount
        );
        
        // Call XCM precompile (simplified for demo)
        (bool success,) = XCM_PRECOMPILE.call(xcmMessage);
        require(success, "XCM execution failed");
        
        emit CrossChainTransfer(recipient, amount, parachainId);
    }
    
    function addSupportedParachain(uint32 parachainId) external onlyOwner {
        supportedParachains[parachainId] = true;
        emit ParachainAdded(parachainId);
    }
    
    function setLendingPool(address _lendingPool) external onlyOwner {
        lendingPool = ILendingPool(_lendingPool);
    }
}
