import "dotenv/config";
import "@nomicfoundation/hardhat-toolbox";
import "@parity/hardhat-polkadot";

const config = {
  solidity: "0.8.20",
  resolc: {
    version: "0.5.0",
    compilerSource: "npm",
    settings: {
      contractsToCompile: ["contracts/RiskEngine.sol"],
    },
  },
  networks: {
    polkadotTestnet: {
      type: "http",
      polkadot: {
        target: "pvm",
      },
      url: "https://eth-rpc-testnet.polkadot.io/",
      chainId: 420420417,
      accounts: [process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000"],
    },
  },
};

export default config;
