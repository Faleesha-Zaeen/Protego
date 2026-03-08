// Risk analysis engine for AegisDot
// Refined heuristic-based scoring for prototype phase.

const { decodeTransactionData } = require('./blockchain');
const { updateRiskScore, callDefense } = require('./contracts');

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

  let score = 0;
  const reasons = [];
  
  // Decode calldata when present to detect ERC20 approve
  let decoded = { method: method || 'unknown', isApproval: false };
  if (tx && (tx.inputData || tx.data)) {
    decoded = decodeTransactionData(tx.inputData || tx.data);
  }

  // Rule: Unknown contract → +30
  const unknownContract =
    isKnownContract === false ||
    contractReputation === 'unknown' ||
    (!contractReputation && !isKnownContract && !!contractAddress);
  if (unknownContract) {
    score += 30;
    reasons.push('Contract is unknown.');
  }

  // Rule: Unlimited token approval → +40
  // Only evaluate this rule when the calldata indicates an ERC20 approve call
  if (decoded.isApproval === true) {
    // Derive an "approval amount" from transaction fields
    let approvalAmount;
    if (typeof tx?.approvalAmount !== 'undefined') {
      approvalAmount = tx.approvalAmount;
    } else if (typeof tx?.amount !== 'undefined') {
      approvalAmount = tx.amount;
    } else if (typeof value !== 'undefined') {
      approvalAmount = value;
    }

    const veryLargeNumeric =
      approvalAmount != null && !Number.isNaN(Number(approvalAmount)) && Number(approvalAmount) > 1e9;

    if (
      isUnlimitedApproval({
        type: decoded.method || method,
        approvalAmount,
        amount: approvalAmount,
        value,
        unlimitedApproval: tx?.unlimitedApproval || veryLargeNumeric,
      })
    ) {
      score += 40;
      reasons.push('Transaction requests unlimited token approval.');
    }
  }

  // Rule: Contract blacklist → +80
  if (isBlacklisted(contractAddress)) {
    score += 80;
    reasons.push('Contract address is on the blacklist.');
  }

  // Rule: Very large transfer (> 5 ETH or equivalent) → +25
  if (isLargeTransfer({ amount: tx?.amount, value })) {
    score += 25;
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
      console.log('AegisDot updating risk score on-chain...');
      await updateRiskScore(tx.walletAddress, score);

      console.log('AegisDot triggering defense executor...');
      await callDefense(tx.walletAddress);
    } catch (err) {
      console.error('AegisDot on-chain defense failed:', err);
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
