function cleanExplanation(text) {
  if (!text) return text;
  return text
    .replace(/AI model marked this transaction as \w+ risk\.,?\s*/gi, '')
    .replace(' and Contract', ' Contract')
    .replace('Contract is unknown.', 'Contract is unverified and unknown.')
    .replace('Contract address is on the blacklist.', 'Contract address is blacklisted.')
    .replace('blacklisted..', 'blacklisted.')
    .trim();
}
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, ShieldCheck } from "lucide-react";
import {
  BrowserProvider,
  Contract,
  Interface,
  MaxUint256,
  formatUnits,
  parseUnits,
} from "ethers";
import RiskGauge from "./RiskGauge.jsx";
import ActivityLog from "./ActivityLog.jsx";
import AttackSimulator from "./AttackSimulator.jsx";
import { analyzeTransaction } from "../api/backend";

let logId = 0;
const LAST_TRANSACTION_STORAGE_KEY = "aegisdot:last-transaction";
const LAST_TRANSACTION_EVENT = "aegisdot:last-transaction";
const ANALYSIS_COUNT_KEY = "aegisdot:analysis-count";

function incrementAnalysisCountStorage() {
  if (typeof window === "undefined") {
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  let nextCount = 1;
  try {
    const raw = window.localStorage?.getItem(ANALYSIS_COUNT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.date === today) {
        nextCount = (Number(parsed.count) || 0) + 1;
      }
    }
    window.localStorage?.setItem(
      ANALYSIS_COUNT_KEY,
      JSON.stringify({ date: today, count: nextCount })
    );
  } catch (err) {
    console.error("Failed to update analysis count", err);
  }
}

function persistLastTransaction(tx, result) {
  if (typeof window === "undefined" || !tx || !result) {
    return;
  }

  const payload = {
    walletAddress: tx.walletAddress,
    contractAddress: tx.contractAddress,
    method: tx.method,
    value: Number(tx.value) || 0,
    unlimitedApproval: tx.unlimitedApproval,
    riskScore: result.riskScore ?? null,
    riskLevel: result.riskLevel ?? null,
    explanation: result.explanation ?? "",
    defenseTriggered: Boolean(result.defenseTriggered || result.riskLevel === "HIGH"),
    timestamp: Date.now(),
  };

  try {
    window.localStorage?.setItem(LAST_TRANSACTION_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error("Failed to persist last transaction", err);
  }

  incrementAnalysisCountStorage();

  try {
    window.dispatchEvent(new CustomEvent(LAST_TRANSACTION_EVENT, { detail: payload }));
  } catch (err) {
    console.error("Failed to dispatch last transaction event", err);
  }
}

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
  const [scanLoading, setScanLoading] = useState(false);
  const [logEntries, setLogEntries] = useState([]);
  const [modalConfig, setModalConfig] = useState(null);
  const attackPresets = useMemo(
    () => [
      {
        name: "Unlimited Approval Attack",
        walletAddress: "0xa111111111111111111111111111111111111111",
        contractAddress: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        value: "0",
        unlimitedApproval: true,
        method: "approve",
      },
      {
        name: "Phishing Contract",
        walletAddress: "0xb222222222222222222222222222222222222222",
        contractAddress: "0xbaad00baad00baad00baad00baad00baad00baad",
        value: "150",
        unlimitedApproval: false,
        method: "approve",
      },
      {
        name: "Suspicious Transfer",
        walletAddress: "0xc333333333333333333333333333333333333333",
        contractAddress: "0xd444444444444444444444444444444444444444",
        value: "2500",
        unlimitedApproval: false,
        method: "transfer",
      },
      {
        name: "XCM Cross-chain Transfer",
        walletAddress: "0xe555555555555555555555555555555555555555",
        contractAddress: "0xf666666666666666666666666666666666666666",
        value: "800",
        unlimitedApproval: false,
        method: "xcmTransfer",
      },
    ],
    []
  );

  const erc20Interface = useMemo(
    () =>
      new Interface([
        "function approve(address spender, uint256 amount)",
        "function transfer(address to, uint256 amount)",
      ]),
    []
  );

  const decodedTx = useMemo(() => {
    try {
      const sanitizedSpender = contractAddress || "0x0000000000000000000000000000000000000000";
      const isUnlimited = !value || Number(value) === 0;
      const callData = erc20Interface.encodeFunctionData("approve", [
        sanitizedSpender,
        isUnlimited ? MaxUint256 : parseUnits(value, 18),
      ]);
      const [spender, rawAmount] = erc20Interface.decodeFunctionData(
        "approve",
        callData
      );
      const amountLabel = isUnlimited
        ? "Unlimited"
        : `${formatUnits(rawAmount, 18)} PAS`;
      return {
        signature: "approve(address spender, uint256 amount)",
        functionName: "approve",
        spender,
        amountLabel,
        tokenSymbol: "PAS",
        isUnlimited,
        rawAmount,
      };
    } catch (error) {
      return {
        signature: "approve(address spender, uint256 amount)",
        functionName: "approve",
        spender: contractAddress,
        amountLabel: value && Number(value) > 0 ? `${value} PAS` : "Unlimited",
        tokenSymbol: "PAS",
        isUnlimited: !value || Number(value) === 0,
      };
    }
  }, [contractAddress, value, erc20Interface]);

  const securityFlags = useMemo(() => {
    const flags = [];
    if (decodedTx.isUnlimited) flags.push("Unlimited Approval");
    if (!contractAddress || contractAddress === "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef") {
      flags.push("Unknown Contract");
    }
    if (Number(value) >= 1000) {
      flags.push("Large Transfer");
    }
    return flags;
  }, [decodedTx.isUnlimited, contractAddress, value]);

  function pushLog(message) {
    const time = new Date().toLocaleTimeString();
    logId += 1;
    setLogEntries((prev) => [{ id: logId, time, message }, ...prev].slice(0, 50));
  }

  async function handleAnalyze(overrides = {}) {
    setLoading(true);
    setDefenseTriggered(false);
    const effectiveWallet = overrides.walletAddress ?? walletAddress;
    const effectiveContract = overrides.contractAddress ?? contractAddress;
    const effectiveValue = overrides.value ?? value;
    const effectiveMethod = overrides.method ?? "approve";
    const effectiveUnlimited = overrides.unlimitedApproval ?? decodedTx.isUnlimited;
    pushLog(
      `Analyzing transaction${
        overrides.presetName ? ` (${overrides.presetName})` : ""
      }...`
    );
    try {
      const payload = {
        walletAddress: effectiveWallet,
        contractAddress: effectiveContract,
        method: effectiveMethod,
        value: Number(effectiveValue) || 0,
        unlimitedApproval: effectiveUnlimited,
      };
      const data = await analyzeTransaction(payload);
      setRiskScore(data.riskScore);
      setRiskLevel(data.riskLevel);
      setExplanation(data.explanation);
      persistLastTransaction(payload, data);
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

  function closeModal() {
    setModalConfig(null);
  }

  async function sendApproveTransaction({ signer, spender, amount }) {
    const approveAbi = ["function approve(address spender, uint256 amount)"];
    const tokenContract = new Contract(contractAddress, approveAbi, signer);
    const tx = await tokenContract.approve(spender, amount);
    pushLog("MetaMask transaction submitted. Waiting for confirmation...");
    const receipt = await tx.wait();
    if (receipt?.status === 1n || receipt?.status === 1) {
      const txHash = receipt?.hash || tx?.hash;
      pushLog(
        `Approval confirmed on-chain. <a href="https://blockscout-testnet.polkadot.io/tx/${txHash}" target="_blank">View on Blockscout ↗</a>`
      );
    } else {
      pushLog("Approval transaction failed or was reverted.");
    }
  }

  async function handleScanBeforeSigning() {
    if (!window?.ethereum) {
      pushLog("MetaMask not detected. Please install or enable MetaMask.");
      return;
    }

    setScanLoading(true);
    setDefenseTriggered(false);
    pushLog("Scanning transaction before signing...");

    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const connectedAddress = await signer.getAddress();
      setWalletAddress(connectedAddress);

      const payload = {
        walletAddress: connectedAddress,
        contractAddress,
        method: "approve",
        value: Number(value) || 0,
        unlimitedApproval: decodedTx.isUnlimited,
      };

      const data = await analyzeTransaction(payload);
      setRiskScore(data.riskScore);
      setRiskLevel(data.riskLevel);
      setExplanation(data.explanation);
      persistLastTransaction(payload, data);

      const amount = decodedTx.isUnlimited
        ? MaxUint256
        : parseUnits(value || "0", 18);

      if (data.riskScore > 70) {
        setModalConfig({
          variant: "blocked",
          title: "⚠️ PROTEGO BLOCKED THIS TRANSACTION",
          riskScore: data.riskScore,
          explanation: data.explanation,
          onProceed: async () => {
            closeModal();
            await sendApproveTransaction({
              signer,
              spender: contractAddress,
              amount,
            });
          },
        });
        pushLog("High risk detected. Awaiting user confirmation.");
        return;
      }

      setModalConfig({
        variant: "safe",
        title: "✅ PROTEGO: Transaction Appears Safe",
        riskScore: data.riskScore,
        explanation: data.explanation,
        onProceed: async () => {
          closeModal();
        },
      });
      await sendApproveTransaction({
        signer,
        spender: contractAddress,
        amount,
      });
    } catch (err) {
      console.error(err);
      pushLog("Scan failed: " + (err?.message || "Unknown error"));
    } finally {
      setScanLoading(false);
    }
  }

  function handleSimResult(data) {
    setRiskScore(data.riskScore);
    setRiskLevel(data.riskLevel);
    setExplanation(data.explanation);
    setDefenseTriggered(Boolean(data.defenseTriggered));
    if (data?.transaction) {
      persistLastTransaction(
        {
          walletAddress: data.transaction.walletAddress,
          contractAddress: data.transaction.contractAddress,
          method: data.transaction.method,
          value: data.transaction.value,
          unlimitedApproval: data.transaction.unlimitedApproval,
        },
        data
      );
    }
  }

  function runAttackPreset(preset) {
    setWalletAddress(preset.walletAddress);
    setContractAddress(preset.contractAddress);
    setValue(preset.value);
    handleAnalyze({ ...preset, presetName: preset.name });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 items-start">
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-xl shadow-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" />
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
                className="w-full rounded-xl bg-[#0B0F19] border border-border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/70"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-slate-400 text-xs">Contract Address</label>
              <input
                className="w-full rounded-xl bg-[#0B0F19] border border-border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/70"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mt-2">
            <div className="space-y-1 max-w-xs text-sm">
              <label className="text-slate-400 text-xs">Transaction Value (PAS)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-xl bg-[#0B0F19] border border-border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/70"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                Simulation mode uses a malicious unlimited approval to demonstrate defense.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAnalyze()}
                disabled={loading}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold shadow-glow disabled:opacity-60"
              >
                {loading ? "Analyzing..." : "Analyze Transaction"}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleScanBeforeSigning}
                disabled={scanLoading}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 text-emerald-200 text-sm font-semibold shadow-glow disabled:opacity-60"
              >
                {scanLoading ? "Scanning..." : "Scan Before Signing"}
              </motion.button>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <RiskGauge score={riskScore} level={riskLevel} />
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-100 text-sm">
              <AlertTriangle className="w-4 h-4 text-danger" />
              <span>Explanation</span>
            </div>
            <p className="text-slate-300 text-xs md:text-sm min-h-[3rem]">
              {cleanExplanation(explanation) ||
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl shadow-lg p-6 space-y-3">
            <div className="flex items-center gap-2 text-slate-100">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold">Decoded Transaction</h3>
            </div>
            <div className="text-xs text-slate-300 space-y-2">
              <div>
                <p className="text-slate-400 uppercase tracking-wide text-[10px]">
                  Function
                </p>
                <p>{decodedTx.functionName}</p>
                <p className="text-[11px] text-slate-500">
                  {decodedTx.signature}
                </p>
              </div>
              <div>
                <p className="text-slate-400 uppercase tracking-wide text-[10px]">
                  Spender
                </p>
                <p className="font-mono text-[11px] break-all">
                  {decodedTx.spender}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-slate-400 uppercase tracking-wide text-[10px]">
                    Amount
                  </p>
                  <p>{decodedTx.amountLabel}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase tracking-wide text-[10px]">
                    Token
                  </p>
                  <p>{decodedTx.tokenSymbol}</p>
                </div>
              </div>
            </div>
          </div>

            <div className="bg-card border border-border rounded-xl shadow-lg p-6 space-y-3">
            <div className="flex items-center gap-2 text-slate-100">
              <AlertTriangle className="w-4 h-4 text-danger" />
              <h3 className="text-sm font-semibold">Security Flags</h3>
            </div>
            {securityFlags.length > 0 ? (
              <ul className="text-xs text-slate-200 space-y-2">
                {securityFlags.map((flag) => (
                  <li
                    key={flag}
                    className="flex items-center gap-2 rounded-xl bg-[#0B0F19] border border-border px-3 py-2"
                  >
                    <span className="text-danger">⚠</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">No security warnings detected.</p>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-lg p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-100">Attack Simulation</h3>
            <p className="text-xs text-slate-400">
              Load preset threat patterns and auto-run the analyzer for live demos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attackPresets.map((preset) => (
              <motion.button
                key={preset.name}
                whileTap={{ scale: 0.98 }}
                onClick={() => runAttackPreset(preset)}
                disabled={loading}
                className="rounded-xl border border-border bg-[#0B0F19] px-4 py-3 text-left text-sm text-slate-100 hover:border-primary/70 hover:bg-card/80 transition-colors disabled:opacity-60"
              >
                <p className="font-semibold">{preset.name}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Wallet {preset.walletAddress.slice(0, 6)}...{preset.walletAddress.slice(-4)}
                </p>
                <p className="text-[11px] text-slate-400">
                  Value: {preset.value === "0" ? "Unlimited" : `${preset.value} PAS`}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <ActivityLog entries={logEntries} />

      {modalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0B0F19] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3
                className={`text-lg font-semibold ${
                  modalConfig.variant === "blocked"
                    ? "text-red-300"
                    : "text-emerald-200"
                }`}
              >
                {modalConfig.title}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <p className="text-slate-300">
                Risk Score: {modalConfig.riskScore}/100
              </p>
              <p className="text-slate-300">Reason: {cleanExplanation(modalConfig.explanation)}</p>
              {modalConfig.variant === "blocked" ? (
                <p className="text-slate-400">
                  This transaction was flagged as HIGH RISK by Protego's AI model
                  and on-chain PVM risk engine.
                </p>
              ) : (
                <p className="text-slate-400">
                  Proceed to sign in MetaMask when you're ready.
                </p>
              )}
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {modalConfig.variant === "blocked" ? (
                <>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100"
                  >
                    Block (Recommended)
                  </button>
                  <button
                    type="button"
                    onClick={modalConfig.onProceed}
                    className="flex-1 rounded-xl bg-red-500/80 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Proceed Anyway
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl bg-emerald-500/80 px-4 py-2 text-sm font-semibold text-white"
                >
                  Got it
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
