// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PASToken is ERC20, Ownable {
    constructor() ERC20("Polkadot Asset Hub Token", "PAS") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**decimals()); // 1M PAS tokens
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
