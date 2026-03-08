// Blockchain service abstraction for AegisDot
// Adds basic calldata decoding to detect ERC20 approve calls.

const { ethers } = require('ethers');

// Decode raw transaction calldata to detect ERC20 approve calls.
function decodeTransactionData(inputData) {
  // Handle empty or non-string input safely
  if (!inputData || typeof inputData !== 'string') {
    return {
      method: 'unknown',
      isApproval: false,
    };
  }

  const data = inputData.startsWith('0x')
    ? inputData.toLowerCase()
    : `0x${inputData.toLowerCase()}`;

  // ERC20 approve function selector
  const APPROVE_SELECTOR = '0x095ea7b3';

  if (data.startsWith(APPROVE_SELECTOR)) {
    return {
      method: 'approve',
      isApproval: true,
    };
  }

  return {
    method: 'unknown',
    isApproval: false,
  };
}

module.exports = {
  decodeTransactionData,
};
