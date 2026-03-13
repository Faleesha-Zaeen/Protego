import "@openzeppelin/contracts/utils/Pausable.sol";
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
contract DefenseExecutor is Pausable {
    IGuardianVault public guardianVault;
    IRiskRegistry public riskRegistry;
    address public pvmRiskEngine;

    // Fixed demo amount that will be moved into the vault when defense triggers.
    uint256 public constant DEFENSE_AMOUNT = 1 ether;

    event RiskScoreReceived(address indexed user, uint8 score);
    event DefenseTriggered(address indexed user, uint8 score);

    /// @param _guardianVault Address of the GuardianVault contract.
    /// @param _riskRegistry Address of the RiskRegistry contract.
    constructor(address _guardianVault, address _riskRegistry) {
        require(_guardianVault != address(0), "Invalid vault");
        require(_riskRegistry != address(0), "Invalid registry");
        guardianVault = IGuardianVault(_guardianVault);
        riskRegistry = IRiskRegistry(_riskRegistry);
        pvmRiskEngine = 0x8ac03522a73EF023cF5A9CEC767D7a07736b45d9;
    }

    /// @notice Evaluate a user's risk score and, if high, trigger a defense action.
    /// @dev If risk score > 70, calls GuardianVault.secureTransfer(user, DEFENSE_AMOUNT).
    /// @param user The address of the user to evaluate.
    /// @param txCalldata The calldata to score via the PVM RiskEngine.
    function evaluateAndDefend(address user, bytes calldata txCalldata) external returns (uint8 score) {
        require(!paused(), "DefenseExecutor is paused");
        bytes memory callData = abi.encodeWithSignature("assessRisk(bytes)", txCalldata);
        (bool success, bytes memory result) = pvmRiskEngine.call(callData);
        require(success, "PVM risk engine call failed");

        score = abi.decode(result, (uint8));
        emit RiskScoreReceived(user, score);

        if (score > 70) {
            guardianVault.secureTransfer(user, DEFENSE_AMOUNT);
            emit DefenseTriggered(user, score);
        }

        return score;
    }
}
