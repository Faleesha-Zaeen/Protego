
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[80vh] justify-between space-y-0">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-16 gap-6">
        <p className="text-xs uppercase tracking-[0.4em] text-accent mb-2">
          Web3 Security · Polkadot
        </p>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white/90 to-accent drop-shadow-glow">
          Protego — AI Security Firewall for Web3
        </h1>
        <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto">
          Protect your wallet before transactions are signed
        </p>
        <Link
          to="/dashboard"
          className="mt-6 px-7 py-4 rounded-2xl bg-primary/80 hover:bg-primary text-white text-base font-semibold shadow-glow transition-all duration-150"
        >
          Launch Protection Dashboard
        </Link>

        {/* Stat Cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <StatCard value="$3.8B" label="lost to Web3 attacks in 2023" />
          <StatCard value="105/105" label="tests passing on live testnet" />
          <StatCard value="1" label="verified cross-VM proof on Blockscout" />
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
        <FeatureCard
          title="Pre-Signature Protection"
          desc="Blocks threats before MetaMask opens"
        />
        <FeatureCard
          title="On-Chain PVM Enforcement"
          desc="Non-bypassable risk scoring in PolkaVM"
        />
        <FeatureCard
          title="XCM Threat Monitoring"
          desc="Real-time cross-chain attack detection"
        />
      </section>

      {/* Footer */}
      <footer className="w-full flex justify-center py-6 mt-8">
        <div className="rounded-xl bg-card/70 border border-border px-6 py-3 text-xs text-slate-300 shadow-glass backdrop-blur-md flex flex-wrap gap-3 items-center">
          Live on Polkadot Hub TestNet
          <span className="mx-2">·</span>
          Verified Cross-VM Proof
          <span className="mx-2">·</span>
          OpenZeppelin v5
        </div>
      </footer>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="rounded-2xl bg-card/70 border border-border shadow-glass p-6 flex flex-col items-center justify-center backdrop-blur-md">
      <span className="text-2xl md:text-3xl font-bold text-accent drop-shadow-glow">{value}</span>
      <span className="mt-2 text-xs md:text-sm text-slate-200 text-center font-medium">{label}</span>
    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div className="rounded-2xl bg-card/60 border border-border shadow-glass p-7 flex flex-col items-center text-center backdrop-blur-md">
      <span className="text-base md:text-lg font-semibold text-white mb-2">{title}</span>
      <span className="text-sm text-slate-300">{desc}</span>
    </div>
  );
}
