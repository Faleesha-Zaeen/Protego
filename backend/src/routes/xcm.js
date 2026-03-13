const express = require('express');
const { getXcmEvents } = require('../services/xcmMonitor');

const router = express.Router();
router.get('/api/xcm-events', (req, res) => {
  try {
    res.json(getXcmEvents());
  } catch (err) {
    console.error('Failed to fetch XCM events', err);
    res.status(500).json({ error: 'Failed to fetch XCM events' });
  }
});

router.get('/api/xcm-threat-alerts', async (req, res) => {
  try {
    const flagged = getXcmEvents().filter((event) => event?.flagged === true);
    res.json(flagged);
  } catch (err) {
    console.error('Failed to analyze XCM threat alerts', err);
    res.status(500).json({ error: 'Failed to analyze XCM threat alerts' });
  }
});

module.exports = router;
