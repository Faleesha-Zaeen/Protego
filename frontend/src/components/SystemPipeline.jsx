import { ArrowRight } from "lucide-react";

const pipelineStages = [
  { title: "User Wallet", description: "Origin point where approvals or transfers start." },
  { title: "Transaction Analyzer", description: "Decodes calldata and flags malicious intent pre-sign." },
  { title: "AI Risk Model", description: "Machine learning score blends labeled on-chain data." },
  { title: "Rust Risk Engine", description: "Deterministic heuristics mirror on-chain enforcement." },
  { title: "RiskRegistry", description: "Stores latest wallet risk scores on-chain." },
  { title: "DefenseExecutor", description: "Automates mitigation when scores spike above thresholds." },
  { title: "GuardianVault", description: "Secures user funds or approvals during incidents." },
];

export default function SystemPipeline() {
  return (
    <section className="rounded-xl bg-card border border-border shadow-lg p-6 space-y-4">
      <header className="space-y-1">
        <p className="text-[11px] uppercase tracking-[0.35em] text-accent">Pipeline</p>
        <h2 className="text-lg font-semibold text-slate-50">Defense Flow</h2>
        <p className="text-xs text-slate-400">
          Every transaction moves through the stack below before touching Polkadot Hub accounts.
        </p>
      </header>
      <div className="flex flex-wrap items-center gap-3">
        {pipelineStages.map((stage, index) => (
          <div key={stage.title} className="flex items-center gap-3">
            <div className="w-48 max-w-full rounded-2xl bg-[#0B0F19] border border-border px-4 py-3 shadow-inner">
              <p className="text-sm font-semibold text-slate-50">{stage.title}</p>
              <p className="text-[11px] text-slate-400 mt-1">{stage.description}</p>
            </div>
            {index < pipelineStages.length - 1 && (
              <ArrowRight className="w-4 h-4 text-slate-500" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
