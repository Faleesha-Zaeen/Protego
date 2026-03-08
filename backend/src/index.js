require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Services
const riskEngine = require('./services/riskEngine');

// Routers
const analyzeRouterFactory = require('./routes/analyze');
const simulateAttackRouterFactory = require('./routes/simulateAttack');
const defenseEventsRouter = require('./routes/defenseEvents');
const xcmRouter = require('./routes/xcm');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'AegisDot Backend' });
});

// Routes
// analyzeRouter defines its own path (/api/analyze-transaction)
app.use(analyzeRouterFactory(riskEngine));

// Mount attack simulation under /api/simulate-attack
app.use('/api/simulate-attack', simulateAttackRouterFactory(riskEngine));

// Expose defense events feed
app.use(defenseEventsRouter);

// Expose XCM monitor feed
app.use(xcmRouter);

// Server configuration
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  // Basic startup log; keep it simple for now
  console.log(`AegisDot backend running on port ${PORT}`);
});

// Export server configuration for testing or external control
module.exports = {
  app,
  server,
  PORT,
  riskEngine,
};
