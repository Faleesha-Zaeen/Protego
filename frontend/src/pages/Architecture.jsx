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
      </div>
      <PipelineDiagram />
    </div>
  );
}
