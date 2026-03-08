import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-8 items-center">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.4em] text-accent">
            Web3 Security · Polkadot
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
            AegisDot – On-chain AI Security Layer
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-xl">
            Analyze transactions and detect malicious smart contract interactions
            before users sign. AegisDot plugs into your dApp as a pre-signature
            security firewall.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold shadow-glow"
            >
              Open Security Dashboard
            </Link>
            <Link
              to="/architecture"
              className="px-5 py-3 rounded-xl border border-border text-sm text-slate-200 hover:bg-card/70"
            >
              View System Architecture
            </Link>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-slate-300">
            <span className="px-3 py-1 rounded-full bg-card border border-border">
              Real-time risk scoring
            </span>
            <span className="px-3 py-1 rounded-full bg-card border border-border">
              On-chain defense automation
            </span>
            <span className="px-3 py-1 rounded-full bg-card border border-border">
              Pre-signature transaction firewall
            </span>
          </div>
        </div>
        <div className="rounded-xl bg-card border border-border shadow-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-100">Why AegisDot?</h2>
          <p className="text-sm text-slate-300">
            Wallets sign opaque calldata every day. AegisDot inspects the intent
            of a transaction before it reaches the chain, flags risky approvals,
            and can trigger on-chain actions to protect funds.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200">
            <div className="rounded-xl bg-[#0B0F19] border border-border p-4">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Problem</p>
              <p className="mt-2">
                Users unknowingly grant unlimited approvals or interact with
                malicious contracts.
              </p>
            </div>
            <div className="rounded-xl bg-[#0B0F19] border border-border p-4">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Solution</p>
              <p className="mt-2">
                AI-powered risk engine analyzes transactions before signing and
                triggers defenses.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Problem: Blind signing",
            body:
              "Users approve tokens and interact with contracts they barely understand. Once signed, these operations are irreversible.",
          },
          {
            title: "How AegisDot works",
            body:
              "A backend risk engine inspects calldata and metadata, writes risk scores to a registry, and triggers a defense executor when thresholds are breached.",
          },
          {
            title: "Pipeline overview",
            body:
              "Risk Engine → RiskRegistry → DefenseExecutor → GuardianVault. The UI you are about to open is a live window into that flow.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl bg-card border border-border shadow-lg p-6 space-y-2"
          >
            <h3 className="text-sm font-semibold text-slate-100">{item.title}</h3>
            <p className="text-sm text-slate-300">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
