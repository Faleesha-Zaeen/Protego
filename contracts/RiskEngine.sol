// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RiskEngine {
    function assessRisk(bytes calldata txCalldata)
        external
        pure
        returns (uint8)
    {
        if (txCalldata.length < 4) return 20;

        bytes4 selector = bytes4(txCalldata[0]) |
            (bytes4(txCalldata[1]) >> 8) |
            (bytes4(txCalldata[2]) >> 16) |
            (bytes4(txCalldata[3]) >> 24);

        bytes4 APPROVE = 0x095ea7b3;
        bytes4 TRANSFER = 0xa9059cbb;

        uint32 score = 0;

        if (selector == APPROVE) {
            if (txCalldata.length >= 68) {
                bool isMax = true;
                for (uint i = 36; i < 68; i++) {
                    if (txCalldata[i] != 0xFF) {
                        isMax = false;
                        break;
                    }
                }
                if (isMax) score += 40;
            }
        } else if (selector == TRANSFER) {
            if (txCalldata.length >= 68) {
                uint256 amount = 0;
                for (uint i = 36; i < 68; i++) {
                    amount = amount * 256 + uint8(txCalldata[i]);
                }
                if (amount > 1_000_000) score += 30;
            }
        } else {
            score += 20;
        }

        if (score > 100) score = 100;
        return uint8(score);
    }
}
