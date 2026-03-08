import { useMemo } from "react";
import { ShieldAlert, CheckCircle2, Clock3 } from "lucide-react";

const explorerBase = "https://blockscout-testnet.polkadot.io/tx/";

export default function DefenseEventsFeed() {
  const events = useMemo(
    () => [
      {
        wallet: "0xa111...beef",
        action: "GuardianVault isolation triggered",
        txHash: "0x09aa13bf4e92000cba558671acde0011ff22cc33",
        status: "confirmed",
        timestamp: "2 min ago",
      },
      {
        wallet: "0xb222...d00d",
        action: "DefenseExecutor blocked suspicious approval",
        txHash: "0x45ff23ab00019aa45b2cce4f8bb19c449d22a991",
        status: "pending",
        timestamp: "8 min ago",
      },
      {
        wallet: "0xc333...9eaf",
        action: "GuardianVault multisig awaiting quorum",
        txHash: "0x98aa7744bceedd1245aa7733cdf001ab8899ab55",
        status: "pending",
        timestamp: "14 min ago",
      },
    ],
    []
  );

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
        {events.map((event) => (
          <div
            key={event.txHash}
            className="rounded-2xl border border-slate-700/70 bg-slate-950/70 px-4 py-3"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>{event.timestamp}</span>
              <StatusBadge status={event.status} />
            </div>
            <p className="text-sm font-semibold text-slate-100">{event.action}</p>
            <p className="text-[11px] text-slate-400">Wallet: {event.wallet}</p>
            <p className="text-[11px] text-slate-400 break-all">
              Tx: {event.txHash.slice(0, 10)}...{event.txHash.slice(-6)}
            </p>
            <a
              href={`${explorerBase}${event.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[11px] text-highlight hover:text-white transition-colors"
            >
              View on Explorer
            </a>
          </div>
        ))}
      </div>
    </section>
  );
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
