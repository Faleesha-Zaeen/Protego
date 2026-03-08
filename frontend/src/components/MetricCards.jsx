import { ShieldCheck, Activity, Users, AlertTriangle } from "lucide-react";

const cards = [
  {
    title: "Risk Events Today",
    value: "24",
    icon: Activity,
    color: "from-sky-400/70 to-sky-500/80",
  },
  {
    title: "Defense Status",
    value: "Active",
    icon: ShieldCheck,
    color: "from-emerald-400/70 to-emerald-500/80",
  },
  {
    title: "Monitored Wallets",
    value: "8",
    icon: Users,
    color: "from-violet-400/70 to-violet-500/80",
  },
  {
    title: "Threats Detected",
    value: "5",
    icon: AlertTriangle,
    color: "from-amber-400/70 to-orange-500/80",
  },
];

export default function MetricCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(({ title, value, icon: Icon, color }) => (
        <div
          key={title}
          className="rounded-2xl bg-slate-900/80 border border-slate-700/70 px-3 py-3 flex flex-col gap-2 text-xs shadow-glow/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{title}</span>
            <div
              className={`h-7 w-7 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-slate-950`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-semibold text-slate-50">{value}</div>
        </div>
      ))}
    </div>
  );
}
