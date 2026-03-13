import { useEffect, useState } from "react";
import { GlassCard } from "../components/ui/GlassCard.tsx";

const CONTRACTS = [
  {
    name: "RiskEngine (PVM)",
    address: "0x8ac03522a73EF023cF5A9CEC767D7a07736b45d9",
    type: "PolkaVM bytecode",
  },
  {
    name: "DefenseExecutor",
    address: "0xf3b8cfF56A5c83D4e7ca36B0e35F6f67cabAC1F2",
    type: "EVM Solidity",
  },
  {
    name: "GuardianVault",
    address: "0xDBC63E7c1C244D5D0359Be41F8815592b8097619",
    type: "EVM Solidity",
  },
  {
    name: "RiskRegistry",
    address: "0x42Cc0cfD29D8d57BcAFB479B60900D362aC5b63A",
    type: "EVM Solidity",
  },
];

const DEFAULT_STATS = {
  model: "LogisticRegression v1.0",
  status: "operational",
  accuracy: 0.92,
  total_predictions: 0,
  high_risk_detected: 0,
  avg_score: 0,
  last_prediction_ms: 0,
};

function shortAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function TechProofPage() {
  const [stats, setStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const response = await fetch("/api/ai-stats");
        if (!response.ok) return;
        const data = await response.json();
        if (isMounted) setStats(data);
      } catch {
        // Keep last known stats on network error.
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10_000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-accent">
          Proof of Depth
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold">
          Technical Proof for Judges
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl">
          Every card below is built to show the on-chain, cross-VM, AI, and
          testing depth behind Protego.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              EVM -&gt; PVM Cross-VM Call — Verified On-Chain
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
              VERIFIED ON-CHAIN
            </span>
          </div>
          <div className="mt-5 space-y-4 text-sm text-slate-200">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                PVM RiskEngine
              </span>
              <a
                href="https://blockscout-testnet.polkadot.io/address/0x8ac03522a73EF023cF5A9CEC767D7a07736b45d9"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-200 hover:text-cyan-100"
              >
                0x8ac03522a73EF023cF5A9CEC767D7a07736b45d9
              </a>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                DefenseExecutor (EVM)
              </span>
              <a
                href="https://blockscout-testnet.polkadot.io/address/0xf3b8cfF56A5c83D4e7ca36B0e35F6f67cabAC1F2"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-200 hover:text-cyan-100"
              >
                0xf3b8cfF56A5c83D4e7ca36B0e35F6f67cabAC1F2
              </a>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Cross-VM Transaction Proof
              </span>
              <a
                href="https://blockscout-testnet.polkadot.io/tx/0x9890fd9602ec8db8bb99943760d91b85046129360e25f87c1ad481b318d209e9"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-200 hover:text-cyan-100"
              >
                0x9890fd9602ec8db8bb99943760d91b85046129360e25f87c1ad481b318d209e9
              </a>
            </div>
            <p className="text-sm text-slate-300">
              DefenseExecutor.sol (EVM/Solidity) calls RiskEngine (PolkaVM/PVM)
              on-chain. Risk score is returned from PVM and enforced at contract
              level.
            </p>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-semibold">
            Deployed Contracts — Polkadot Hub TestNet
          </h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3">Contract</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {CONTRACTS.map((contract) => (
                  <tr key={contract.address} className="text-slate-200">
                    <td className="px-4 py-3 font-semibold">
                      {contract.name}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://blockscout-testnet.polkadot.io/address/${contract.address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-200 hover:text-cyan-100"
                      >
                        {shortAddress(contract.address)}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {contract.type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">AI Risk Model — Live Stats</h2>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
              OPERATIONAL
            </span>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Model
              </p>
              <p className="text-slate-200">{stats.model}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Accuracy
              </p>
              <p className="text-slate-200">{stats.accuracy}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Total predictions
              </p>
              <p className="text-slate-200">{stats.total_predictions}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                High risk detected
              </p>
              <p className="text-slate-200">{stats.high_risk_detected}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Avg score
              </p>
              <p className="text-slate-200">{stats.avg_score}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Last inference
              </p>
              <p className="text-slate-200">{stats.last_prediction_ms}ms</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-semibold">Smart Contract Tests — 15/15 Passing</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span>RiskEngine (PVM)</span>
              <span className="text-emerald-300">5/5 ✅</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span>DefenseExecutor</span>
              <span className="text-emerald-300">6/6 ✅</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span>RiskRegistry</span>
              <span className="text-emerald-300">3/3 ✅</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span>GuardianVault</span>
              <span className="text-emerald-300">1/1 ✅</span>
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Network: Polkadot Hub TestNet (live)
            </p>
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-lg font-semibold">How Protego Works</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {[
            "Step 1: User submits transaction",
            "Step 2: AI model scores risk off-chain (LogisticRegression)",
            "Step 3: DefenseExecutor.sol calls RiskEngine via cross-VM call",
            "Step 4: PVM contract returns score 0-100",
            "Step 5: If score > 70 -> GuardianVault blocks the transaction",
            "Step 6: Defense event logged on-chain",
          ].map((step) => (
            <div
              key={step}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-slate-200"
            >
              {step}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
