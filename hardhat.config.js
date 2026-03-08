import "dotenv/config";

const config = {
  solidity: "0.8.20",
  networks: {
    polkadotTestnet: {
      type: "http",
      url: "https://eth-rpc-testnet.polkadot.io/",
      chainId: 420420417,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};

export default config;
