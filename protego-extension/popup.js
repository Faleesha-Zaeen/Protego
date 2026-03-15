// popup.js for Protego Extension
const statusEl = document.getElementById('protego-status');
const lastTxEl = document.getElementById('protego-last-tx');
const explanationEl = document.getElementById('protego-explanation');

// Get last scanned transaction from chrome.storage
chrome.storage.local.get(['protego_last_tx'], (result) => {
  if (result && result.protego_last_tx) {
    const { tx, score, explanation } = result.protego_last_tx;
    lastTxEl.textContent = `Last Transaction: ${tx ? JSON.stringify(tx) : 'N/A'}`;
    let badgeClass = 'risk-low', badgeText = 'LOW';
    if (score > 70 && score <= 85) { badgeClass = 'risk-medium'; badgeText = 'MEDIUM'; }
    if (score > 85) { badgeClass = 'risk-high'; badgeText = 'HIGH'; }
    lastTxEl.innerHTML += ` <span class="risk-badge ${badgeClass}">${badgeText}: ${score}</span>`;
    explanationEl.textContent = explanation || '';
  } else {
    lastTxEl.textContent = 'No transaction scanned yet.';
    explanationEl.textContent = '';
  }
});

// Always show ACTIVE for now
statusEl.textContent = 'ACTIVE';
