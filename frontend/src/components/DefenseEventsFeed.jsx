import { ShieldAlert, CheckCircle2, Clock3 } from "lucide-react";

const explorerBase = "https://blockscout-testnet.polkadot.io/tx/";

export default function DefenseEventsFeed({ events = [] }) {
  const hasEvents = events.length > 0;

  return (
    <section className="rounded-3xl bg-slate-900/80 border border-slate-700/70 p-5 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">Defense Events</h2>
          <p className="text-xs text-slate-400">
            Real-time actions initiated by DefenseExecutor & GuardianVault.
          </p>
        </div>
        <ShieldAlert className="w-5 h-5 text-highlight" />
      </header>
      <div className="space-y-3">
        {hasEvents ? (
          events.map((event) => {
            const walletLabel = formatWallet(event.wallet);
            const hashLabel = formatHash(event.txHash);
            const timestampLabel = formatTimestamp(event.timestamp);

            return (
              <div
                key={event.txHash}
                className="rounded-2xl border border-slate-700/70 bg-slate-950/70 px-4 py-3"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>{timestampLabel}</span>
                  <StatusBadge status={event.status} />
                </div>
                <p className="text-[11px] text-slate-400">Wallet: {walletLabel}</p>
                <p className="text-[11px] text-slate-400 break-all">Tx: {hashLabel}</p>
                <a
                  href={`${explorerBase}${event.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center justify-center px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/70 text-[11px] font-semibold text-highlight hover:text-white hover:border-highlight transition-colors"
                >
                  View on Explorer
                </a>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-950/50 px-4 py-5 text-center text-[12px] text-slate-400">
            No defense events yet. Run the attack simulator to trigger an automated response.
          </div>
        )}
      </div>
    </section>
  );
}

function formatWallet(value) {
  if (!value || value.length < 10) return value || "Unknown";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function formatHash(value) {
  if (!value || value.length < 10) return value || "Unknown";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function formatTimestamp(value) {
  if (!value) return "Unknown";
  if (typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString();
    }
  }
  return value;
}

function StatusBadge({ status }) {
  const normalized = status?.toLowerCase();
  if (normalized === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-emerald-200 bg-emerald-500/20">
        <CheckCircle2 className="w-3 h-3" /> Confirmed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-amber-200 bg-amber-500/20">
      <Clock3 className="w-3 h-3" /> Pending
    </span>
  );
}
