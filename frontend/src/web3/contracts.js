import { ethers } from "ethers";
import GuardianVaultJSON from "../abi/GuardianVault.json";
import DefenseExecutorJSON from "../abi/DefenseExecutor.json";

const GUARDIAN_VAULT_ADDRESS = "0xDBC63E7c1C244D5D0359Be41F8815592b8097619";
const DEFENSE_EXECUTOR_ADDRESS = "0x3c584106FcD0Af7F56aD629D2a12BE77cB5029CB";

export async function getContracts() {
  if (!window.ethereum) {
    throw new Error("Wallet not connected");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const guardianVault = new ethers.Contract(
    GUARDIAN_VAULT_ADDRESS,
    GuardianVaultJSON.abi,
    signer
  );

  const defenseExecutor = new ethers.Contract(
    DEFENSE_EXECUTOR_ADDRESS,
    DefenseExecutorJSON.abi,
    signer
  );

  return { guardianVault, defenseExecutor };
}
