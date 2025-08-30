# Linea RLN Contract Deployer

This project provides a complete environment to compile, deploy, and interact with a custom RLN (Rate-Limiting Nullifier) smart contract on the **Linea Sepolia testnet**.

A key feature of this setup is the use of **standalone Node.js scripts** for deployment and interaction. This approach bypasses common issues with the Hardhat Runtime Environment (HRE) in ES Module-based projects, providing a stable and reliable workflow.

---

## Setup

Follow these steps to set up the project on a new machine.

1.  **Clone the repository:**
    
    git clone https://github.com/MarkAllen88/linea-rln-deployer.git
    cd linea-rln-deployer
    

2.  **Install dependencies:**

    npm install


3.  **Create your environment file:**
    Copy the example file to a new `.env` file, which will be ignored by Git.
    
    cp .env.example .env

    Now, open the `.env` file and fill in your secrets:
    *   `LINEA_SEPOLIA_RPC_URL`: Your RPC endpoint for the Linea Sepolia network.
    *   `ETH_PRIVATE_KEY`: The private key of the wallet you will use for deployment. This wallet must have Linea Sepolia ETH for gas fees.
    *   `STABLE_TOKEN_ADDRESS`: The address of the ERC20 token your contract will use.

---

## Workflow

This project uses npm scripts for all common tasks.

#### 1. Compile Contracts
If you make any changes to the files in the `contracts/` directory, you must recompile them.

npm run compile

2. Deploy Contract
This script deploys the RLN.sol contract to the Linea Sepolia network. On success, it will create a .deploy file in the project root containing the new contract address.

npm run deploy

3. Interact with Contract
This script reads the contract address from the .deploy file and runs pre-defined, read-only function calls against the live contract to verify its state.

npm run interact

Key Technical Details & Notes
Standalone Scripts: The deploy.js and interact.js scripts are run directly with node and do not use npx hardhat run. They create their own ethers provider. This was done to solve a persistent bug where the HRE was not being initialized correctly.
EVM Version: The hardhat.config.cjs file explicitly sets evmVersion: "paris". This is critical for Linea compatibility, as it prevents the compiler from using the PUSH0 opcode, which is not supported by the Linea EVM and would cause deployments to fail.
Authentication: This repository is configured to use SSH for authentication with GitHub. If setting up on a new machine, you will need to add a new SSH key to your GitHub account.
