// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Interface for GuardianVault used by DefenseExecutor.
interface IGuardianVault {
    function secureTransfer(address user, uint256 amount) external;
}

/// @notice Interface for RiskRegistry used by DefenseExecutor.
interface IRiskRegistry {
    function getRiskScore(address user) external view returns (uint256);
}

/// @title DefenseExecutor
/// @notice Triggers automated defense actions when high-risk transactions are detected.
contract DefenseExecutor {
    IGuardianVault public guardianVault;
    IRiskRegistry public riskRegistry;

    // Fixed demo amount that will be moved into the vault when defense triggers.
    uint256 public constant DEFENSE_AMOUNT = 0.1 ether;

    event DefenseTriggered(address indexed user, uint256 riskScore);

    /// @param _guardianVault Address of the GuardianVault contract.
    /// @param _riskRegistry Address of the RiskRegistry contract.
    constructor(address _guardianVault, address _riskRegistry) {
        require(_guardianVault != address(0), "Invalid vault");
        require(_riskRegistry != address(0), "Invalid registry");
        guardianVault = IGuardianVault(_guardianVault);
        riskRegistry = IRiskRegistry(_riskRegistry);
    }

    /// @notice Evaluate a user's risk score and, if high, trigger a defense action.
    /// @dev If risk score > 70, calls GuardianVault.secureTransfer(user, DEFENSE_AMOUNT).
    /// @param user The address of the user to evaluate.
    function evaluateAndDefend(address user) external {
        uint256 score = riskRegistry.getRiskScore(user);

        if (score > 70) {
            guardianVault.secureTransfer(user, DEFENSE_AMOUNT);
            emit DefenseTriggered(user, score);
        }
    }
}
