import { useState } from "react";

export default function WalletConnect() {
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
      className="bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer"
    >
      {account
        ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
        : "Connect Wallet"}
    </button>
  );
}
