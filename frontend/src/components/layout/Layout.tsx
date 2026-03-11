import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 neon-grid" aria-hidden="true" />
      <Sidebar />
      <main className="pl-[90px] md:pl-[280px] pr-8 py-10 relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">
            NeuroCred Interface
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-500 text-transparent bg-clip-text mt-3">
            Cyber Defense Command Hub
          </h1>
        </motion.header>
        {children}
      </main>
    </div>
  );
}
