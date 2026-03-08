import "dotenv/config";
import { ethers } from "ethers";

const RPC_URL = "https://eth-rpc-testnet.polkadot.io/";
const GUARDIAN_VAULT_ADDRESS = "0xDBC63E7c1C244D5D0359Be41F8815592b8097619";
const DEFENSE_EXECUTOR_ADDRESS = "0x3c584106FcD0Af7F56aD629D2a12BE77cB5029CB";

// Minimal Ownable ABI
const GUARDIAN_VAULT_ABI = [
  "function owner() view returns (address)",
  "function transferOwnership(address newOwner)",
];

export async function main() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not set in .env at project root");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const signerAddress = await signer.getAddress();
  console.log("Using signer:", signerAddress);

  const vault = new ethers.Contract(
    GUARDIAN_VAULT_ADDRESS,
    GUARDIAN_VAULT_ABI,
    signer
  );

  const ownerBefore = await vault.owner();
  console.log("Current GuardianVault owner:", ownerBefore);

  if (ownerBefore.toLowerCase() === DEFENSE_EXECUTOR_ADDRESS.toLowerCase()) {
    console.log("Ownership already transferred to DefenseExecutor. Skipping.");
    return;
  }

  const tx = await vault.transferOwnership(DEFENSE_EXECUTOR_ADDRESS);
  console.log("Ownership transfer tx hash:", tx.hash);
  await tx.wait();

  const ownerAfter = await vault.owner();
  console.log("New GuardianVault owner:", ownerAfter);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
