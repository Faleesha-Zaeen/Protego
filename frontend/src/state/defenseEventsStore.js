// Lightweight shared store for propagated defense events across the frontend.
const defenseEvents = [];

export function addDefenseEvent(event) {
  const { wallet, txHash, timestamp, status } = event;
  if (!wallet || !txHash || !timestamp || !status) {
    throw new Error("Defense event payload missing required fields");
  }

  defenseEvents.unshift({ wallet, txHash, timestamp, status });
}

export function getDefenseEvents() {
  return [...defenseEvents];
}
