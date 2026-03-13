import "dotenv/config";
import fs from "fs";
import hre from "hardhat";
import { ethers } from "ethers";

const RPC_URL = "https://eth-rpc-testnet.polkadot.io/";
const OUTPUT_PATH = "deployed-risk-engine.json";

function buildUnlimitedApprovalCalldata() {
  const selector = "095ea7b3";
  const spender = "0000000000000000000000001111111111111111111111111111111111111111";
  const maxUint = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
  return `0x${selector}${spender}${maxUint}`;
}

async function main() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not set in .env at project root");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const artifact = await hre.artifacts.readArtifact("RiskEngine");
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);

  console.log("Deploying RiskEngine with account:", await signer.getAddress());
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("RiskEngine deployed to:", address);

  fs.writeFileSync(
    OUTPUT_PATH,
    JSON.stringify({ address, network: "polkadotTestnet" }, null, 2)
  );

  const calldata = buildUnlimitedApprovalCalldata();
  const score = await contract.assessRisk(calldata);
  console.log("assessRisk(unlimited approval) =>", score.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
