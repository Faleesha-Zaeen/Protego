const MAX_EVENTS = 50;
const defenseEvents = [];

function addDefenseEvent(event) {
  const { wallet, txHash, timestamp, status } = event || {};
  if (!wallet || !txHash || !timestamp || !status) {
    throw new Error('Defense event missing required fields');
  }

  defenseEvents.unshift({ wallet, txHash, timestamp, status });

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
