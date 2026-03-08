import TransactionAnalyzer from "../components/TransactionAnalyzer.jsx";

export default function AnalyzerPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-accent">
          Security Analyzer
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
          Transaction Analyzer
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl">
          Inspect a single transaction in detail. The form below sends the same
          payload to the backend risk engine and displays the live response.
        </p>
      </div>
      <TransactionAnalyzer />
    </div>
  );
}
