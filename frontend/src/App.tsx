import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";

import rlnAbi from "./abi/RLN.json";
import deployInfo from "./deployInfo.json";

// Vite injects env vars that start with VITE_
const RPC_URL = import.meta.env.VITE_LINEA_SEPOLIA_RPC_URL;
const PRIVATE_KEY = import.meta.env.VITE_ETH_PRIVATE_KEY; // optional – only needed for txs

function App() {
  const [provider, setProvider] = useState<ethers.Provider>();
  const [signer, setSigner] = useState<ethers.Signer>();
  const [contract, setContract] = useState<ethers.Contract>();
  const [epoch, setEpoch] = useState<string>("—");
  const [proofInput, setProofInput] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  // -----------------------------------------------------------------
  // Initialise provider, signer (if we have a private key), and contract
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!RPC_URL) {
      console.error("❌ Missing VITE_LINEA_SEPOLIA_RPC_URL");
      return;
    }

    const prov = new ethers.JsonRpcProvider(RPC_URL);
    setProvider(prov);

    if (PRIVATE_KEY) {
      const wallet = new ethers.Wallet(PRIVATE_KEY, prov);
      setSigner(wallet);
    }

    // The address comes from src/deployInfo.json (generated from .deploy)
    const rl = new ethers.Contract(
      // @ts-ignore – the JSON shape is simple
      (deployInfo as any).address,
      rlnAbi.abi,
      prov
    );
    setContract(rl);
  }, []);

  // -----------------------------------------------------------------
  // Read‑only call: fetch the current epoch (or any view fn you have)
  // -----------------------------------------------------------------
  const fetchEpoch = async () => {
    if (!contract) {
      alert("Contract not loaded yet.");
      return;
    }
    try {
      // 👉 Replace `getCurrentEpoch` with the exact view function name you exported
      const cur = await (contract as any).getCurrentEpoch?.();
      setEpoch(cur?.toString() ?? "N/A");
    } catch (e) {
      console.error(e);
      setEpoch("error");
    }
  };

  // -----------------------------------------------------------------
  // Optional: send a signed transaction (requires VITE_ETH_PRIVATE_KEY)
  // -----------------------------------------------------------------
  const sendTx = async () => {
    if (!signer || !contract) {
      alert(
        "No signer configured – add VITE_ETH_PRIVATE_KEY to .env.local to enable txs."
      );
      return;
    }

    try {
      const rlWithSigner = contract.connect(signer);
      // 👉 Replace `setSemaphore` with the mutating function you actually want to call
      const tx = await rlWithSigner.setSemaphore(proofInput);
      setTxHash(tx.hash);
      await tx.wait();
      alert("✅ Transaction mined!");
    } catch (err: any) {
      console.error(err);
      alert(`❌ Tx failed: ${err.message}`);
    }
  };

  // -----------------------------------------------------------------
  // Render UI
  // -----------------------------------------------------------------
  return (
    <div className="App" style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🚀 RLN Demo (Linea Sepolia)</h1>

      {/* -------------------- Read‑only section -------------------- */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Read‑only info</h2>
        <button onClick={fetchEpoch} style={{ marginRight: "1rem" }}>
          Get Current Epoch
        </button>
        <span>Epoch: {epoch}</span>
      </section>

      {/* -------------------- Transaction section -------------------- */}
      <section>
        <h2>Send a transaction (optional)</h2>
        <input
          type="text"
          placeholder="Proof / address"
          value={proofInput}
          onChange={(e) => setProofInput(e.target.value)}
          style={{
            padding: "0.5rem",
            marginRight: "0.5rem",
            minWidth: "250px",
          }}
        />
        <button onClick={sendTx}>Submit</button>

        {txHash && (
          <p>
            Tx hash:{" "}
            <a
              href={`https://sepolia.lineascan.build/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {txHash.slice(0, 10)}…{txHash.slice(-8)}
            </a>
          </p>
        )}
      </section>
    </div>
  );
}

export default App;
