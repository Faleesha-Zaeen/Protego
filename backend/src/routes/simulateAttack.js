const express = require('express');

// Attack simulation route factory
// Example usage in index.js:
// app.use('/api/simulate-attack', createSimulateAttackRouter(riskEngine));
module.exports = function createSimulateAttackRouter(riskEngine) {
  const router = express.Router();

  // GET /api/simulate-attack
  router.get('/', async (req, res) => {
    try {
      const overrides = req.query || {};

      const tx = {
        walletAddress: overrides.walletAddress || '0xUser123',
        contractAddress:
          overrides.contractAddress || '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        method: overrides.method || 'approve',
        value:
          typeof overrides.value !== 'undefined'
            ? overrides.value
            : 0,
        unlimitedApproval:
          typeof overrides.unlimitedApproval !== 'undefined'
            ? overrides.unlimitedApproval === 'true' || overrides.unlimitedApproval === true
            : true,
      };

      const { riskScore, riskLevel, explanation } =
        await riskEngine.analyzeTransaction(tx);

      const response = {
        simulated: true,
        transaction: tx,
        riskScore,
        riskLevel,
        explanation,
      };

      if (riskLevel === 'HIGH') {
        response.defenseTriggered = true;
        response.message = 'AegisDot blocked a malicious approval attempt.';
      }

      res.json(response);
    } catch (err) {
      console.error('Error in simulate-attack route:', err);
      res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  });

  return router;
};
