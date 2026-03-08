const express = require('express');

// This module exports a router factory so we can inject the risk engine.
module.exports = function createAnalyzeRouter(riskEngine) {
  const router = express.Router();

  // POST /api/analyze-transaction
  router.post('/api/analyze-transaction', async (req, res) => {
    try {
      const { walletAddress, contractAddress, method, value } = req.body || {};

      if (!walletAddress || !contractAddress || !method) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['walletAddress', 'contractAddress', 'method'],
        });
      }

      const result = await riskEngine.analyzeTransaction({
        walletAddress,
        contractAddress,
        method,
        value,
      });

      return res.json(result);
    } catch (err) {
      console.error('Error analyzing transaction:', err);
      return res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  });

  return router;
};
