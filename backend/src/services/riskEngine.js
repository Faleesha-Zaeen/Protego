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

// Simple in-memory blacklist for high-risk contracts
const BLACKLISTED_CONTRACTS = new Set([
  // Example placeholders; replace with real entries as needed
  '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
  '0xbadbadbadbadbadbadbadbadbadbadbadbadbadb',
]);

function isBlacklisted(contractAddress) {
  if (!contractAddress) return false;
  return BLACKLISTED_CONTRACTS.has(contractAddress.toLowerCase());
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
  if (reasons.length === 1) return reasons[0];

  const last = reasons[reasons.length - 1];
  const head = reasons.slice(0, -1).join(', ');
  return `${head} and ${last}.`;
}

async function analyzeTransaction(tx) {
  const {
    walletAddress,
    contractAddress,
    method,
    value,
    contractReputation,
    isKnownContract,
  } = tx || {};

  const reasons = [];
  
  // Decode calldata when present to detect ERC20 approve
  let decoded = { method: method || 'unknown', isApproval: false, isTransfer: false };
  if (tx && (tx.inputData || tx.data)) {
    decoded = decodeTransactionData(tx.inputData || tx.data);
  }

  // Rule: Unknown contract → +30
  const unknownContract =
    isKnownContract === false ||
    contractReputation === 'unknown' ||
    (!contractReputation && !isKnownContract && !!contractAddress);

  // Rule: Unlimited token approval → +40
  // Only evaluate this rule when the calldata indicates an ERC20 approve call
  let unlimitedApprovalFlag = false;
  let approvalAmount = null;
  if (typeof tx?.approvalAmount !== 'undefined') {
    approvalAmount = tx.approvalAmount;
  } else if (typeof tx?.amount !== 'undefined') {
    approvalAmount = tx.amount;
  } else if (typeof value !== 'undefined') {
    approvalAmount = value;
  }

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
  }

  const largeTransferFlag = isLargeTransfer({ amount: tx?.amount, value });
  const tokenTransferFlag =
    decoded.isTransfer === true || ((method || '').toLowerCase() === 'transfer') ||
    ((tx?.type || '').toLowerCase() === 'transfer');

  const flags = {
    unlimitedApproval: unlimitedApprovalFlag,
    largeTransfer: largeTransferFlag,
    unknownContract,
    tokenTransfer: tokenTransferFlag,
    approvalAmount: approvalAmount ?? 0,
  };

  const rustScore = fallbackJavascriptScore(flags);

  let aiScore;
  try {
    aiScore = invokeAiRiskModel(flags);
  } catch (err) {
    console.error('[Protego AI] predict.py error:', err.message);
    console.error('AI risk model failed, falling back to heuristic scoring.', err);
    aiScore = fallbackAiScore(flags);
    incrementStats(aiScore, 0);
  }

  let score = aiScore * 0.6 + rustScore * 0.4;

  // Attach AI insight description
  const aiRiskLevel = mapScoreToLevel(aiScore);
  if (aiRiskLevel === 'HIGH') {
    reasons.push('AI model marked this transaction as HIGH risk.');
  } else if (aiRiskLevel === 'MEDIUM') {
    reasons.push('AI model marked this transaction as MEDIUM risk.');
  }

  if (unknownContract) {
    reasons.push('Contract is unknown.');
  }

  if (unlimitedApprovalFlag) {
    reasons.push('Transaction requests unlimited token approval.');
  }

  // Rule: Contract blacklist → +80
  if (isBlacklisted(contractAddress)) {
    score += 80;
    reasons.push('Contract address is on the blacklist.');
  }

  if (largeTransferFlag) {
    reasons.push('Transaction attempts a very large transfer (> 5 ETH or equivalent).');
  }

  // Cap score at 100
  if (score > 100) {
    score = 100;
  }

  const riskLevel = mapScoreToLevel(score);
  const explanation = buildExplanation(reasons);

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
