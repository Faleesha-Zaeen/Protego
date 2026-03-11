import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  LayoutDashboard,
  Activity,
  ShieldCheck,
  Cpu,
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Activity, label: "Threat Feed", path: "/threat-feed" },
  { icon: ShieldCheck, label: "Defense", path: "/defense" },
  { icon: Cpu, label: "AI Lab", path: "/ai" },
];

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.aside
      animate={{ width: isExpanded ? 256 : 72 }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="fixed left-0 top-0 h-screen flex flex-col border-r border-white/5 bg-slate-950/60 backdrop-blur-2xl"
    >
      <div className="px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 shadow-glow" />
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="text-xs tracking-[0.4em] text-white/70"
              >
                PROTEGO
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-200 transition ${
                  isActive
                    ? "bg-white/10 text-cyan-300 shadow-glow"
                    : "hover:bg-white/5"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>
    </motion.aside>
  );
}
