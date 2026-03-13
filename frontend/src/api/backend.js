import axios from "axios";

const API_BASE = "http://localhost:5000";

export async function analyzeTransaction(payload) {
  const res = await axios.post(`${API_BASE}/api/simulate-attack`, payload);
  return res.data;
}

export async function simulateAttack(params = {}) {
  const res = await axios.post(`${API_BASE}/api/simulate-attack`, params);
  return res.data;
}

export async function recordDefenseEvent(event) {
  const res = await axios.post(`${API_BASE}/api/defense-events`, event);
  return res.data;
}
