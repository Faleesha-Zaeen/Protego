import { ArrowRight } from "lucide-react";

const stages = [
  {
    title: "User Wallet",
    description: "Origin point where the user initiates an approval or transfer.",
  },
  {
    title: "AegisDot Analyzer",
    description:
      "Surfaces pre-sign insights and streams transactions into the analyzer.",
  },
  {
    title: "Feature Extraction",
    description:
      "Derives unlimited approval, large transfer, and unknown contract signals.",
  },
  {
    title: "AI Risk Model",
    description:
      "RandomForestClassifier scoring risky patterns before hitting the chain.",
  },
  {
    title: "Rust Risk Engine",
    description:
      "Cargo-powered scoring module that outputs deterministic risk flags for each transaction.",
  },
  {
    title: "RiskRegistry",
    description: "On-chain ledger that stores the latest score and enforcement status per wallet.",
  },
  {
    title: "DefenseExecutor",
    description:
      "Coordinated contract that routes mitigations once a high score is recorded.",
  },
  {
    title: "GuardianVault",
    description: "Vault that can isolate funds or enforce withdrawal delays while threats are active.",
  },
  {
    title: "Polkadot Hub",
    description: "Execution environment providing RPC, consensus, and security guarantees.",
  },
];

export default function PipelineDiagram() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg p-6 md:p-8 space-y-4">
      <h2 className="text-lg font-semibold text-slate-50 mb-2">System Pipeline</h2>
      <p className="text-sm text-slate-300 mb-4 max-w-2xl">
        Visual overview of how a transaction flows through AegisDot before any
        user signs: from risk scoring to on-chain defense.
      </p>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {stages.map((stage, index) => (
            <div key={stage.title} className="flex items-center gap-3">
              <div className="w-56 rounded-xl bg-[#0B0F19] border border-border px-4 py-3 text-center">
                <div className="text-sm font-semibold text-accent mb-1">
                  {stage.title}
                </div>
                <p className="text-[11px] text-slate-300">{stage.description}</p>
              </div>
              {index < stages.length - 1 && (
                <ArrowRight className="w-4 h-4 text-slate-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
