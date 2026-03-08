import PipelineDiagram from "../components/PipelineDiagram.jsx";

export default function ArchitecturePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-50">Architecture</h1>
        <p className="text-sm text-slate-300 max-w-xl">
          This page visualizes the on-chain security pipeline. It does not
          change any backend or contract behavior, it merely surfaces the
          components that are already running behind the scenes.
        </p>
        <p className="text-xs text-slate-400 max-w-xl italic">
          AegisDot is designed to integrate with PolkaVM precompiles, allowing
          high-performance risk analysis modules written in Rust to run inside
          the Polkadot runtime.
        </p>
      </div>
      <PipelineDiagram />
    </div>
  );
}
