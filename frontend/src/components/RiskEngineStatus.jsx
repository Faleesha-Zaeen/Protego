export default function RiskEngineStatus() {
  return (
    <section className="rounded-xl bg-card border border-border shadow-lg p-6 space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-slate-50">Security Engine</h2>
        <p className="text-xs text-slate-400">
          Snapshot of the hybrid Rust + Polkadot execution path for Protego.
        </p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="rounded-xl bg-[#0B0F19] border border-border px-3 py-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Engine</p>
          <p className="text-slate-50 font-semibold">Rust Risk Engine</p>
        </div>
        <div className="rounded-xl bg-[#0B0F19] border border-border px-3 py-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Execution Layer</p>
          <p className="text-accent font-semibold">PolkaVM (planned)</p>
        </div>
        <div className="rounded-xl bg-[#0B0F19] border border-border px-3 py-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Backend Integration</p>
          <p className="text-safe font-semibold">Active</p>
        </div>
        <div className="rounded-xl bg-[#0B0F19] border border-border px-3 py-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Status</p>
          <p className="text-safe font-semibold">Operational</p>
        </div>
      </div>
    </section>
  );
}
