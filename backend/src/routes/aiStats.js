const express = require('express');
const { getStats } = require('../services/aiStats');

const router = express.Router();

router.get('/ai-stats', (req, res) => {
  res.json(getStats());
});

module.exports = router;
