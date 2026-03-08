const UNKNOWN_DESTINATION_PENALTY = 30;
const LARGE_TRANSFER_PENALTY = 40;
const RAPID_TRANSFER_PENALTY = 20;
const LARGE_TRANSFER_THRESHOLD = 1_000_000;
const RAPID_TRANSFER_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

function analyzeXcmRisk(rawEvents = []) {
  if (!Array.isArray(rawEvents) || rawEvents.length === 0) {
    return {
      riskScore: 0,
      riskLevel: 'Low',
      explanation: 'No recent cross-chain activity detected.',
      alerts: [],
    };
  }

  const normalizedEvents = rawEvents.map((event, index) => ({
    id: event.id || `${event.blockNumber || event.block || 'blk'}-${event.timestamp || index}`,
    blockNumber: event.blockNumber || event.block || 0,
    timestamp: event.timestamp || Date.now(),
    destinationChain: sanitizeChain(event.destinationChain),
    amount: Number.isFinite(Number(event.amount)) ? Number(event.amount) : 0,
    sender: event.sender || event.origin || 'unknown',
    section: event.section || 'xcm',
    method: event.method || 'Unknown',
  }));

  const flaggedEvents = normalizedEvents
    .map((event, index) => evaluateEventRisk(event, normalizedEvents, index))
    .filter(Boolean);

  const totalScore = clamp(
    flaggedEvents.reduce((sum, alert) => sum + alert.riskScore, 0),
    0,
    100
  );

  const explanation = flaggedEvents.length
    ? dedupeReasons(flaggedEvents.flatMap((alert) => alert.reasons)).join(' ')
    : 'Cross-chain activity within expected parameters.';

  return {
    riskScore: totalScore,
    riskLevel: deriveRiskLevel(totalScore),
    explanation,
    alerts: flaggedEvents,
  };
}

function evaluateEventRisk(event, events, index) {
  const reasons = [];
  let score = 0;

  if (isUnknownDestination(event.destinationChain)) {
    score += UNKNOWN_DESTINATION_PENALTY;
    reasons.push('Unknown destination chain detected.');
  }

  if (event.amount >= LARGE_TRANSFER_THRESHOLD) {
    score += LARGE_TRANSFER_PENALTY;
    reasons.push('Large cross-chain transfer observed.');
  }

  if (hasRapidTransferPeer(event, events, index)) {
    score += RAPID_TRANSFER_PENALTY;
    reasons.push('Rapid repeated transfers detected.');
  }

  if (score === 0) {
    return null;
  }

  return {
    id: event.id,
    title: buildAlertTitle(reasons),
    destination: formatDestinationForDisplay(event.destinationChain),
    riskScore: score,
    block: event.blockNumber,
    timestamp: event.timestamp,
    method: event.method,
    section: event.section,
    sender: event.sender,
    reasons,
  };
}

function hasRapidTransferPeer(event, events, index) {
  if (!event.sender || event.sender === 'unknown') {
    return false;
  }
  return events.some((otherEvent, otherIndex) => {
    if (index === otherIndex) {
      return false;
    }
    if (otherEvent.sender !== event.sender) {
      return false;
    }
    const delta = Math.abs(event.timestamp - otherEvent.timestamp);
    return delta <= RAPID_TRANSFER_WINDOW_MS;
  });
}

function buildAlertTitle(reasons) {
  if (reasons.some((reason) => reason.includes('Large'))) {
    return '⚠ Suspicious Cross-chain Transfer';
  }
  if (reasons.some((reason) => reason.includes('Rapid'))) {
    return '⚠ Rapid Cross-chain Pattern';
  }
  return '⚠ Unknown Destination Activity';
}

function sanitizeChain(chain) {
  if (!chain) {
    return 'unknown';
  }
  return String(chain).trim() || 'unknown';
}

function formatDestinationForDisplay(chain) {
  if (!chain || chain === 'unknown') {
    return 'Unknown Parachain';
  }
  return chain;
}

function isUnknownDestination(chain) {
  if (!chain) {
    return true;
  }
  const normalized = String(chain).trim().toLowerCase();
  return normalized === 'unknown' || normalized === 'unknown parachain';
}

function dedupeReasons(reasons) {
  return [...new Set(reasons)];
}

function deriveRiskLevel(score) {
  if (score >= 70) {
    return 'High';
  }
  if (score >= 40) {
    return 'Medium';
  }
  return 'Low';
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

module.exports = {
  analyzeXcmRisk,
};
