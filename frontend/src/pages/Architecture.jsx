import PipelineDiagram from "../components/PipelineDiagram.jsx";

export default function ArchitecturePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-accent">
          System Flow
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
          Architecture
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl">
          This page visualizes the on-chain security pipeline. It does not
          change any backend or contract behavior, it merely surfaces the
          components that are already running behind the scenes.
        </p>
        <p className="text-xs text-slate-400 max-w-2xl italic">
          AegisDot is designed to integrate with PolkaVM precompiles, allowing
          high-performance risk analysis modules written in Rust to run inside
          the Polkadot runtime.
        </p>
      </div>
      <PipelineDiagram />
    </div>
  );
}
