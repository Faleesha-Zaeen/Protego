// background.js for Protego Chrome Extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PROTEGO_ANALYZE' && message.txParams) {
    fetch('https://protego-z3ra.onrender.com/api/analyze-transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message.txParams)
    })
      .then(res => res.json())
      .then(data => {
        sendResponse({
          score: data.riskScore,
          explanation: data.explanation
        });
      })
      .catch(() => {
        sendResponse({ score: 100, explanation: 'Risk analysis failed.' });
      });
    return true; // Keep the message channel open for async response
  }
});
