import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, LayoutDashboard, Search, ShieldCheck } from "lucide-react";
import WalletConnect from "./WalletConnect.jsx";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analyzer", label: "Analyzer", icon: Search },
  { to: "/proof", label: "Tech Proof", icon: ShieldCheck },
];

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.aside
      animate={{ width: isExpanded ? 256 : 72 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="hidden md:flex md:flex-col fixed left-0 top-0 h-screen bg-card border-r border-border/80 pt-6 pb-4 px-3 gap-6 z-50"
    >
      <div className="flex items-center gap-3 px-2">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-slate-950 shadow-glow">
          <span className="text-sm font-bold">AD</span>
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-semibold text-slate-50">Protego</p>
              <p className="text-[11px] text-slate-400">Web3 Security Console</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors border ${
                isActive
                  ? "bg-[#0B0F19] border-primary/60 text-slate-50"
                  : "border-transparent text-slate-400 hover:text-slate-100 hover:bg-[#0B0F19]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-primary" />
                )}
                <link.icon className="w-4 h-4" />
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="whitespace-nowrap"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="rounded-xl border border-border/80 bg-[#0B0F19] p-2">
          <WalletConnect isExpanded={isExpanded} />
        </div>
      </div>
    </motion.aside>
  );
}
