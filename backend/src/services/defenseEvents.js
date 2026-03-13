const MAX_EVENTS = 50;
const defenseEvents = [
  {
    wallet: '0xa111111111111111111111111111111111111111',
    txHash: '0xa4f108411e8316b20d5f7fbcba3e1bc6cd5d9a9e11bf4fa24fd4c0cf967700f6',
    timestamp: Date.now() - 300000,
    status: 'confirmed',
    riskScore: 100,
    riskLevel: 'HIGH',
  },
  {
    wallet: '0xb222222222222222222222222222222222222222',
    txHash: '0x40f2ab12cd34ef56gh78ij90kl12mn34op56qr78st90uv12wx34yz56ab78cd235f',
    timestamp: Date.now() - 600000,
    status: 'confirmed',
    riskScore: 85,
    riskLevel: 'HIGH',
  },
];

function addDefenseEvent(event) {
  const { wallet, txHash, timestamp, status, riskScore, riskLevel } = event || {};
  if (!wallet || !txHash || !timestamp || !status) {
    throw new Error('Defense event missing required fields');
  }

  defenseEvents.unshift({ wallet, txHash, timestamp, status, riskScore, riskLevel });

  if (defenseEvents.length > MAX_EVENTS) {
    defenseEvents.length = MAX_EVENTS;
  }
}

function getDefenseEvents() {
  return [...defenseEvents];
}

module.exports = {
  addDefenseEvent,
  getDefenseEvents,
};
