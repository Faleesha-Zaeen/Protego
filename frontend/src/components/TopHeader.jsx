import { NavLink } from "react-router-dom";
import { Home, LayoutDashboard, Search } from "lucide-react";
import WalletConnect from "./WalletConnect.jsx";

const mobileLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analyzer", label: "Analyzer", icon: Search },
];

export default function TopHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-[#0B0F19]/90 backdrop-blur">
      <div className="flex flex-col gap-3 px-5 py-4 lg:px-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Project</p>
            <h1 className="text-lg font-semibold text-slate-50">Protego</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Removed Polkadot Hub Testnet badge */}
            <WalletConnect />
          </div>
        </div>

        <nav className="flex md:hidden gap-2">
          {mobileLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-xs border transition-colors ${
                  isActive
                    ? "bg-card border-primary/60 text-slate-50"
                    : "border-border/60 text-slate-400"
                }`
              }
            >
              <link.icon className="w-3.5 h-3.5" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
