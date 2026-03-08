import { useState } from "react";
import { motion } from "framer-motion";
import { Cpu, ShieldCheck } from "lucide-react";
import MetricCards from "./MetricCards.jsx";
import TransactionAnalyzer from "./TransactionAnalyzer.jsx";

export default function Dashboard() {
  const [account, setAccount] = useState("");

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
          </div>
        </div>
      </motion.section>

      <MetricCards />

      <button
        onClick={() => window.ethereum && window.ethereum.request({ method: "eth_requestAccounts" })}
        style={{ background: "red", padding: "10px", color: "white", borderRadius: "8px" }}
        className="relative z-[9999]"
      >
        TEST WALLET
      </button>

      <TransactionAnalyzer />
    </div>
  );
}
