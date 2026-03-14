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
      className={`flex items-center justify-center gap-2 w-full h-12 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors shadow-glow
        ${isExpanded ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-600 text-white"}
      `}
    >
      <Wallet className="w-5 h-5" />
      {isExpanded &&
        (account
          ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
          : "Connect Wallet")}
    </button>
  );
}
