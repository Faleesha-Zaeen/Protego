import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, ShieldCheck } from "lucide-react";
import NetworkStatus from "./NetworkStatus.jsx";
import DefenseEventsFeed from "./DefenseEventsFeed.jsx";

export default function Dashboard() {
  const [account, setAccount] = useState("");

  const threatFeed = useMemo(
    () => [
      {
        wallet: "0xUser1234567890abcdef",
        contract: "0xDefenseAA12...beef",
        risk: "HIGH",
        note: "Unlimited approval detected",
      },
      {
        wallet: "0x91Aa0012398471b4f00",
        contract: "0xExploit9911...dead",
        risk: "MEDIUM",
        note: "Suspicious contract interaction",
      },
      {
        wallet: "0x4b9c...21d7",
        contract: "0xStable8888...9999",
        risk: "LOW",
        note: "Out-of-pattern stablecoin swap",
      },
    ],
    []
  );

  const securityMetrics = {
    threatsToday: 42,
    defensesTriggered: 8,
    monitoredWallets: 128,
    systemStatus: "ACTIVE",
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not installed");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (accounts && accounts.length > 0) {
      setAccount(accounts[0]);
    }
  };

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-3xl bg-slate-900/70 border border-slate-700/70 shadow-glow overflow-hidden px-6 py-5 flex flex-col md:flex-row md:items-center gap-6 pointer-events-auto"
      >
        <div className="space-y-3 md:flex-1">
          <div className="inline-flex items-center gap-2 text-[11px] px-2 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-highlight">
            <Cpu className="w-3 h-3" />
            <span>On-chain AI Security Layer</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Security Operations Dashboard
          </h1>
          <p className="text-slate-300 max-w-xl text-xs md:text-sm">
            Monitor live risk signals, track automated defenses, and explore
            how AegisDot protects wallets from malicious approvals.
          </p>
        </div>
        <div className="md:w-72 flex flex-col gap-3 items-center justify-center text-xs">
          <button
            onClick={connectWallet}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            {account
              ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
              : "Connect Wallet"}
          </button>
          <div className="rounded-2xl bg-slate-950/80 border border-slate-700/80 px-4 py-3 w-full space-y-1">
            <div className="flex items-center gap-2 text-highlight">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-semibold">Defense Pipeline</span>
            </div>
            <p className="text-slate-300 mt-1">
              Risk Engine → RiskRegistry → DefenseExecutor → GuardianVault.
            </p>
            <div className="mt-2 text-[11px] text-slate-300">
              <p>Network: Polkadot Hub Testnet</p>
              <p>Native Asset: PAS</p>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-3xl bg-slate-900/80 border border-slate-700/70 p-5 space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-50">Threat Feed</h2>
              <p className="text-xs text-slate-400">Latest anomalies detected by the risk engine.</p>
            </div>
            <span className="text-[11px] text-slate-400">Updated ~15s ago</span>
          </header>
          <div className="space-y-3">
            {threatFeed.map((threat) => (
              <div key={`${threat.wallet}-${threat.contract}`} className="rounded-2xl border border-slate-700/70 bg-slate-950/70 px-4 py-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">{threat.note}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-semibold ${
                      threat.risk === "HIGH"
                        ? "text-red-200 bg-red-500/20"
                        : threat.risk === "MEDIUM"
                        ? "text-amber-200 bg-amber-500/20"
                        : "text-emerald-200 bg-emerald-500/20"
                    }`}
                  >
                    {threat.risk}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Wallet: {threat.wallet}</p>
                <p className="text-[11px] text-slate-400">Contract: {threat.contract}</p>
              </div>
            ))}
          </div>
        </section>

        <DefenseEventsFeed />

        <NetworkStatus />

        <section className="rounded-3xl bg-slate-900/80 border border-slate-700/70 p-5 space-y-4">
          <header>
            <h2 className="text-lg font-semibold text-slate-50">Security Status</h2>
            <p className="text-xs text-slate-400">Overall posture of the monitoring system.</p>
          </header>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-2xl bg-slate-950/70 border border-slate-800/70 px-3 py-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Threats Today</p>
              <p className="text-2xl font-semibold text-slate-50">{securityMetrics.threatsToday}</p>
            </div>
            <div className="rounded-2xl bg-slate-950/70 border border-slate-800/70 px-3 py-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Defenses</p>
              <p className="text-2xl font-semibold text-slate-50">{securityMetrics.defensesTriggered}</p>
            </div>
            <div className="rounded-2xl bg-slate-950/70 border border-slate-800/70 px-3 py-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Wallets</p>
              <p className="text-2xl font-semibold text-slate-50">{securityMetrics.monitoredWallets}</p>
            </div>
            <div className="rounded-2xl bg-slate-950/70 border border-slate-800/70 px-3 py-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">System</p>
              <p className="text-xl font-semibold text-emerald-300">{securityMetrics.systemStatus}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
