// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title GuardianVault
/// @notice Secure storage vault that holds user assets when a security threat is detected.
contract GuardianVault is Ownable, ReentrancyGuard {
    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event SecureTransfer(address indexed user, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /// @notice Deposit native tokens into the vault and credit the sender's balance.
    function deposit() external payable nonReentrant {
        require(msg.value > 0, "No value sent");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /// @notice Withdraw a specific amount of previously deposited funds.
    /// @param amount The amount to withdraw.
    function withdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");
        emit Withdraw(msg.sender, amount);
    }

    /// @notice Move funds into the vault for a given user during defense events.
    /// @dev Restricted to the contract owner (e.g., a defense executor).
    /// @param user The address of the user being protected.
    /// @param amount The amount to assign to the user's vault balance.
    function secureTransfer(address user, uint256 amount) external onlyOwner nonReentrant {
        require(address(this).balance >= amount, "Vault balance too low");
        balances[user] += amount;
        emit SecureTransfer(user, amount);
    }
}
