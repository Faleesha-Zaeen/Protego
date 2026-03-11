import { Layout } from "../components/layout/Layout";
import { GlassCard } from "../components/ui/GlassCard";
import { motion } from "framer-motion";
import { Activity, Shield, Cpu, Zap, Waves } from "lucide-react";

const threatFeed = [
  { source: "Darkstream", status: "Critical", vector: "Privileged RAT" },
  { source: "Telemetry", status: "High", vector: "Worm escalation" },
  { source: "OSINT", status: "Medium", vector: "Phishing mesh" },
];

export default function NeuroDashboard() {
  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard delay={0.05}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                Threat Feed
              </p>
              <h2 className="text-2xl font-semibold">Live Adversary Signals</h2>
            </div>
            <Activity className="w-8 h-8 text-cyan-300" />
          </div>
          <div className="space-y-3">
            {threatFeed.map((item) => (
              <div
                key={item.source}
                className="flex items-center justify-between py-3 px-4 rounded-2xl bg-white/5 border border-white/5"
              >
                <div>
                  <p className="text-sm text-white/80">{item.source}</p>
                  <p className="text-xs text-white/50">{item.vector}</p>
                </div>
                <span className="text-cyan-300 text-xs tracking-widest">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.15}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-200/70">
                Network Status
              </p>
              <h2 className="text-2xl font-semibold">Mesh Integrity</h2>
            </div>
            <Waves className="w-8 h-8 text-fuchsia-300" />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: "Secure tunnels", value: "128/128" },
              { label: "Latency", value: "24 ms" },
              { label: "Packet trust", value: "99.2%" },
              { label: "Quarantined", value: "12 nodes" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/10 to-transparent p-4"
              >
                <p className="text-white/60 text-xs">{stat.label}</p>
                <p className="text-xl font-semibold mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <GlassCard delay={0.25}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                AI Risk Model
              </p>
              <h2 className="text-2xl font-semibold">NeuroShield 4.2</h2>
            </div>
            <Cpu className="w-8 h-8 text-cyan-300" />
          </div>
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: "mirror" }}
            className="h-40 rounded-2xl border border-white/10 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20"
          >
            <p className="text-5xl font-light tracking-widest">0.87</p>
          </motion.div>
          <p className="text-sm text-white/60 mt-4">
            Adaptive anomaly score derived from 42 live models. Anything above 0.65
            auto-triggers defense playbooks.
          </p>
        </GlassCard>

        <GlassCard delay={0.3}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-200/70">
                Security Engine
              </p>
              <h2 className="text-2xl font-semibold">Defense Pipelines</h2>
            </div>
            <Shield className="w-8 h-8 text-fuchsia-300" />
          </div>
          <div className="space-y-4">
            {["Runtime isolation", "Wallet guardian", "Chain monitor"].map(
              (pipeline, idx) => (
                <div key={pipeline} className="text-sm">
                  <div className="flex justify-between text-white/70 mb-1">
                    <span>{pipeline}</span>
                    <span>{90 - idx * 8}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500"
                      style={{ width: `${90 - idx * 8}%` }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </GlassCard>

        <GlassCard delay={0.35}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                Defense Events
              </p>
              <h2 className="text-2xl font-semibold">Last 24H</h2>
            </div>
            <Zap className="w-8 h-8 text-cyan-300" />
          </div>
          <div className="space-y-4 text-sm">
            {[
              {
                label: "Wallet shields",
                meta: "Triggered by anomaly",
                value: "27",
              },
              {
                label: "Smart filters",
                meta: "Contract throttles",
                value: "14",
              },
              {
                label: "Vault lockdowns",
                meta: "GuardianVault",
                value: "6",
              },
            ].map((event) => (
              <div key={event.label} className="border border-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/80">{event.label}</span>
                  <span className="text-xl font-semibold text-cyan-300">
                    {event.value}
                  </span>
                </div>
                <p className="text-xs text-white/50">{event.meta}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
}
