// Intercept window.ethereum.request for eth_sendTransaction
(function () {
  const originalRequest = window.ethereum && window.ethereum.request;
  if (!originalRequest) return;

  window.ethereum.request = async function (args) {
    if (args && args.method === 'eth_sendTransaction' && Array.isArray(args.params)) {

      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('injected.js');
      script.onload = function() { this.remove(); };
      (document.head || document.documentElement).appendChild(script);

      window.addEventListener('message', function(event) {
        if (event.source !== window) return;
        if (event.data.type === 'PROTEGO_ANALYZE') {
          fetch('https://protego-z3ra.onrender.com/api/analyze-transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event.data.transaction)
          })
          .then(r => r.json())
          .then(data => {
            window.postMessage({
              type: 'PROTEGO_RESULT',
              score: data.score || 0,
              explanation: data.explanation || 'Risk assessed'
            }, '*');
          })
          .catch(() => {
            window.postMessage({ type: 'PROTEGO_RESULT', score: 0 }, '*');
          });
        }
      });
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
