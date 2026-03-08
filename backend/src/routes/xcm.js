const express = require('express');
const { getXcmEvents } = require('../services/xcmMonitor');
const { analyzeXcmRisk } = require('../services/xcmRiskAnalyzer');
const { callDefense } = require('../services/contracts');
const { addDefenseEvent } = require('../services/defenseEvents');

const router = express.Router();
const HIGH_RISK_THRESHOLD = 80;
let lastDefenseAlertId = null;

router.get('/api/xcm-events', (req, res) => {
  try {
    const events = getXcmEvents().map((event) => ({
      block: event.blockNumber,
      section: event.section,
      method: event.method,
      timestamp: event.timestamp,
      destination: event.destinationChain,
      amount: event.amount,
      sender: event.sender,
    }));

    res.json(events);
  } catch (err) {
    console.error('Failed to fetch XCM events', err);
    res.status(500).json({ error: 'Failed to fetch XCM events' });
  }
});

router.get('/api/xcm-threat-alerts', async (req, res) => {
  try {
    const events = getXcmEvents();
    const report = analyzeXcmRisk(events);
    const defenseTxHash = await maybeTriggerDefense(report);
    res.json({
      ...report,
      defenseTriggered: Boolean(defenseTxHash),
      defenseTxHash: defenseTxHash || null,
    });
  } catch (err) {
    console.error('Failed to analyze XCM threat alerts', err);
    res.status(500).json({ error: 'Failed to analyze XCM threat alerts' });
  }
});

async function maybeTriggerDefense(report) {
  if (!report || report.riskScore <= HIGH_RISK_THRESHOLD) {
    return null;
  }

  const candidate = Array.isArray(report.alerts)
    ? report.alerts.find((alert) => alert.sender && alert.sender !== 'unknown')
    : null;

  if (!candidate) {
    return null;
  }

  const triggerId = `${candidate.id || candidate.block || 'unknown-block'}-${candidate.sender}`;
  if (lastDefenseAlertId === triggerId) {
    return null;
  }

  try {
    console.log('XCM monitor triggering DefenseExecutor for wallet:', candidate.sender);
    const receipt = await callDefense(candidate.sender);
    const txHash = receipt?.transactionHash || receipt?.hash || null;

    if (txHash) {
      addDefenseEvent({
        wallet: candidate.sender,
        txHash,
        timestamp: Date.now(),
        status: 'confirmed',
      });
    }

    lastDefenseAlertId = triggerId;
    return txHash;
  } catch (err) {
    console.error('Automatic XCM defense failed', err);
    return null;
  }
}

module.exports = router;
