const crypto = require('crypto');
const express = require('express');
const { analyzeTransaction } = require('../services/riskEngine');
const { addDefenseEvent } = require('../services/defenseEvents');

const router = express.Router();

// POST /api/simulate-attack
router.post('/simulate-attack', async (req, res) => {
  try {
    const body = req.body || {};


    const result = await analyzeTransaction({
      walletAddress: body.walletAddress,
      contractAddress: body.contractAddress,
      method: body.method || 'approve',
      value: body.value,
      unlimitedApproval: body.unlimitedApproval || true,
      isKnownContract: false,
      approvalAmount: 'unlimited',
    });

    // Record prediction in aiStats after simulation
    try {
      require('../services/aiStats').incrementStats(result.riskScore, 12);
    } catch (e) {
      console.warn('Could not record AI stats (simulate-attack):', e);
    }

    if (result.riskLevel === 'HIGH') {
      addDefenseEvent({
        wallet: body.walletAddress,
        txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
        timestamp: Date.now(),
        status: 'confirmed',
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
      });
    }

    res.json({
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      explanation: result.explanation,
      defenseTriggered: result.riskLevel === 'HIGH',
      transaction: {
        walletAddress: body.walletAddress,
        contractAddress: body.contractAddress,
        method: body.method || 'approve',
        value: body.value,
        unlimitedApproval: true,
      },
    });
  } catch (err) {
    console.error('Error in simulate-attack route:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
