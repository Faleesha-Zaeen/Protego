import { NavLink } from "react-router-dom";
import { Shield } from "lucide-react";

const baseLink =
  "text-sm px-3 py-1.5 rounded-xl transition-colors border border-transparent";

export default function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-slate-950/80 backdrop-blur border-b border-slate-800/70">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-highlight to-sky-500 text-slate-950 shadow-glow">
            <Shield className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-sm">AegisDot</div>
            <div className="text-[10px] text-slate-400">
              On-chain AI Security Layer
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-slate-300">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${baseLink} ${
                isActive
                  ? "bg-slate-800 text-highlight border-slate-600"
                  : "hover:bg-slate-900/80"
              }`
            }
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${baseLink} ${
                isActive
                  ? "bg-slate-800 text-highlight border-slate-600"
                  : "hover:bg-slate-900/80"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/analyzer"
            className={({ isActive }) =>
              `${baseLink} ${
                isActive
                  ? "bg-slate-800 text-highlight border-slate-600"
                  : "hover:bg-slate-900/80"
              }`
            }
          >
            Analyzer
          </NavLink>
          <NavLink
            to="/architecture"
            className={({ isActive }) =>
              `${baseLink} ${
                isActive
                  ? "bg-slate-800 text-highlight border-slate-600"
                  : "hover:bg-slate-900/80"
              }`
            }
          >
            Architecture
          </NavLink>
        </div>

      </nav>
    </header>
  );
}
