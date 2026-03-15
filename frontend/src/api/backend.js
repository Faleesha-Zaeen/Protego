
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
});

export async function analyzeTransaction(payload) {
  const res = await api.post('/api/simulate-attack', payload);
  return res.data;
}

export async function simulateAttack(params = {}) {
  const res = await api.post('/api/simulate-attack', params);
  return res.data;
}

export async function recordDefenseEvent(event) {
  const res = await api.post('/api/defense-events', event);
  return res.data;
}
