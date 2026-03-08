import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cpu, ShieldCheck, AlertTriangle, Shield, Users } from "lucide-react";
import NetworkStatus from "./NetworkStatus.jsx";
import RuntimeStatus from "./RuntimeStatus.jsx";
import DefenseEventsFeed from "./DefenseEventsFeed.jsx";
import XcmMonitor from "./XcmMonitor.jsx";
import XcmThreatAlerts from "./XcmThreatAlerts.jsx";
import RiskEngineStatus from "./RiskEngineStatus.jsx";
import AIModelStatus from "./AIModelStatus.jsx";

export default function Dashboard() {
  const [account, setAccount] = useState("");
  const [defenseEvents, setDefenseEvents] = useState([]);

  const backendBaseUrl =
    import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:5000";

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
  }, [backendBaseUrl]);

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

  const topStats = [
    {
      label: "Threats Today",
      value: securityMetrics.threatsToday,
      icon: AlertTriangle,
      tone: "text-danger",
    },
    {
      label: "Defenses Triggered",
      value: securityMetrics.defensesTriggered,
      icon: Shield,
      tone: "text-safe",
    },
    {
      label: "Wallets Monitored",
      value: securityMetrics.monitoredWallets,
      icon: Users,
      tone: "text-accent",
    },
    {
      label: "System Status",
      value: securityMetrics.systemStatus,
      icon: Cpu,
      tone: "text-primary",
    },
  ];

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
        className="rounded-xl bg-card border border-border shadow-lg px-6 py-5 flex flex-col lg:flex-row lg:items-center gap-6"
      >
        <div className="space-y-3 flex-1">
          <div className="inline-flex items-center gap-2 text-[11px] px-3 py-1 rounded-full bg-[#0B0F19] border border-border text-accent">
            <Cpu className="w-3 h-3" />
            <span>On-chain AI Security Layer</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Security Operations Dashboard
          </h1>
          <p className="text-slate-300 max-w-xl text-sm">
            Monitor live risk signals, track automated defenses, and explore how
            AegisDot protects wallets from malicious approvals.
          </p>
        </div>
        <div className="lg:w-80 flex flex-col gap-3 text-xs">
          <button
            onClick={connectWallet}
            className="bg-primary text-white px-4 py-2 rounded-xl font-semibold"
          >
            {account
              ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
              : "Connect Wallet"}
          </button>
          <div className="rounded-xl bg-[#0B0F19] border border-border px-4 py-3 space-y-1">
            <div className="flex items-center gap-2 text-accent">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-semibold">Defense Pipeline</span>
            </div>
            <p className="text-slate-300 mt-1">
              Risk Engine → RiskRegistry → DefenseExecutor → GuardianVault.
            </p>
            <div className="mt-2 text-[11px] text-slate-400">
              <p>Network: Polkadot Hub Testnet</p>
              <p>Native Asset: PAS</p>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {topStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-card border border-border shadow-lg p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                {stat.label}
              </p>
              <p className="text-2xl font-semibold text-slate-50 font-mono">
                {stat.value}
              </p>
            </div>
            <div className={`h-10 w-10 rounded-xl bg-[#0B0F19] border border-border flex items-center justify-center ${stat.tone}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl bg-card border border-border shadow-lg p-6 space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-50">Threat Feed</h2>
              <p className="text-xs text-slate-400">
                Latest anomalies detected by the risk engine.
              </p>
            </div>
            <span className="text-[11px] text-slate-400">Updated ~15s ago</span>
          </header>
          <div className="space-y-3">
            {threatFeed.map((threat) => (
              <div
                key={`${threat.wallet}-${threat.contract}`}
                className="rounded-xl border border-border bg-[#0B0F19] px-4 py-3"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">{threat.note}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-semibold ${
                      threat.risk === "HIGH"
                        ? "text-danger bg-danger/10 animate-pulse"
                        : threat.risk === "MEDIUM"
                        ? "text-warning bg-warning/10"
                        : "text-safe bg-safe/10"
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

        <DefenseEventsFeed events={defenseEvents} />

        <NetworkStatus />

        <section className="rounded-xl bg-card border border-border shadow-lg p-6 space-y-4">
          <header>
            <h2 className="text-lg font-semibold text-slate-50">Security Status</h2>
            <p className="text-xs text-slate-400">
              Overall posture of the monitoring system.
            </p>
          </header>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-xl bg-[#0B0F19] border border-border px-3 py-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Threats Today</p>
              <p className="text-2xl font-semibold text-slate-50 font-mono">
                {securityMetrics.threatsToday}
              </p>
            </div>
            <div className="rounded-xl bg-[#0B0F19] border border-border px-3 py-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Defenses</p>
              <p className="text-2xl font-semibold text-slate-50 font-mono">
                {securityMetrics.defensesTriggered}
              </p>
            </div>
            <div className="rounded-xl bg-[#0B0F19] border border-border px-3 py-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">Wallets</p>
              <p className="text-2xl font-semibold text-slate-50 font-mono">
                {securityMetrics.monitoredWallets}
              </p>
            </div>
            <div className="rounded-xl bg-[#0B0F19] border border-border px-3 py-4">
              <p className="text-xs text-slate-400 uppercase tracking-wide">System</p>
              <p className="text-xl font-semibold text-safe">{securityMetrics.systemStatus}</p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        <RuntimeStatus />
        <XcmMonitor />
        <XcmThreatAlerts />
        <RiskEngineStatus />
        <AIModelStatus />
      </div>
    </div>
  );
}
