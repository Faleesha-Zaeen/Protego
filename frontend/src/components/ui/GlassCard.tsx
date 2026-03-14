import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  delay?: number;
}

export function GlassCard({ children, delay = 0 }: GlassCardProps) {
  // Add a subtle light glow on hover only
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay }}
      className="rounded-3xl p-6 backdrop-blur-2xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-cyan-300/60 hover:shadow-[0_0_24px_0_rgba(56,189,248,0.13)]"
    >
      {children}
    </motion.div>
  );
}
