import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

const POLKADOT_HUB_RPC = "https://eth-rpc-testnet.polkadot.io/";

const statusColor = {
  Connected: "text-emerald-200 bg-emerald-500/20",
  Connecting: "text-amber-200 bg-amber-500/20",
  Error: "text-red-200 bg-red-500/20",
};

export default function NetworkStatus() {
  const [blockNumber, setBlockNumber] = useState("—");
  const [chainId, setChainId] = useState("—");
  const [rpcStatus, setRpcStatus] = useState("Connecting");

  useEffect(() => {
    let mounted = true;
    let intervalId;

    async function fetchStatus() {
      try {
        const provider = new ethers.JsonRpcProvider(POLKADOT_HUB_RPC);
        const [block, network] = await Promise.all([
          provider.getBlockNumber(),
          provider.getNetwork(),
        ]);

        if (!mounted) return;

        setBlockNumber(block.toLocaleString());
        setChainId(network.chainId?.toString?.() ?? `${network.chainId}`);
        setRpcStatus("Connected");
      } catch (error) {
        if (!mounted) return;
        console.error("Failed to fetch Polkadot Hub network status", error);
        setRpcStatus("Error");
      }
    }

    fetchStatus();
    intervalId = setInterval(fetchStatus, 15000);

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const statusBadgeClass = useMemo(
    () =>
      `inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
        statusColor[rpcStatus] ?? "text-amber-200 bg-amber-500/20"
      }`,
    [rpcStatus]
  );

  return (
    <section className="rounded-3xl bg-slate-900/80 border border-slate-700/70 p-5 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">
            Polkadot Hub Network Status
          </h2>
          <p className="text-xs text-slate-400">
            Live telemetry from the Polkadot Hub Testnet RPC endpoint.
          </p>
        </div>
        <span className={statusBadgeClass}>{rpcStatus}</span>
      </header>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-slate-400">Latest Block</p>
          <p className="text-slate-100 font-semibold">{blockNumber}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Chain ID</p>
          <p className="text-slate-100 font-semibold">{chainId}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">RPC Status</p>
          <p className="text-slate-100 font-semibold">{rpcStatus}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Native Asset</p>
          <p className="text-slate-100 font-semibold">PAS</p>
        </div>
      </div>
    </section>
  );
}
