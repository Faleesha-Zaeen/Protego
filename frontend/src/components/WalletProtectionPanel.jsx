import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { analyzeTransaction } from "../api/backend";

const backendBaseUrl =
  import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:5000";

const statusColors = {
  BLOCKED: "bg-red-500/10 text-danger border border-danger/40",
  ALLOWED: "bg-safe/10 text-safe border border-safe/40",
};

const riskPills = {
  LOW: "text-safe bg-safe/10 border border-safe/30",
  MEDIUM: "text-warning bg-warning/10 border border-warning/30",
  HIGH: "text-danger bg-danger/10 border border-danger/30",
};

function truncate(value, chars = 6) {
  if (!value || value.length <= chars * 2) return value || "Unknown";
  return `${value.slice(0, chars)}...${value.slice(-chars)}`;
}

async function fetchDefenseTriggered(walletAddress, sinceTimestamp) {
  try {
    const res = await fetch(`${backendBaseUrl}/api/defense-events`);
    if (!res.ok) {
      throw new Error(`Failed to fetch defense events: ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data?.events)) {
      return false;
    }
    const normalizedWallet = walletAddress?.toLowerCase();
    return data.events.some((event) => {
      if (!event?.wallet) return false;
      const matchesWallet = event.wallet.toLowerCase() === normalizedWallet;
      if (!matchesWallet) return false;
      const eventTimestamp = Number(event.timestamp) || 0;
      return !sinceTimestamp || eventTimestamp >= sinceTimestamp;
    });
  } catch (err) {
    console.error("Defense event lookup failed", err);
    return false;
  }
}

export default function WalletProtectionPanel({ walletAddress, lastTransaction }) {
  const [riskScore, setRiskScore] = useState(null);
  const [riskLevel, setRiskLevel] = useState(null);
  const [explanation, setExplanation] = useState("Connect a wallet and analyze a transaction to see details.");
  const [defenseTriggered, setDefenseTriggered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisTimestamp, setAnalysisTimestamp] = useState(null);

  const hasWallet = Boolean(walletAddress);
  const txnSummary = useMemo(() => {
    if (!lastTransaction) return "No transaction analyzed yet.";
    const method = lastTransaction.method || "unknown";
    const spender = truncate(lastTransaction.contractAddress || lastTransaction.spender || "unknown");
    const unlimited =
      lastTransaction.unlimitedApproval === true || Number(lastTransaction.value) === 0;
    const amountLabel = unlimited ? "unlimited" : `${lastTransaction.value ?? 0} PAS`;
    return `${method}(${spender}, ${amountLabel})`;
  }, [lastTransaction]);

  useEffect(() => {
    if (!hasWallet || !lastTransaction) {
      setRiskScore(null);
      setRiskLevel(null);
      setDefenseTriggered(false);
      setExplanation("Connect a wallet and analyze a transaction to populate the protection panel.");
      return undefined;
    }

    let cancelled = false;

    async function runAnalysis() {
      setLoading(true);
      setError(null);
      try {
        const payload = {
          walletAddress: lastTransaction.walletAddress || walletAddress,
          contractAddress: lastTransaction.contractAddress,
          method: lastTransaction.method || "approve",
          value: Number(lastTransaction.value) || 0,
          unlimitedApproval: lastTransaction.unlimitedApproval,
        };

        const result = await analyzeTransaction(payload);
        if (cancelled) return;

        setRiskScore(result?.riskScore ?? null);
        setRiskLevel(result?.riskLevel ?? null);
        setExplanation(result?.explanation ?? "Risk engine did not return an explanation.");
        setAnalysisTimestamp(Date.now());

        if (result?.riskLevel === "HIGH") {
          const triggered = await fetchDefenseTriggered(payload.walletAddress, lastTransaction.timestamp);
          if (!cancelled) {
            setDefenseTriggered(triggered);
          }
        } else {
          setDefenseTriggered(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("WalletProtectionPanel analysis failed", err);
          setError(err.message || "Failed to run analysis.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    runAnalysis();

    return () => {
      cancelled = true;
    };
  }, [hasWallet, lastTransaction, walletAddress]);

  const statusLabel = defenseTriggered ? "BLOCKED" : "ALLOWED";
  const statusClass = statusColors[statusLabel] || statusColors.ALLOWED;
  const riskBadge = riskLevel ? riskPills[riskLevel] : "text-slate-400 bg-slate-700/30 border border-slate-700";
  const protectionStatus = hasWallet ? "ACTIVE" : "INACTIVE";
  const protectionClass = hasWallet ? "text-safe" : "text-warning";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl bg-gradient-to-br from-[#111826] to-[#070910] border border-border shadow-glow p-6 space-y-4"
    >
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-accent">Protego</p>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-50 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" /> Wallet Protection
          </h2>
        </div>
        <div className={`text-xs font-semibold px-3 py-1 rounded-full ${statusClass}`}>
          Status: {statusLabel}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="rounded-xl bg-[#0B0F19] border border-border px-4 py-3 space-y-1">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Wallet</p>
          <p className="font-mono text-slate-50">{hasWallet ? truncate(walletAddress, 6) : "Not connected"}</p>
          <p className={`text-[11px] ${protectionClass}`}>Protection {protectionStatus}</p>
        </div>
        <div className="rounded-xl bg-[#0B0F19] border border-border px-4 py-3 space-y-1">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Last Transaction</p>
          <p className="text-slate-50 text-sm">{txnSummary}</p>
          {lastTransaction?.timestamp && (
            <p className="text-[11px] text-slate-500">
              {new Date(lastTransaction.timestamp).toLocaleString()}
            </p>
          )}
        </div>
        <div className="rounded-xl bg-[#0B0F19] border border-border px-4 py-3 space-y-2">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Analysis</p>
          {loading ? (
            <div className="flex items-center gap-2 text-slate-300">
              <Loader2 className="w-4 h-4 animate-spin" /> Analyzing transaction...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${riskBadge}`}>
                {riskLevel || "PENDING"}
              </span>
              {analysisTimestamp && (
                <span className="text-[11px] text-slate-500">
                  {new Date(analysisTimestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
          )}
          {riskScore !== null && !loading && (
            <p className="text-xl font-semibold text-slate-50">Risk Score: {riskScore}</p>
          )}
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="rounded-xl bg-[#0B0F19] border border-border px-4 py-3 space-y-2">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Defense Action</p>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
            {defenseTriggered ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            {defenseTriggered ? "Blocked by DefenseExecutor" : "Allowed"}
          </div>
          <p className="text-[11px] text-slate-400">
            {defenseTriggered
              ? "Latest DefenseExecutor call secured the wallet via GuardianVault."
              : "No automated defenses triggered for the last transaction."}
          </p>
        </div>
        <div className="rounded-xl bg-[#0B0F19] border border-border px-4 py-3 space-y-2">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Explanation</p>
          <p className="text-slate-200 text-sm leading-relaxed">{explanation}</p>
        </div>
      </div>
    </motion.section>
  );
}
