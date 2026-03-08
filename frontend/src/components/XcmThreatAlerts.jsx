import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";

const POLL_INTERVAL_MS = 12000;

export default function XcmThreatAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({
    riskScore: 0,
    riskLevel: "Low",
    explanation: "Monitoring cross-chain activity...",
  });
  const backendBaseUrl =
    import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:5000";

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
        setSummary({
          riskScore: data?.riskScore ?? 0,
          riskLevel: data?.riskLevel ?? "Low",
          explanation:
            data?.explanation ||
            "Cross-chain activity within expected parameters.",
        });
        setAlerts(Array.isArray(data?.alerts) ? data.alerts.slice(0, 3) : []);
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setAlerts([]);
        }
      }
    }

    fetchAlerts();
    const interval = setInterval(fetchAlerts, POLL_INTERVAL_MS);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [backendBaseUrl]);

  const badgeStyles = useMemo(() => {
    switch (summary.riskLevel) {
      case "High":
        return "text-danger bg-danger/10 border border-danger/30";
      case "Medium":
        return "text-warning bg-warning/10 border border-warning/30";
      default:
        return "text-safe bg-safe/10 border border-safe/30";
    }
  }, [summary.riskLevel]);

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
          <div className={`text-[11px] px-3 py-1 rounded-full font-semibold ${badgeStyles}`}>
            {summary.riskLevel} · Score {summary.riskScore}
          </div>
        </div>
        <p className="text-[11px] text-slate-400">{summary.explanation}</p>
      </header>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center text-sm text-slate-400 py-8">
            No cross-chain threats flagged.
          </div>
        ) : (
          alerts.map((alert) => (
            <article
              key={`${alert.id}-${alert.block}`}
              className="rounded-xl bg-[#0B0F19] border border-border px-4 py-3 space-y-1"
            >
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1 font-semibold text-warning">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {alert.title || "⚠ XCM Alert"}
                </span>
                <span className="text-slate-400">Risk Score: {alert.riskScore}</span>
              </div>
              <div className="text-sm text-slate-50">
                Destination: {alert.destination || "Unknown Parachain"}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span>Block #{alert.block || "-"}</span>
                <span>Method: {alert.method}</span>
              </div>
              {alert.reasons?.length > 0 && (
                <p className="text-[11px] text-slate-500">
                  {alert.reasons.join(" ")}
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
