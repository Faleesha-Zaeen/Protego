import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, ShieldCheck } from "lucide-react";
import { simulateAttack, recordDefenseEvent } from "../api/backend";
import { getContracts } from "../web3/contracts";

export default function AttackSimulator({
  onResult,
  pushLog,
  walletAddress,
  contractAddress,
  value,
}) {
  const [loading, setLoading] = useState(false);
  const [defenseTx, setDefenseTx] = useState(null);

  async function handleSimulate() {
    setLoading(true);
    setDefenseTx(null);
    pushLog("Simulating malicious transaction...");
    try {
      const payload = {
        walletAddress: walletAddress || "0xUser123",
        contractAddress:
          contractAddress || "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        method: "approve",
        value,
        unlimitedApproval: true,
      };

      const data = await simulateAttack(payload);
      pushLog("Attack analyzed. Risk level: " + data.riskLevel);
      if (data.defenseTriggered) {
        pushLog("On-chain defense triggered (DefenseExecutor + GuardianVault).");
        try {
          const { defenseExecutor } = await getContracts();
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          const tx = await defenseExecutor.evaluateAndDefend(accounts[0]);
          const txHash = tx.hash;
          pushLog("Defense transaction sent. Waiting for confirmation...");
          const receipt = await tx.wait();
          setDefenseTx(txHash);
          pushLog("Defense confirmed on-chain: " + (receipt?.hash || txHash));

          try {
            await recordDefenseEvent({
              wallet: accounts[0] || walletAddress || "0xUnknown",
              txHash,
              timestamp: Date.now(),
              status: "confirmed",
            });
          } catch (eventErr) {
            console.error("Failed to sync defense event with backend", eventErr);
          }
        } catch (chainError) {
          console.error(chainError);
          pushLog("On-chain defense call failed: " + chainError.message);
        }
      }
      onResult(data);
    } catch (err) {
      console.error(err);
      pushLog("Simulation failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <motion.button
        onClick={handleSimulate}
        disabled={loading}
        whileTap={{ scale: 0.96 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-glow disabled:opacity-60 transition-colors"
      >
        {loading ? (
          <ShieldCheck className="w-4 h-4 animate-pulse" />
        ) : null}
        {loading ? "Running attack simulation..." : "Simulate Malicious Transaction"}
      </motion.button>
      {defenseTx && (
        <div className="mt-4 text-sm text-safe">
          Defense confirmed on-chain.
          <a
            href={`https://blockscout-testnet.polkadot.io/tx/${defenseTx}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 underline text-accent hover:text-accent/80"
          >
            View transaction 
          </a>
        </div>
      )}
    </div>
  );
}
