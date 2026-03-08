import { ArrowDown } from "lucide-react";

const stages = [
  {
    title: "User Wallet",
    description:
      "End-user signs transactions that may contain risky approvals or transfers.",
  },
  {
    title: "AegisDot Frontend",
    description:
      "dApp UI that surfaces risk insights and routes transactions into the security pipeline.",
  },
  {
    title: "Risk Engine (Off-chain analysis)",
    description:
      "Node-based service that analyzes approvals, historical behavior, and context before submission.",
  },
  {
    title: "PolkaVM Precompile Hook (future)",
    description:
      "Planned Rust risk module running as a PolkaVM precompile inside the Polkadot runtime.",
  },
  {
    title: "DefenseExecutor",
    description: "Smart contract that evaluates risk signals and enforces defense policies.",
  },
  {
    title: "GuardianVault",
    description:
      "Escrow-style vault that can isolate or protect funds when high risk is detected.",
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
