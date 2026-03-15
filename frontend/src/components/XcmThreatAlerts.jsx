import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";

const POLL_INTERVAL_MS = 10000;

function truncateAddress(value) {
  if (!value) return "Unknown";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function formatTimestamp(value) {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString();
}

function getRiskBadge(score) {
  if (score > 70) return "text-danger bg-danger/10 border border-danger/30";
  if (score > 40) return "text-warning bg-warning/10 border border-warning/30";
  return "text-safe bg-safe/10 border border-safe/30";
}

export default function XcmThreatAlerts() {
  const [alerts, setAlerts] = useState([]);
  const backendBaseUrl =
    import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    let isMounted = true;

    async function fetchAlerts() {
      try {
        const res = await fetch(`${backendBaseUrl}/api/xcm-threat-alerts`);
        if (!res.ok) {
          throw new Error(`Failed to fetch XCM threat alerts: ${res.status}`);
        }
        const data = await res.json();
        if (!isMounted) {
          return;
        }
        if (Array.isArray(data)) {
          setAlerts(data);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchAlerts();
    const interval = setInterval(fetchAlerts, POLL_INTERVAL_MS);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [backendBaseUrl]);

  const highestRiskScore = useMemo(() => {
    if (!alerts.length) return 0;
    return alerts.reduce((max, alert) => Math.max(max, Number(alert.riskScore) || 0), 0);
  }, [alerts]);

  const summaryBadge = useMemo(() => getRiskBadge(highestRiskScore), [highestRiskScore]);

  return (
    <section className="rounded-xl bg-card border border-border shadow-lg p-6 space-y-4">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">XCM Threat Alerts</h2>
            <p className="text-xs text-slate-400">
              Live threat assessment sourced from Polkadot cross-chain telemetry.
            </p>
          </div>
          <div className={`text-[11px] px-3 py-1 rounded-full font-semibold ${summaryBadge}`}>
            Score {highestRiskScore}
          </div>
        </div>
        <p className="text-[11px] text-slate-400">Monitoring cross-chain threat signals.</p>
      </header>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center text-sm text-slate-400 py-8">
            No cross-chain threats flagged.
          </div>
        ) : (
          alerts.map((alert) => (
            <article
              key={`${alert.sender}-${alert.timestamp}-${alert.destination}`}
              className="rounded-xl bg-[#0B0F19] border border-border px-4 py-3 space-y-1"
            >
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1 font-semibold text-warning">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  XCM Alert
                </span>
                <span
                  className={`text-[11px] px-2 py-1 rounded-full font-semibold ${getRiskBadge(
                    Number(alert.riskScore) || 0
                  )}`}
                >
                  Score {alert.riskScore ?? 0}
                </span>
              </div>
              <div className="text-sm text-slate-50">
                Destination: {alert.destination || "Unknown Parachain"}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span>Amount: {alert.amount || "-"}</span>
                <span>Sender: {truncateAddress(alert.sender)}</span>
                <span>Time: {formatTimestamp(alert.timestamp)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span>Section: {alert.section || "-"}</span>
                <span>Method: {alert.method || "-"}</span>
                {alert.flagged === true && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold text-danger bg-danger/10 border border-danger/30">
                    FLAGGED
                  </span>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
