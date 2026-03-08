import { ArrowDown } from "lucide-react";

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
    title: "PolkaVM Layer",
    description:
      "Planned runtime hook where the same Rust logic can run natively inside Polkadot.",
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
  {
    title: "XCM Monitoring",
    description:
      "Observability layer for cross-chain intents so that risky transfers can be blocked upstream.",
  },
];

export default function PipelineDiagram() {
  return (
    <div className="bg-slate-900/80 border border-slate-700/70 rounded-3xl p-6 md:p-8 space-y-4">
      <h2 className="text-lg font-semibold text-slate-50 mb-2">System Pipeline</h2>
      <p className="text-sm text-slate-300 mb-4 max-w-xl">
        Visual overview of how a transaction flows through AegisDot before any
        user signs: from risk scoring to on-chain defense.
      </p>
      <div className="flex flex-col items-center gap-3">
        {stages.map((stage, index) => (
          <div key={stage.title} className="flex flex-col items-center gap-2">
            <div className="w-64 md:w-80 rounded-2xl bg-slate-950/80 border border-slate-700/70 px-4 py-3 text-center shadow-glow/40">
              <div className="text-sm font-semibold text-highlight mb-1">
                {stage.title}
              </div>
              <p className="text-[11px] text-slate-300">{stage.description}</p>
            </div>
            {index < stages.length - 1 && (
              <ArrowDown className="w-4 h-4 text-slate-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
