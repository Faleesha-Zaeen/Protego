import { useEffect, useMemo, useState } from "react";

export default function XcmMonitor() {
  const [events, setEvents] = useState([]);
  const backendBaseUrl =
    import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:5000";

  useEffect(() => {
    let isMounted = true;

    async function fetchEvents() {
      try {
        const res = await fetch(`${backendBaseUrl}/api/xcm-events`);
        if (!res.ok) {
          throw new Error(`Failed to fetch XCM events: ${res.status}`);
        }
        const data = await res.json();
        if (isMounted && Array.isArray(data)) {
          setEvents(data);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchEvents();
    const interval = setInterval(fetchEvents, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [backendBaseUrl]);

  const newestEvents = useMemo(() => events.slice(0, 5), [events]);

  return (
    <section className="rounded-xl bg-card border border-border shadow-lg p-6 space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-slate-50">XCM Security Monitor</h2>
        <p className="text-xs text-slate-400">
          Cross-chain intents inspected for anomalies across Polkadot parachains.
        </p>
      </header>
      <div className="space-y-3">
        {newestEvents.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            No cross-chain activity detected.
          </p>
        ) : (
          newestEvents.map((event) => (
            <article
              key={`${event.block}-${event.section}-${event.method}-${event.timestamp}`}
              className="rounded-xl bg-[#0B0F19] border border-border px-4 py-3"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Block #{event.block}</span>
                <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="mt-1 text-sm text-slate-50 font-semibold">
                {event.section} · {event.method}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
