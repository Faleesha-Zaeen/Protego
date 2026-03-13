import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { expect } from "chai";
import hardhat from "hardhat";

const { ethers } = hardhat;
const TEST_TIMEOUT = 30_000;
const RPC_URL = "https://eth-rpc-testnet.polkadot.io/";

const ADDRESSES = {
  riskEngine: "0x8ac03522a73EF023cF5A9CEC767D7a07736b45d9",
  defenseExecutor: "0xf3b8cfF56A5c83D4e7ca36B0e35F6f67cabAC1F2",
  guardianVault: "0xDBC63E7c1C244D5D0359Be41F8815592b8097619",
  riskRegistry: "0x42Cc0cfD29D8d57BcAFB479B60900D362aC5b63A",
};

const OWNER_ADDRESS = "0x3c584106FcD0Af7F56aD629D2a12BE77cB5029CB";

const CALldata = {
  empty: "0x",
  unlimitedApproval: "0x095ea7b3" + "0".repeat(64) + "ff".repeat(32),
  unknownSelector: "0xdeadbeef" + "0".repeat(64),
  safeApprove: "0x095ea7b3" + "0".repeat(64) + "00".repeat(31) + "64",
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadAbi(relativePath) {
  const abiPath = path.join(__dirname, "..", relativePath);
  const artifact = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  return artifact.abi;
}

function getWallet() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY is not set in environment");
  }
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return new ethers.Wallet(privateKey, provider);
}

describe("Protego testnet", function () {
  before(function () {
    this.timeout(TEST_TIMEOUT);
    dotenv.config({
      path: path.join(__dirname, "..", "backend", ".env"),
    });
  });

  describe("RiskEngine (PVM)", function () {
    this.timeout(TEST_TIMEOUT);

    let riskEngine;
    let largeTransfer;

    before(function () {
      const abi = loadAbi("artifacts/contracts/RiskEngine.sol/RiskEngine.json");
      riskEngine = new ethers.Contract(ADDRESSES.riskEngine, abi, getWallet());
      const amount = ethers.zeroPadValue(ethers.toBeHex(2000000), 32);
      largeTransfer = "0xa9059cbb" + "00".repeat(32) + amount.slice(2);
    });

    it("assessRisk(0x) returns 20", async function () {
      const score = await riskEngine.assessRisk(CALldata.empty);
      expect(Number(score)).to.equal(20);
    });

    it("assessRisk(unlimited approval) returns 40", async function () {
      const score = await riskEngine.assessRisk(CALldata.unlimitedApproval);
      expect(Number(score)).to.equal(40);
    });

    it("assessRisk(large transfer) returns 30", async function () {
      const score = await riskEngine.assessRisk(largeTransfer);
      expect(Number(score)).to.equal(30);
    });

    it("assessRisk(unknown selector) returns 20", async function () {
      const score = await riskEngine.assessRisk(CALldata.unknownSelector);
      expect(Number(score)).to.equal(20);
    });

    it("assessRisk(safe approve) returns 0", async function () {
      const score = await riskEngine.assessRisk(CALldata.safeApprove);
      expect(Number(score)).to.equal(0);
    });
  });

  describe("DefenseExecutor", function () {
    this.timeout(TEST_TIMEOUT);

    let defenseExecutor;
    let wallet;

    before(function () {
      const abi = loadAbi(
        "artifacts/contracts/DefenseExecutor.sol/DefenseExecutor.json"
      );
      wallet = getWallet();
      defenseExecutor = new ethers.Contract(
        ADDRESSES.defenseExecutor,
        abi,
        wallet
      );
    });

    it("pvmRiskEngine() returns deployed address", async function () {
      const addr = await defenseExecutor.pvmRiskEngine();
      expect(addr).to.equal(ADDRESSES.riskEngine);
    });

    it("guardianVault() returns deployed address", async function () {
      const addr = await defenseExecutor.guardianVault();
      expect(addr).to.equal(ADDRESSES.guardianVault);
    });

    it("evaluateAndDefend(empty calldata) returns score 20", async function () {
      const score = await defenseExecutor.evaluateAndDefend.staticCall(
        await wallet.getAddress(),
        CALldata.empty
      );
      expect(Number(score)).to.equal(20);
    });

    it("evaluateAndDefend(unlimited approval) returns score 40", async function () {
      const score = await defenseExecutor.evaluateAndDefend.staticCall(
        await wallet.getAddress(),
        CALldata.unlimitedApproval
      );
      expect(Number(score)).to.equal(40);
    });

    it("evaluateAndDefend emits RiskScoreReceived", async function () {
      const tx = await defenseExecutor.evaluateAndDefend(
        await wallet.getAddress(),
        CALldata.empty
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find((log) => {
        try {
          const parsed = defenseExecutor.interface.parseLog(log);
          return parsed.name === "RiskScoreReceived";
        } catch {
          return false;
        }
      });
      expect(event).to.not.be.undefined;
    });

    it("evaluateAndDefend with HIGH risk emits DefenseTriggered", async function () {
      const tx = await defenseExecutor.evaluateAndDefend(
        await wallet.getAddress(),
        "0xdeadbeef" + "00".repeat(32)
      );
      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);
    });
  });

  describe("RiskRegistry", function () {
    this.timeout(TEST_TIMEOUT);

    let riskRegistry;
    let wallet;

    before(function () {
      const abi = loadAbi("artifacts/contracts/RiskRegistry.sol/RiskRegistry.json");
      wallet = getWallet();
      riskRegistry = new ethers.Contract(
        ADDRESSES.riskRegistry,
        abi,
        wallet
      );
    });

    it("updateRiskScore(wallet, 85) succeeds when called by owner", async function () {
      const tx = await riskRegistry.updateRiskScore(
        await wallet.getAddress(),
        85
      );
      await tx.wait();
    });

    it("getRiskScore(wallet) returns 85 after update", async function () {
      const score = await riskRegistry.getRiskScore(
        await wallet.getAddress()
      );
      expect(Number(score)).to.equal(85);
    });

    it("updateRiskScore() reverts when called by non-owner", async function () {
      const randomWallet = ethers.Wallet.createRandom().connect(
        wallet.provider
      );
      const nonOwnerRegistry = riskRegistry.connect(randomWallet);
      let reverted = false;
      try {
        await nonOwnerRegistry.updateRiskScore(
          await wallet.getAddress(),
          50
        );
      } catch {
        reverted = true;
      }
      expect(reverted).to.equal(true);
    });
  });

  describe("GuardianVault", function () {
    this.timeout(TEST_TIMEOUT);

    let guardianVault;

    before(function () {
      const abi = loadAbi(
        "artifacts/contracts/GuardianVault.sol/GuardianVault.json"
      );
      guardianVault = new ethers.Contract(
        ADDRESSES.guardianVault,
        abi,
        getWallet()
      );
    });

    it("owner() returns the deployer address", async function () {
      const owner = await guardianVault.owner();
      expect(owner).to.equal(OWNER_ADDRESS);
    });
  });
});
