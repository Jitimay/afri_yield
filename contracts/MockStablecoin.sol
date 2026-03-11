// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockStablecoin
 * @dev Mock ERC20 stablecoin for testnet operations (AUSD)
 * Includes a public mint function for faucet functionality
 */
contract MockStablecoin is ERC20 {
    /**
     * @dev Constructor that mints initial supply to deployer
     * Initial supply: 1,000,000 AUSD
     */
    constructor() ERC20("AfriYield USD", "AUSD") {
        _mint(msg.sender, 1000000 * 10**decimals());
    }

    /**
     * @dev Public mint function for faucet functionality
     * Allows anyone to mint tokens for testing purposes
     * @param to Address to receive minted tokens
     * @param amount Amount of tokens to mint (in wei)
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
