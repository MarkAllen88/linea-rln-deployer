// hardhat.config.cjs  (CommonJS – works with "type": "module" in package.json)

// ------------------------------------------------------------------
// Imports (CommonJS)
// ------------------------------------------------------------------
require("@nomicfoundation/hardhat-toolbox");   // includes ethers, waffle, etc.
require("@nomicfoundation/hardhat-ethers");
require("dotenv/config");                     // auto‑load .env

/** Helper – ensure a required env var exists */
function requiredEnv(name) {
  const val = process.env[name];
  if (!val) {
    throw new Error(`❗️ Missing ${name} in .env – please add it.`);
  }
  return val;
}

// ------------------------------------------------------------------
// Hardhat configuration (CommonJS)
// ------------------------------------------------------------------
module.exports = {
  // ----------------------------------------------------------------
  // Solidity compiler settings
  // ----------------------------------------------------------------
  solidity: {
    compilers: [
      // ----------------------------------------------------------------
      // 1️⃣  RLN contracts – you already use 0.8.28 for those
      // ----------------------------------------------------------------
      {
        version: "0.8.28",
        settings: {
          optimizer: { enabled: true, runs: 200 },
          // Prevent PUSH0 opcode incompatibility with Linea.
          evmVersion: "paris",
        },
      },
      // ----------------------------------------------------------------
      // 2️⃣  SimpleFeeCollector – tiny contract that only needs a
      //     receive() fallback, compiled with 0.8.26 (the version we wrote it in)
      // ----------------------------------------------------------------
      {
        version: "0.8.26",
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: "paris",
        },
      },
    ],
  },

  // ----------------------------------------------------------------
  // Network definitions
  // ----------------------------------------------------------------
  networks: {
    // --------------------------------------------------------------
    // Local Hardhat network – unchanged
    // --------------------------------------------------------------
    hardhat: {
      // The original config used a custom type; keep it.
      type: "edr-simulated",
    },

    // --------------------------------------------------------------
    // Linea Sepolia – where the RLN contract lives
    // --------------------------------------------------------------
    lineaSepolia: {
      type: "http",
      url:
        process.env.LINEA_SEPOLIA_RPC_URL ||
        requiredEnv("LINEA_SEPOLIA_RPC_URL"),
      chainId: 59141,
      // `accounts` expects an array of private‑key strings.
      // If the env var is missing we pass an empty array (Hardhat will error later).
      accounts: process.env.ETH_PRIVATE_KEY ? [process.env.ETH_PRIVATE_KEY] : [],
    },

    // --------------------------------------------------------------
    // Optional: a quick localhost endpoint for testing
    // --------------------------------------------------------------
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },

  // ----------------------------------------------------------------
  // Paths (optional – keeps the default layout but makes it explicit)
  // ----------------------------------------------------------------
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  // ----------------------------------------------------------------
  // Mocha options (useful if you ever write tests)
  // ----------------------------------------------------------------
  mocha: {
    timeout: 20000,
  },
};
