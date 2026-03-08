import "dotenv/config";
import hre from "hardhat";
import { ethers } from "ethers";

// Deploys GuardianVault, RiskRegistry, and DefenseExecutor to Polkadot testnet, then logs addresses.
export async function main() {
  const RPC_URL = "https://eth-rpc-testnet.polkadot.io/";

  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not set in .env at project root");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const deployerAddress = await signer.getAddress();

  console.log("Deploying contracts with account:", deployerAddress);

  // Helper to build a ContractFactory from Hardhat artifacts
  async function getFactory(name) {
    const artifact = await hre.artifacts.readArtifact(name);
    return new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
  }

  // Deploy GuardianVault
  const GuardianVaultFactory = await getFactory("GuardianVault");
  const guardianVault = await GuardianVaultFactory.deploy();
  await guardianVault.waitForDeployment();
  const guardianVaultAddress = await guardianVault.getAddress();
  console.log("GuardianVault deployed to:", guardianVaultAddress);

  // Deploy RiskRegistry
  const RiskRegistryFactory = await getFactory("RiskRegistry");
  const riskRegistry = await RiskRegistryFactory.deploy();
  await riskRegistry.waitForDeployment();
  const riskRegistryAddress = await riskRegistry.getAddress();
  console.log("RiskRegistry deployed to:", riskRegistryAddress);

  // Deploy DefenseExecutor with vault + registry addresses
  const DefenseExecutorFactory = await getFactory("DefenseExecutor");
  const defenseExecutor = await DefenseExecutorFactory.deploy(
    guardianVaultAddress,
    riskRegistryAddress
  );
  await defenseExecutor.waitForDeployment();
  const defenseExecutorAddress = await defenseExecutor.getAddress();
  console.log("DefenseExecutor deployed to:", defenseExecutorAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
