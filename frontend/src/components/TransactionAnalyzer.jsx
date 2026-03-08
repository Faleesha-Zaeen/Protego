import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, ShieldCheck } from "lucide-react";
import RiskGauge from "./RiskGauge.jsx";
import ActivityLog from "./ActivityLog.jsx";
import AttackSimulator from "./AttackSimulator.jsx";
import { analyzeTransaction } from "../api/backend";

let logId = 0;

export default function TransactionAnalyzer() {
  const [walletAddress, setWalletAddress] = useState("0xUser123");
  const [contractAddress, setContractAddress] = useState(
    "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
  );
  const [value, setValue] = useState("0");

  const [riskScore, setRiskScore] = useState(null);
  const [riskLevel, setRiskLevel] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [defenseTriggered, setDefenseTriggered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logEntries, setLogEntries] = useState([]);

  function pushLog(message) {
    const time = new Date().toLocaleTimeString();
    logId += 1;
    setLogEntries((prev) => [{ id: logId, time, message }, ...prev].slice(0, 50));
  }

  async function handleAnalyze() {
    setLoading(true);
    setDefenseTriggered(false);
    pushLog("Analyzing transaction from UI...");
    try {
      const payload = {
        walletAddress,
        contractAddress,
        method: "approve",
        value: Number(value) || 0,
        unlimitedApproval: true,
      };
      const data = await analyzeTransaction(payload);
      setRiskScore(data.riskScore);
      setRiskLevel(data.riskLevel);
      setExplanation(data.explanation);
      pushLog(`Risk analysis complete: score ${data.riskScore} (${data.riskLevel}).`);
      if (data.riskLevel === "HIGH") {
        pushLog("Backend may trigger on-chain defense for this wallet.");
      }
    } catch (err) {
      console.error(err);
      pushLog("Analysis failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  function handleSimResult(data) {
    setRiskScore(data.riskScore);
    setRiskLevel(data.riskLevel);
    setExplanation(data.explanation);
    setDefenseTriggered(Boolean(data.defenseTriggered));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 items-start">
      <div className="space-y-4">
        <div className="bg-card/80 border border-slate-700/70 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-highlight" />
              <h2 className="text-sm font-semibold text-slate-100">
                Transaction Analyzer
              </h2>
            </div>
            <AttackSimulator
              onResult={handleSimResult}
              pushLog={pushLog}
              walletAddress={walletAddress}
              contractAddress={contractAddress}
              value={value}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="space-y-1">
              <label className="text-slate-400 text-xs">Wallet Address</label>
              <input
                className="w-full rounded-xl bg-slate-900/80 border border-slate-700/70 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-highlight/70"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-slate-400 text-xs">Contract Address</label>
              <input
                className="w-full rounded-xl bg-slate-900/80 border border-slate-700/70 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-highlight/70"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mt-2">
            <div className="space-y-1 max-w-xs text-sm">
              <label className="text-slate-400 text-xs">Transaction Value (ETH)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-xl bg-slate-900/80 border border-slate-700/70 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-highlight/70"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                Simulation mode uses a malicious unlimited approval to demonstrate defense.
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAnalyze}
              disabled={loading}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-highlight text-slate-900 text-sm font-semibold shadow-glow disabled:opacity-60"
            >
              {loading ? "Analyzing..." : "Analyze Transaction"}
            </motion.button>
          </div>
        </div>

        <div className="bg-card/80 border border-slate-700/70 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <RiskGauge score={riskScore} level={riskLevel} />
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-100 text-sm">
              <AlertTriangle className="w-4 h-4 text-danger" />
              <span>Explanation</span>
            </div>
            <p className="text-slate-300 text-xs md:text-sm min-h-[3rem]">
              {explanation ||
                "Run an analysis or simulation to see the risk explanation here."}
            </p>
            <div className="mt-2 text-xs text-slate-400">
              <p>
                Status: {" "}
                {riskLevel === "HIGH" ? (
                  <span className="text-danger font-semibold flex items-center gap-1">
                    Defense Ready <ShieldCheck className="w-3 h-3" />
                  </span>
                ) : riskLevel ? (
                  <span className="text-safe font-semibold">Monitoring</span>
                ) : (
                  <span className="text-slate-500">Idle</span>
                )}
              </p>
              {defenseTriggered && (
                <p className="text-xs text-safe mt-1">
                  On-chain defense was triggered for the last simulated attack.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ActivityLog entries={logEntries} />
    </div>
  );
}
