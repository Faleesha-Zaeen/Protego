import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.2em] text-highlight">
            Web3 Security · Polkadot
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
            AegisDot – On-chain AI Security Layer
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-xl">
            Analyze transactions and detect malicious smart contract
            interactions before users sign. AegisDot plugs into your dApp as a
            pre-signature security firewall.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-slate-300">
            <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/70">
              Real-time risk scoring
            </div>
            <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/70">
              On-chain defense automation
            </div>
            <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/70">
              Designed for hackathons
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl bg-highlight text-slate-900 text-sm font-semibold shadow-glow"
            >
              Open Security Dashboard
            </Link>
            <Link
              to="/architecture"
              className="px-4 py-2 rounded-xl border border-slate-700/80 text-xs text-slate-200 hover:bg-slate-900/70"
            >
              View System Architecture
            </Link>
          </div>
        </div>
        <div className="rounded-3xl bg-slate-900/80 border border-slate-700/70 p-5 space-y-4 text-xs">
          <h2 className="text-sm font-semibold text-slate-100 mb-1">
            Why AegisDot?
          </h2>
          <p className="text-slate-300">
            Wallets sign opaque calldata every day. AegisDot inspects the
            intent of a transaction before it reaches the chain, flags risky
            approvals, and can trigger on-chain actions to protect funds.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="rounded-2xl bg-slate-950/80 border border-slate-800 px-3 py-2">
              <div className="text-[11px] text-slate-400 mb-1">Problem</div>
              <p className="text-[11px] text-slate-200">
                Users unknowingly grant unlimited approvals or interact with
                malicious contracts.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-950/80 border border-slate-800 px-3 py-2">
              <div className="text-[11px] text-slate-400 mb-1">Solution</div>
              <p className="text-[11px] text-slate-200">
                AegisDot scores each transaction and can route high-risk flows
                through a protective vault.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs md:text-sm text-slate-300">
        <div className="rounded-2xl bg-slate-900/80 border border-slate-700/70 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-100">
            Problem: Blind signing
          </h3>
          <p>
            Users approve tokens and interact with contracts they barely
            understand. Once signed, these operations are irreversible.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-900/80 border border-slate-700/70 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-100">
            How AegisDot works
          </h3>
          <p>
            A backend risk engine inspects calldata and metadata, writes
            risk scores to a registry, and triggers a defense executor when
            thresholds are breached.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-900/80 border border-slate-700/70 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-100">
            Pipeline overview
          </h3>
          <p>
            Risk Engine → RiskRegistry → DefenseExecutor → GuardianVault. The
            UI you are about to open is a live window into that flow.
          </p>
        </div>
      </section>
    </div>
  );
}
