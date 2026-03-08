import { useEffect, useState } from "react";
import { ethers } from "ethers";

const RPC_URL = "https://eth-rpc-testnet.polkadot.io/";

export default function RuntimeStatus() {
  const [runtimeInfo, setRuntimeInfo] = useState({
    blockNumber: null,
    chainId: null,
    connected: false,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchRuntimeStatus() {
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const [blockNumber, network] = await Promise.all([
          provider.getBlockNumber(),
          provider.getNetwork(),
        ]);

        if (!cancelled) {
          setRuntimeInfo({
            blockNumber,
            chainId: Number(network.chainId),
            connected: true,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setRuntimeInfo((prev) => ({
            ...prev,
            connected: false,
            error: err.message || "Failed to reach Polkadot RPC",
          }));
        }
      }
    }

    fetchRuntimeStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-3xl bg-slate-900/80 border border-slate-700/70 p-5 space-y-3">
      <header>
        <h2 className="text-lg font-semibold text-slate-50">Polkadot Runtime Status</h2>
        <p className="text-xs text-slate-400">Live metadata pulled from the Polkadot Hub EVM endpoint.</p>
      </header>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-400 text-[11px] uppercase tracking-wide">Network</p>
          <p className="text-slate-50 font-semibold">Polkadot Hub</p>
        </div>
        <div>
          <p className="text-slate-400 text-[11px] uppercase tracking-wide">Native Asset</p>
          <p className="text-slate-50 font-semibold">PAS</p>
        </div>
        <div>
          <p className="text-slate-400 text-[11px] uppercase tracking-wide">Latest Block</p>
          <p className="text-slate-50 font-semibold">
            {runtimeInfo.blockNumber !== null ? runtimeInfo.blockNumber : "Loading..."}
          </p>
        </div>
        <div>
          <p className="text-slate-400 text-[11px] uppercase tracking-wide">Chain ID</p>
          <p className="text-slate-50 font-semibold">
            {runtimeInfo.chainId !== null ? runtimeInfo.chainId : "Loading..."}
          </p>
        </div>
        <div>
          <p className="text-slate-400 text-[11px] uppercase tracking-wide">RPC Status</p>
          <p className={runtimeInfo.connected ? "text-emerald-300 font-semibold" : "text-red-300 font-semibold"}>
            {runtimeInfo.connected ? "Connected" : runtimeInfo.error ? "Error" : "Connecting"}
          </p>
          {runtimeInfo.error && (
            <p className="text-[11px] text-red-300 mt-1">{runtimeInfo.error}</p>
          )}
        </div>
      </div>
    </section>
  );
}
