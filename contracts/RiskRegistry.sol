// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title RiskRegistry
/// @notice Stores risk scores for wallets detected by the AegisDot backend.
contract RiskRegistry is Ownable {
    mapping(address => uint256) public riskScores;

    event RiskScoreUpdated(address indexed user, uint256 score);

    constructor() Ownable(msg.sender) {}

    /// @notice Update the risk score for a given user.
    /// @dev Only the owner (e.g., a backend controller) can call this.
    function updateRiskScore(address user, uint256 score) external onlyOwner {
        require(user != address(0), "Invalid user");
        require(score <= 100, "Score too high");
        riskScores[user] = score;
        emit RiskScoreUpdated(user, score);
    }

    /// @notice Read the risk score for a given user.
    function getRiskScore(address user) external view returns (uint256) {
        return riskScores[user];
    }
}
