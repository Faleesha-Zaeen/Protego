import { ShieldCheck } from "lucide-react";

export default function ProtectionStatus({
  walletConnected,
  analysisCount = 0,
  threatsBlocked = 0,
  defensesTriggered = 0,
}) {
  const statusLabel = walletConnected ? "ACTIVE" : "STANDBY";
  const statusColor = walletConnected
    ? "text-safe bg-safe/10 border border-safe/30"
    : "text-warning bg-warning/10 border border-warning/30";

  const stats = [
    { label: "Transactions analyzed today", value: analysisCount },
    { label: "Threats blocked", value: threatsBlocked },
    { label: "Defenses triggered", value: defensesTriggered },
  ];

  return (
    <section className="rounded-2xl bg-card border border-border shadow-glow p-6 space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-accent">Protego</p>
          <div className="flex items-center gap-2 text-xl font-semibold text-slate-50">
            <ShieldCheck className="w-5 h-5 text-accent" />
            Wallet Protection
          </div>
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold ${statusColor}`}>
          <span>Status:</span>
          <span>{statusLabel}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-[#0B0F19] border border-border px-4 py-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">{stat.label}</p>
            <p className="text-2xl font-semibold text-slate-50 font-mono mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
