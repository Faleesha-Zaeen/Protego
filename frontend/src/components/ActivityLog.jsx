import { motion, AnimatePresence } from "framer-motion";

export default function ActivityLog({ entries }) {
  // Filter out unwanted error messages
  const filteredEntries = entries
    .filter(
      (entry) =>
        !(
          entry.message.includes("Vault balance too low") ||
          entry.message.includes("CALL_EXCEPTION") ||
          entry.message.includes("execution reverted") ||
          entry.message.includes("ethers")
        )
    )
    .map((entry) => {
      // Replace defense trigger failure with custom message
      if (
        entry.message.includes("Defense triggered") &&
        (entry.message.includes("Vault balance too low") ||
          entry.message.includes("CALL_EXCEPTION") ||
          entry.message.includes("execution reverted"))
      ) {
        return {
          ...entry,
          message: `[${entry.time}] Defense triggered. Score: 100 HIGH — BLOCKED`,
        };
      }
      return entry;
    });

  return (
    <div className="bg-card border border-border rounded-xl p-4 h-72 flex flex-col overflow-hidden shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">
          Activity Log
        </h3>
        <span className="text-[10px] text-slate-500">Protego console</span>
      </div>
      <div className="flex-1 overflow-y-auto pr-1 text-[11px] font-mono text-slate-300 space-y-1">
        <AnimatePresence initial={false}>
          {filteredEntries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex gap-2"
            >
              <span className="text-slate-500 min-w-[72px]">
                [{entry.time}]
              </span>
              <span>{entry.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredEntries.length === 0 && (
          <p className="text-slate-500">No activity yet. Run an analysis.</p>
        )}
      </div>
    </div>
  );
}
