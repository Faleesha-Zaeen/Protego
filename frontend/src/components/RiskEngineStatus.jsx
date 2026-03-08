export default function RiskEngineStatus() {
  return (
    <section className="rounded-3xl bg-slate-900/80 border border-slate-700/70 p-5 space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-slate-50">Security Engine</h2>
        <p className="text-xs text-slate-400">
          Snapshot of the hybrid Rust + Polkadot execution path for AegisDot.
        </p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="rounded-2xl bg-slate-950/70 border border-slate-800/70 px-3 py-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Engine</p>
          <p className="text-slate-50 font-semibold">Rust Risk Engine</p>
        </div>
        <div className="rounded-2xl bg-slate-950/70 border border-slate-800/70 px-3 py-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Execution Layer</p>
          <p className="text-violet-200 font-semibold">PolkaVM (planned)</p>
        </div>
        <div className="rounded-2xl bg-slate-950/70 border border-slate-800/70 px-3 py-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Backend Integration</p>
          <p className="text-emerald-300 font-semibold">Active</p>
        </div>
        <div className="rounded-2xl bg-slate-950/70 border border-slate-800/70 px-3 py-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Status</p>
          <p className="text-emerald-300 font-semibold">Operational</p>
        </div>
      </div>
    </section>
  );
}
