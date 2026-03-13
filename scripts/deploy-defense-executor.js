import "dotenv/config";
import fs from "fs";
import hre from "hardhat";
import { ethers } from "ethers";

const RPC_URL = "https://eth-rpc-testnet.polkadot.io/";
const OUTPUT_PATH = "deployed-defense-executor.json";

function buildUnlimitedApprovalCalldata() {
  const selector = "095ea7b3";
  const spender = "0000000000000000000000000000000000000000000000000000000000000000";
  const maxUint = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
  return `0x${selector}${spender}${maxUint}`;
}

async function main() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not set in .env at project root");
  }

  const guardianVaultAddress = process.env.GUARDIAN_VAULT_ADDRESS;
  const riskRegistryAddress = process.env.RISK_REGISTRY_ADDRESS;

  if (!guardianVaultAddress || !riskRegistryAddress) {
    throw new Error("GUARDIAN_VAULT_ADDRESS and RISK_REGISTRY_ADDRESS must be set in .env");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const artifact = await hre.artifacts.readArtifact("DefenseExecutor");
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);

  console.log("Deploying DefenseExecutor with account:", await signer.getAddress());
  const contract = await factory.deploy(guardianVaultAddress, riskRegistryAddress);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("DefenseExecutor deployed to:", address);

  fs.writeFileSync(
    OUTPUT_PATH,
    JSON.stringify({ address, network: "polkadotTestnet" }, null, 2)
  );

  const user = "0x9706168B8B6601B20bF2d0c70E164A5f0cDe729e";
  const calldata = buildUnlimitedApprovalCalldata();

  const score = await contract.evaluateAndDefend.staticCall(user, calldata);
  console.log("evaluateAndDefend score:", score.toString());
  console.log("Defense triggered:", Number(score) > 70 ? "YES" : "NO");

  const tx = await contract.evaluateAndDefend(user, calldata);
  const receipt = await tx.wait();
  console.log("Transaction hash:", receipt?.hash || receipt?.transactionHash || "-");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
