import { motion } from "framer-motion";

const levelColors = {
  LOW: "from-safe to-emerald-500",
  MEDIUM: "from-yellow-400 to-amber-500",
  HIGH: "from-danger to-rose-600",
};

export default function RiskGauge({ score, level }) {
  const safeScore = typeof score === "number" ? score : 0;
  const clamped = Math.max(0, Math.min(100, safeScore));
  const barWidth = `${clamped}%`;
  const colorClass = levelColors[level] || levelColors.LOW;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>Risk Score</span>
        <span className="font-semibold">
          {safeScore ?? "-"} {level && `(${level})`}
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden shadow-inner">
        <motion.div
          className={`h-full bg-gradient-to-r ${colorClass} shadow-glow`}
          initial={{ width: 0 }}
          animate={{ width: barWidth }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>
      <p className="text-xs text-slate-400">
        LOW → safe, MEDIUM → caution, HIGH → likely malicious.
      </p>
    </div>
  );
}
