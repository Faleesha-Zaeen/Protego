// Intercept window.ethereum.request for eth_sendTransaction
(function () {
  const originalRequest = window.ethereum && window.ethereum.request;
  if (!originalRequest) return;

  window.ethereum.request = async function (args) {
    if (args && args.method === 'eth_sendTransaction' && Array.isArray(args.params)) {
      const txParams = args.params[0];
      // Send transaction params to background.js
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'PROTEGO_ANALYZE', txParams }, resolve);
      });
      if (response && response.score !== undefined) {
        // Store last scanned transaction for popup
        chrome.storage && chrome.storage.local && chrome.storage.local.set({
          protego_last_tx: {
            tx: txParams,
            score: response.score,
            explanation: response.explanation
          }
        });
        if (response.score > 70) {
          // Show blocking overlay
          showProtegoOverlay(response.score, response.explanation, () => {
            // Block (do nothing)
            removeProtegoOverlay();
            throw new Error('PROTEGO: Transaction blocked by user.');
          }, async () => {
            // Proceed anyway
            removeProtegoOverlay();
            return await originalRequest.apply(window.ethereum, [args]);
          });
          // Wait for user action
          return new Promise(() => {}); // Never resolves until overlay action
        }
      }
    }
    return originalRequest.apply(this, arguments);
  };

  function showProtegoOverlay(score, explanation, onBlock, onProceed) {
    removeProtegoOverlay();
    const overlay = document.createElement('div');
    overlay.id = 'protego-block-overlay';
    overlay.style = `
      position: fixed; z-index: 2147483647; inset: 0; background: rgba(10,10,15,0.75); display: flex; align-items: center; justify-content: center;`;
    const card = document.createElement('div');
    card.style = `
      background: rgba(255,255,255,0.15); backdrop-filter: blur(16px) saturate(180%);
      border-radius: 24px; box-shadow: 0 8px 32px 0 rgba(31,38,135,0.37);
      border: 1px solid rgba(255,255,255,0.18); padding: 2.5rem 2rem; min-width: 340px; max-width: 90vw;
      display: flex; flex-direction: column; align-items: center; color: #fff; font-family: inherit;
    `;
    card.innerHTML = `
      <div style="font-size:2.2rem;">⚠️</div>
      <div style="font-size:1.2rem;font-weight:600;margin:1rem 0 0.5rem;letter-spacing:0.01em;">PROTEGO BLOCKED THIS TRANSACTION</div>
      <div style="margin-bottom:0.5rem;font-size:1.1rem;">Risk Score: <span style="font-weight:700;color:${score>85?'#ef4444':score>70?'#facc15':'#22c55e'}">${score}</span></div>
      <div style="margin-bottom:1.2rem;font-size:0.98rem;max-width:320px;text-align:center;">${explanation||'High risk detected.'}</div>
      <div style="display:flex;gap:1.2rem;">
        <button id="protego-block-btn" style="background:#ef4444;color:#fff;font-weight:600;padding:0.6rem 1.4rem;border:none;border-radius:8px;font-size:1rem;box-shadow:0 2px 8px #ef444455;cursor:pointer;">Block (Recommended)</button>
        <button id="protego-proceed-btn" style="background:#fff;color:#0a0a0f;font-weight:600;padding:0.6rem 1.4rem;border:none;border-radius:8px;font-size:1rem;box-shadow:0 2px 8px #fff2;cursor:pointer;">Proceed Anyway</button>
      </div>
    `;
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    document.getElementById('protego-block-btn').onclick = onBlock;
    document.getElementById('protego-proceed-btn').onclick = onProceed;
  }

  function removeProtegoOverlay() {
    const overlay = document.getElementById('protego-block-overlay');
    if (overlay) overlay.remove();
  }
})();
