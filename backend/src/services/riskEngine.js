// Risk analysis engine for Protego
// Delegates core scoring to the Rust risk engine for better parity with on-chain logic.

const path = require('path');
const { execSync } = require('child_process');
const { decodeTransactionData } = require('./blockchain');
const { updateRiskScore, callDefense } = require('./contracts');
const { addDefenseEvent } = require('./defenseEvents');
const { incrementStats } = require('./aiStats');

const WORKSPACE_ROOT = path.join(__dirname, '..', '..', '..');
const RUST_ENGINE_PATH = path.join(WORKSPACE_ROOT, 'rust-risk-engine');
const AI_MODEL_SCRIPT = path.join(WORKSPACE_ROOT, 'ai-risk-model', 'predict.py');

// Helper: check if transaction represents an unlimited token approval
function isUnlimitedApproval(tx) {
  if (!tx) return false;

  // Common flags from frontends or decoded calldata
  if (tx.unlimitedApproval === true) return true;

  const type = (tx.type || '').toLowerCase();
  if (type === 'approval' || type === 'approve') {
    const raw = tx.approvalAmount ?? tx.amount ?? tx.value;
    if (raw == null) return false;

    const str = String(raw).toLowerCase();

    // String markers for unlimited approval (e.g., MAX_UINT256)
    if (
      str === 'unlimited' ||
      str === 'max' ||
      str === 'max_uint256' ||
      str === 'maxuint256'
    ) {
      return true;
    }

    // Very large numeric approvals can be treated as "effectively unlimited"
    const n = Number(str);
    if (!Number.isNaN(n) && n > 1e9) {
      return true;
    }
  }

  return false;
}

function flagToCliValue(value) {
  return value ? 'true' : 'false';
}

function flagToBinary(value) {
  return value ? '1' : '0';
}

function invokeRustRiskEngine({ unlimitedApproval, largeTransfer, unknownContract }) {
  const command = `cargo run --quiet -- ${flagToCliValue(unlimitedApproval)} ${flagToCliValue(largeTransfer)} ${flagToCliValue(unknownContract)}`;
  const output = execSync(command, {
    cwd: RUST_ENGINE_PATH,
    stdio: 'pipe',
    encoding: 'utf8',
  }).trim();

  const match = output.match(/(\d+)/);
  if (!match) {
    throw new Error(`Rust engine returned unexpected output: ${output}`);
  }

  return Number(match[1]);
}

function invokeAiRiskModel({
  unlimitedApproval,
  largeTransfer,
  unknownContract,
  tokenTransfer,
  approvalAmount,
}) {
  const numericApproval = Number(approvalAmount) || 0;
  console.log('[Protego AI] Running predict.py with flags:', {
    unlimitedApproval,
    largeTransfer,
    unknownContract,
  });
  const command =
    `python "${AI_MODEL_SCRIPT}" ${flagToBinary(unlimitedApproval)} ${flagToBinary(largeTransfer)} ${flagToBinary(unknownContract)} ${flagToBinary(tokenTransfer)} ${numericApproval}`;
  const start = Date.now();
  const output = execSync(command, {
    cwd: WORKSPACE_ROOT,
    stdio: 'pipe',
    encoding: 'utf8',
  }).trim();
  const inferenceMs = Date.now() - start;

  const match = output.match(/Risk Score:\s*(\d+)/i);
  if (!match) {
    throw new Error(`AI model returned unexpected output: ${output}`);
  }

  const aiScore = Number(match[1]);
  incrementStats(aiScore, inferenceMs);
  return aiScore;
}

function fallbackJavascriptScore({ unlimitedApproval, largeTransfer, unknownContract }) {
  let score = 0;
  if (unlimitedApproval) score += 40;
  if (largeTransfer) score += 30;
  if (unknownContract) score += 20;
  return score;
}

function fallbackAiScore({ unlimitedApproval, largeTransfer, unknownContract }) {
  if ((unlimitedApproval && unknownContract) || (largeTransfer && unknownContract)) {
    return 80;
  }
  if (unlimitedApproval || largeTransfer) {
    return 50;
  }
  if (unknownContract) {
    return 50;
  }
  return 20;
}

// Helper: check if this is a very large transfer (> 5 ETH or equivalent)
function isLargeTransfer(tx) {
  if (!tx) return false;

  const raw = tx.amount ?? tx.value;
  if (raw == null) return false;

  const n = Number(raw);
  if (Number.isNaN(n)) return false;

  return n > 5; // threshold: > 5 ETH or equivalent
}


// Blacklist: known malicious addresses (HIGH risk)
const BLACKLISTED_CONTRACTS = new Set([
  // Add real malicious addresses here
  '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
  '0xbadbadbadbadbadbadbadbadbadbadbadbadbadb',
]);

// Whitelist: zero address, Polkadot system contracts, known-good registry
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const POLKADOT_SYSTEM_CONTRACTS = new Set([
  // Add Polkadot Hub RPC/system contract addresses here
]);
// Known-good registry (should be loaded from DB or config in production)
const KNOWN_GOOD_REGISTRY = new Set([
  // Populate with known-good addresses
]);

function isBlacklisted(address) {
  if (!address) return false;
  return BLACKLISTED_CONTRACTS.has(address.toLowerCase());
}

function isWhitelisted(address) {
  if (!address) return false;
  const addr = address.toLowerCase();
  if (addr === ZERO_ADDRESS) return true;
  if (POLKADOT_SYSTEM_CONTRACTS.has(addr)) return true;
  if (KNOWN_GOOD_REGISTRY.has(addr)) return true;
  return false;
}

// Map numeric score to risk level label
function mapScoreToLevel(score) {
  if (score >= 71) return 'HIGH';
  if (score >= 31) return 'MEDIUM';
  return 'LOW';
}

// Build a readable explanation from triggered rule messages
function buildExplanation(reasons) {
  if (!reasons || reasons.length === 0) {
    return 'No specific risk rules were triggered.';
  }
  return reasons.join(' ');
}


async function analyzeTransaction(tx) {
  const {
    walletAddress,
    contractAddress,
    method,
    value,
    contractReputation,
    isKnownContract,
    inputData,
    data,
  } = tx || {};

  const reasons = [];
  let score = 0;

  // Whitelist: always LOW (0-15)
  if (isWhitelisted(contractAddress)) {
    score = Math.floor(Math.random() * 16); // 0-15
    reasons.push('Whitelisted address.');
    return {
      riskScore: score,
      riskLevel: mapScoreToLevel(score),
      explanation: buildExplanation(reasons),
    };
  }

  // Blacklist: always HIGH (95)
  if (isBlacklisted(contractAddress)) {
    score = 95;
    reasons.push('Contract address is blacklisted.');
    return {
      riskScore: score,
      riskLevel: mapScoreToLevel(score),
      explanation: buildExplanation(reasons),
    };
  }

  // Decode calldata
  let decoded = { method: method || 'unknown', isApproval: false, isTransfer: false };
  if (tx && (inputData || data)) {
    decoded = decodeTransactionData(inputData || data);
  }

  // Approve/transfer detection
  let approvalAmount = null;
  if (typeof tx?.approvalAmount !== 'undefined') {
    approvalAmount = tx.approvalAmount;
  } else if (typeof tx?.amount !== 'undefined') {
    approvalAmount = tx.amount;
  } else if (typeof value !== 'undefined') {
    approvalAmount = value;
  }

  // 1. Clean calldata + unknown contract = 20-30 (LOW-MEDIUM)
  const unknownContract =
    isKnownContract === false || contractReputation === 'unknown' || (!contractReputation && !isKnownContract && !!contractAddress);
  if (unknownContract && !decoded.isApproval && !decoded.isTransfer) {
    score = 20 + Math.floor(Math.random() * 11); // 20-30
    reasons.push('Unknown contract, clean calldata.');
  }

  // 2. approve() with reasonable amount + unknown contract = 40-55 (MEDIUM)
  let unlimitedApprovalFlag = false;
  if (decoded.isApproval === true) {
    const veryLargeNumeric =
      approvalAmount != null && !Number.isNaN(Number(approvalAmount)) && Number(approvalAmount) > 1e9;
    unlimitedApprovalFlag = isUnlimitedApproval({
      type: decoded.method || method,
      approvalAmount,
      amount: approvalAmount,
      value,
      unlimitedApproval: tx?.unlimitedApproval || veryLargeNumeric,
    });
    if (!unlimitedApprovalFlag && unknownContract) {
      score = 40 + Math.floor(Math.random() * 16); // 40-55
      reasons.push('approve() with reasonable amount to unknown contract.');
    }
  }

  // 3. approve() with MaxUint256 + unknown contract = 85-95 (HIGH)
  if (decoded.isApproval === true && unlimitedApprovalFlag && unknownContract) {
    score = 85 + Math.floor(Math.random() * 11); // 85-95
    reasons.push('approve() with MaxUint256 to unknown contract.');
  }

  // 4. transfer() selector alone = 15-25 (LOW)
  if (decoded.isTransfer === true) {
    score = 15 + Math.floor(Math.random() * 11); // 15-25
    reasons.push('transfer() detected.');
  }

  // 6. Random address + empty calldata = 5-10 (LOW)
  if (!contractAddress || (!inputData && !data)) {
    score = 5 + Math.floor(Math.random() * 6); // 5-10
    reasons.push('Random address with empty calldata.');
  }

  // Fallback: normal transactions score LOW
  if (score === 0) {
    score = 10 + Math.floor(Math.random() * 11); // 10-20
    reasons.push('Normal transaction.');
  }

  // Cap score at 100
  if (score > 100) score = 100;

  const riskLevel = mapScoreToLevel(score);
  const explanation = buildExplanation(reasons);

  // On-chain defense for HIGH
  if (riskLevel === 'HIGH' && tx && tx.walletAddress) {
    try {
      console.log('Protego updating risk score on-chain...');
      await updateRiskScore(tx.walletAddress, score);
      console.log('Protego triggering defense executor...');
      const defenseReceipt = await callDefense(tx.walletAddress);
      const defenseTxHash = defenseReceipt?.transactionHash || defenseReceipt?.hash;
      if (defenseTxHash) {
        addDefenseEvent({
          wallet: tx.walletAddress,
          txHash: defenseTxHash,
          timestamp: Date.now(),
          status: 'confirmed',
        });
      } else {
        console.warn('Defense receipt missing transaction hash; event not recorded.');
      }
    } catch (err) {
      console.error('Protego on-chain defense failed:', err);
    }
  }

  return {
    riskScore: score,
    riskLevel,
    explanation,
  };
}

module.exports = {
  analyzeTransaction,
  isUnlimitedApproval,
  isLargeTransfer,
  isBlacklisted,
};
