import { useState, useEffect } from "react";
import DefenseEventsFeed from "./DefenseEventsFeed.jsx";
import XcmThreatAlerts from "./XcmThreatAlerts.jsx";
import AttackSimulator from "./AttackSimulator.jsx";
import WalletProtectionPanel from "./WalletProtectionPanel.jsx";
import ProtectionStatus from "./ProtectionStatus.jsx";

const backendBaseUrl =
  import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:5000";
const LAST_TRANSACTION_STORAGE_KEY = "aegisdot:last-transaction";
const LAST_TRANSACTION_EVENT = "aegisdot:last-transaction";
const ANALYSIS_COUNT_KEY = "aegisdot:analysis-count";

const getTodayKey = () => new Date().toISOString().slice(0, 10);

function readLastTransactionFromStorage() {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage?.getItem(LAST_TRANSACTION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Failed to read last transaction", err);
    return null;
  }
}

function readAnalysisCountFromStorage() {
  if (typeof window === "undefined") {
    return 0;
  }
  try {
    const raw = window.localStorage?.getItem(ANALYSIS_COUNT_KEY);
    if (!raw) {
      return 0;
    }
    const parsed = JSON.parse(raw);
    return parsed?.date === getTodayKey() ? Number(parsed.count) || 0 : 0;
  } catch (err) {
    console.error("Failed to read analysis count", err);
    return 0;
  }
}

function writeAnalysisCountToStorage(count) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage?.setItem(
      ANALYSIS_COUNT_KEY,
      JSON.stringify({ date: getTodayKey(), count })
    );
  } catch (err) {
    console.error("Failed to persist analysis count", err);
  }
}

function incrementAnalysisCountInStorage() {
  if (typeof window === "undefined") {
    return 0;
  }
  const nextCount = readAnalysisCountFromStorage() + 1;
  writeAnalysisCountToStorage(nextCount);
  return nextCount;
}

function formatLog(message) {
  const uuid =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

  return {
    id: uuid,
    time: new Date().toLocaleTimeString(),
    message,
  };
}

export default function Dashboard() {
  const [account, setAccount] = useState("");
  const [defenseEvents, setDefenseEvents] = useState([]);
  const [lastTransaction, setLastTransaction] = useState(() => readLastTransactionFromStorage());
  const [simLogs, setSimLogs] = useState([]);
  const [simResult, setSimResult] = useState(null);
  const [analysisCount, setAnalysisCount] = useState(() => readAnalysisCountFromStorage());

  useEffect(() => {
    let isMounted = true;

    async function fetchDefenseEvents() {
      try {
        const res = await fetch(`${backendBaseUrl}/api/defense-events`);
        if (!res.ok) {
          throw new Error(`Failed to fetch defense events: ${res.status}`);
        }
        const data = await res.json();
        if (isMounted && Array.isArray(data?.events)) {
          setDefenseEvents(data.events);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchDefenseEvents();
    const interval = setInterval(fetchDefenseEvents, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncFromStorage = () => {
      setLastTransaction(readLastTransactionFromStorage());
      setAnalysisCount(readAnalysisCountFromStorage());
    };

    const handleStorage = (event) => {
      if (
        !event.key ||
        event.key === LAST_TRANSACTION_STORAGE_KEY ||
        event.key === ANALYSIS_COUNT_KEY
      ) {
        syncFromStorage();
      }
    };

    const handleCustomEvent = (event) => {
      if (event?.detail) {
        setLastTransaction(event.detail);
        setAnalysisCount(readAnalysisCountFromStorage());
      }
    };

    syncFromStorage();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(LAST_TRANSACTION_EVENT, handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(LAST_TRANSACTION_EVENT, handleCustomEvent);
    };
  }, []);

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

  const persistLastTransaction = (tx, result) => {
    if (!tx || !result || typeof window === "undefined") {
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
      console.error("Failed to persist transaction", err);
    }

    const nextCount = incrementAnalysisCountInStorage();
    setAnalysisCount(nextCount);

    try {
      window.dispatchEvent(new CustomEvent(LAST_TRANSACTION_EVENT, { detail: payload }));
    } catch (eventErr) {
      console.error("Failed to dispatch transaction event", eventErr);
    }
  };

  const pushSimLog = (message) => {
    setSimLogs((prev) => [formatLog(message), ...prev].slice(0, 20));
  };

  const handleSimResult = (data) => {
    setSimResult({
      riskScore: data.riskScore,
      riskLevel: data.riskLevel,
      explanation: data.explanation,
      defenseTriggered: Boolean(data.defenseTriggered),
    });

    if (data?.transaction) {
      const txRecord = {
        walletAddress: data.transaction.walletAddress,
        contractAddress: data.transaction.contractAddress,
        method: data.transaction.method,
        value: data.transaction.value,
        unlimitedApproval: data.transaction.unlimitedApproval,
        timestamp: Date.now(),
      };
      setLastTransaction(txRecord);
      persistLastTransaction(txRecord, data);
    }
  };

  const confirmedBlocks = defenseEvents.filter(
    (event) => event?.status?.toLowerCase() === "confirmed"
  ).length;

  return (
    <div className="space-y-6">
      <ProtectionStatus
        walletConnected={Boolean(account)}
        analysisCount={analysisCount}
        threatsBlocked={confirmedBlocks}
        defensesTriggered={defenseEvents.length}
      />

      <WalletProtectionPanel walletAddress={account} lastTransaction={lastTransaction} />

      <DefenseEventsFeed events={defenseEvents} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-xl bg-card border border-border shadow-lg p-6 space-y-4">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-50">Attack Simulator</h2>
              <p className="text-xs text-slate-400">
                Launch a malicious approval and watch Protego respond.
              </p>
            </div>
            <button
              onClick={connectWallet}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold"
            >
              {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
            </button>
          </header>

          <AttackSimulator
            onResult={handleSimResult}
            pushLog={pushSimLog}
            walletAddress={account || undefined}
            contractAddress={undefined}
            value={undefined}
          />

          {simResult && (
            <div className="rounded-xl bg-[#0B0F19] border border-border px-4 py-3 text-sm text-slate-200 space-y-1">
              <p>
                <span className="text-slate-400">Risk Score:</span> {simResult.riskScore}
              </p>
              <p>
                <span className="text-slate-400">Risk Level:</span> {simResult.riskLevel}
              </p>
              <p>
                <span className="text-slate-400">Defense:</span> {simResult.defenseTriggered ? "BLOCKED" : "ALLOWED"}
              </p>
              <p className="text-xs text-slate-400">{simResult.explanation}</p>
            </div>
          )}

          <div className="rounded-xl bg-[#0B0F19] border border-border px-4 py-3 h-36 overflow-y-auto text-[11px] text-slate-300 space-y-1">
            {simLogs.length === 0 ? (
              <p className="text-slate-500">No simulation activity yet.</p>
            ) : (
              simLogs.map((log) => (
                <div key={log.id} className="flex gap-2">
                  <span className="text-slate-500">[{log.time}]</span>
                  <span>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <XcmThreatAlerts />
      </div>
    </div>
  );
}
