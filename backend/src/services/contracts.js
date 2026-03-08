// Contract integration layer for AegisDot backend
// Connects to GuardianVault, RiskRegistry, and DefenseExecutor using ethers.js

const path = require('path');

// Hardhat artifacts (ABI + bytecode) compiled at the project root
// __dirname: <root>/backend/src/services -> go up three levels to reach <root>/artifacts
const guardianVaultArtifact = require(path.join(
  __dirname,
  '..',
  '..',
  '..',
  'artifacts',
  'contracts',
  'GuardianVault.sol',
  'GuardianVault.json'
));
const riskRegistryArtifact = require(path.join(
  __dirname,
  '..',
  '..',
  '..',
  'artifacts',
  'contracts',
  'RiskRegistry.sol',
  'RiskRegistry.json'
));
const defenseExecutorArtifact = require(path.join(
  __dirname,
  '..',
  '..',
  '..',
  'artifacts',
  'contracts',
  'DefenseExecutor.sol',
  'DefenseExecutor.json'
));

// Lazily import ethers (v6 is ESM-only, so use dynamic import from CommonJS)
let _ethers;
async function getEthers() {
  if (!_ethers) {
    const mod = await import('ethers');
    // ethers v6 exports the namespace as the module itself
    _ethers = mod.ethers || mod;
  }
  return _ethers;
}

// Cached provider, signer, and contract instances
let provider;
let signer;
let guardianVault;
let riskRegistry;
let defenseExecutor;

async function initContracts() {
  if (guardianVault && riskRegistry && defenseExecutor) {
    return { guardianVault, riskRegistry, defenseExecutor };
  }

  const ethers = await getEthers();

  const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545';
  provider = new ethers.JsonRpcProvider(rpcUrl);

  // Use a local dev private key. Prefer env, fall back to Hardhat's first account
  const defaultHardhatKey =
    process.env.DEPLOYER_PRIVATE_KEY ||
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

  signer = new ethers.Wallet(defaultHardhatKey, provider);

  const guardianVaultAddress = process.env.GUARDIAN_VAULT_ADDRESS;
  const riskRegistryAddress = process.env.RISK_REGISTRY_ADDRESS;
  const defenseExecutorAddress = process.env.DEFENSE_EXECUTOR_ADDRESS;

  if (!guardianVaultAddress || !riskRegistryAddress || !defenseExecutorAddress) {
    throw new Error('Contract addresses are missing from environment variables');
  }

  guardianVault = new ethers.Contract(
    guardianVaultAddress,
    guardianVaultArtifact.abi,
    signer
  );

  riskRegistry = new ethers.Contract(
    riskRegistryAddress,
    riskRegistryArtifact.abi,
    signer
  );

  defenseExecutor = new ethers.Contract(
    defenseExecutorAddress,
    defenseExecutorArtifact.abi,
    signer
  );

  return { guardianVault, riskRegistry, defenseExecutor };
}

// Helper: update the on-chain risk score for a user
async function updateRiskScore(user, score) {
  const { riskRegistry } = await initContracts();
  const tx = await riskRegistry.updateRiskScore(user, score);
  return tx.wait();
}

// Helper: trigger the defense executor for a given user
async function callDefense(user) {
  const { defenseExecutor } = await initContracts();
  const tx = await defenseExecutor.evaluateAndDefend(user);
  return tx.wait();
}

module.exports = {
  updateRiskScore,
  callDefense,
};
