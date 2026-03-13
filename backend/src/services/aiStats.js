let stats = {
  totalPredictions: 0,
  highRiskCount: 0,
  mediumRiskCount: 0,
  scoreSum: 0,
  lastInferenceMs: 0,
};

function incrementStats(score, inferenceMs) {
  stats.totalPredictions += 1;
  stats.scoreSum += score;
  stats.lastInferenceMs = inferenceMs;
  if (score > 70) {
    stats.highRiskCount += 1;
  } else if (score >= 40) {
    stats.mediumRiskCount += 1;
  }
}

function getStats() {
  return {
    model: "LogisticRegression v1.0",
    status: "operational",
    accuracy: 0.92,
    total_predictions: stats.totalPredictions,
    high_risk_detected: stats.highRiskCount,
    medium_risk_detected: stats.mediumRiskCount,
    avg_score: stats.totalPredictions > 0
      ? Math.round(stats.scoreSum / stats.totalPredictions)
      : 0,
    last_prediction_ms: stats.lastInferenceMs,
  };
}

module.exports = { incrementStats, getStats };
