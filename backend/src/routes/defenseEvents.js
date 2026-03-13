const express = require('express');
const { getDefenseEvents, addDefenseEvent } = require('../services/defenseEvents');

const router = express.Router();

router.get('/api/defense-events', (req, res) => {
  const events = getDefenseEvents();
  res.json({ events });
});

router.post('/api/defense-events', (req, res) => {
  try {
    const { wallet, txHash, timestamp, status, riskScore, riskLevel } = req.body || {};
    if (!wallet || !txHash || !timestamp || !status) {
      return res.status(400).json({
        error: 'wallet, txHash, timestamp, and status are required',
      });
    }

    addDefenseEvent({ wallet, txHash, timestamp, status, riskScore, riskLevel });
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Failed to record defense event:', err);
    res.status(500).json({ error: 'Failed to record defense event' });
  }
});

module.exports = router;
