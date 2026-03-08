import { useState } from "react";
import { Wallet } from "lucide-react";

export default function WalletConnect({ isExpanded = true }) {
  const [account, setAccount] = useState("");

  const connectWallet = async () => {
    console.log("Connect Wallet clicked");

    if (!window.ethereum) {
      alert("MetaMask not detected");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected accounts:", accounts);

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  };

  return (
    <button
      onClick={connectWallet}
      className={`flex items-center justify-center gap-2 bg-primary text-white px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer w-full ${
        isExpanded ? "" : "px-2"
      }`}
    >
      <Wallet className="w-4 h-4" />
      {isExpanded &&
        (account
          ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
          : "Connect Wallet")}
    </button>
  );
}
