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

            (function() {
              if (typeof window.ethereum === 'undefined') return;
  
              const originalRequest = window.ethereum.request.bind(window.ethereum);
  
              window.ethereum.request = async function(args) {
                if (args.method === 'eth_sendTransaction' || 
                    args.method === 'eth_signTransaction') {
      
                  const tx = args.params[0];
      
                  chrome.runtime.sendMessage({
                    type: 'ANALYZE_TRANSACTION',
                    transaction: tx
                  }, async (response) => {
                    if (response && response.score > 70) {
                      showBlockingOverlay(response.score, response.explanation);
                    }
                  });
      
                  const score = await getScore(tx);
                  if (score > 70) {
                    return new Promise((resolve, reject) => {
                      showBlockingOverlay(score, 'High risk transaction detected', 
                        () => reject(new Error('Blocked by Protego')),
                        () => resolve(originalRequest(args))
                      );
                    });
                  }
                }
                return originalRequest(args);
              };
  
              async function getScore(tx) {
                try {
                  const response = await fetch(
                    'https://protego-z3ra.onrender.com/api/analyze-transaction',
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        walletAddress: tx.from || '0x0000000000000000000000000000000000000000',
                        contractAddress: tx.to || '0x0000000000000000000000000000000000000000',
                        value: tx.value || '0',
                        calldata: tx.data || '0x'
                      })
                    }
                  );
                  const data = await response.json();
                  return data.score || 0;
                } catch (e) {
                  return 0;
                }
              }
  
              function showBlockingOverlay(score, explanation, onBlock, onProceed) {
                const overlay = document.createElement('div');
                overlay.id = 'protego-overlay';
                overlay.style.cssText = `
                  position: fixed;
                  top: 0; left: 0;
                  width: 100%; height: 100%;
                  background: rgba(0,0,0,0.85);
                  z-index: 999999;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                `;
    
                const scoreColor = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#22c55e';
                const level = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';
    
                overlay.innerHTML = `
                  <div style="
                    background: rgba(15,15,25,0.95);
                    border: 1px solid rgba(239,68,68,0.5);
                    border-radius: 16px;
                    padding: 32px;
                    max-width: 420px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 0 40px rgba(239,68,68,0.2);
                  ">
                    <div style="font-size:48px;margin-bottom:16px;">🛡️</div>
                    <div style="
                      color: #ef4444;
                      font-size: 18px;
                      font-weight: 700;
                      margin-bottom: 8px;
                      letter-spacing: 1px;
                    ">⚠️ PROTEGO BLOCKED THIS TRANSACTION</div>
                    <div style="
                      background: rgba(239,68,68,0.1);
                      border: 1px solid rgba(239,68,68,0.3);
                      border-radius: 8px;
                      padding: 12px;
                      margin: 16px 0;
                    ">
                      <div style="color:#94a3b8;font-size:12px;margin-bottom:4px;">RISK SCORE</div>
                      <div style="color:${scoreColor};font-size:36px;font-weight:700;">${score}</div>
                      <div style="color:${scoreColor};font-size:12px;font-weight:600;">${level} RISK</div>
                    </div>
                    <div style="color:#94a3b8;font-size:13px;margin-bottom:24px;">${explanation}</div>
                    <div style="display:flex;gap:12px;justify-content:center;">
                      <button id="protego-block" style="
                        background: #ef4444;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        padding: 12px 24px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        flex: 1;
                      ">🛡️ Block (Recommended)</button>
                      <button id="protego-proceed" style="
                        background: rgba(255,255,255,0.1);
                        color: #94a3b8;
                        border: 1px solid rgba(255,255,255,0.2);
                        border-radius: 8px;
                        padding: 12px 24px;
                        font-size: 14px;
                        cursor: pointer;
                        flex: 1;
                      ">Proceed Anyway</button>
                    </div>
                    <div style="color:#475569;font-size:11px;margin-top:16px;">
                      Protected by Protego — AI Security Firewall for Web3
                    </div>
                  </div>
                `;
    
                document.body.appendChild(overlay);
    
                document.getElementById('protego-block').onclick = () => {
                  overlay.remove();
                  if (onBlock) onBlock();
                };
    
                document.getElementById('protego-proceed').onclick = () => {
                  overlay.remove();
                  if (onProceed) onProceed();
                };
              }
            })();
