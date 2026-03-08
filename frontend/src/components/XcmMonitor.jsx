export default function XcmMonitor() {
  const metrics = {
    transfersAnalyzed: 184,
    suspiciousTransfers: 6,
    blockedTransfers: 3,
  };

  return (
    <section className="rounded-3xl bg-slate-900/80 border border-slate-700/70 p-5 space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-slate-50">XCM Security Monitor</h2>
        <p className="text-xs text-slate-400">
          Cross-chain intents inspected for anomalies across Polkadot parachains.
        </p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="rounded-2xl bg-slate-950/70 border border-slate-800/70 px-3 py-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Transfers Analyzed Today</p>
          <p className="text-3xl font-semibold text-slate-50">{metrics.transfersAnalyzed}</p>
        </div>
        <div className="rounded-2xl bg-slate-950/70 border border-slate-800/70 px-3 py-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Suspicious Transfers</p>
          <p className="text-3xl font-semibold text-amber-300">{metrics.suspiciousTransfers}</p>
        </div>
        <div className="rounded-2xl bg-slate-950/70 border border-slate-800/70 px-3 py-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Blocked Transfers</p>
          <p className="text-3xl font-semibold text-rose-300">{metrics.blockedTransfers}</p>
        </div>
      </div>
    </section>
  );
}
