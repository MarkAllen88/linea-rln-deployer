// hardhat.config.cjs (Using CommonJS for maximum compatibility)

require("dotenv/config");
require("@nomicfoundation/hardhat-ethers");

/**
 * Helper to fetch a required env var or throw a clear error.
 */
function requiredEnv(name) {
  const val = process.env[name];
  if (!val) {
    throw new Error(`❗️ Missing ${name} in .env – please add it.`);
  }
  return val;
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          // This prevents the 'PUSH0' opcode incompatibility with Linea.
          evmVersion: "paris",
        },
      },
    ],
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
    },
    lineaSepolia: {
      type: "http",
      url: process.env.LINEA_SEPOLIA_RPC_URL ?? requiredEnv("LINEA_SEPOLIA_RPC_URL"),
      chainId: 59141,
      accounts: process.env.ETH_PRIVATE_KEY
        ? [process.env.ETH_PRIVATE_KEY]
        : [],
    },
  },
};

