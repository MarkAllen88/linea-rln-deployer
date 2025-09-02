import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { createLightNode, waitForRemotePeer } from '@waku/sdk';
import {
  WAKU_WS_URL,
  WAKU_HTTP_URL,
  LINEA_RPC_URL,
  ETH_PRIV_KEY,
} from './config';

// ------------------------------------------------------------------
// MRKO and RLN details (unchanged)
const MRKO_ADDRESS = '0x5ddc2B6825F7eb721b80F5F3976E2BD3F0074817';
const MRKO_ABI = ['function balanceOf(address owner) view returns (uint256)'];
const RLN_CONTRACT_ADDRESS = '0xc2A987F8594892934734549e742B7A5C3c2754bb';
const RLN_ABI = [
  'function treeDepth() view returns (uint256)',
  // add more RLN functions here if you need them
];

// ------------------------------------------------------------------
// Debug: print env vars (you already added this, keep it)
console.log('Waku WS URL →', WAKU_WS_URL);
console.log('Linea RPC →', LINEA_RPC_URL);

// ------------------------------------------------------------------
// Component state
export default function App() {
  const [epoch, setEpoch] = useState('-');
  const [proofAddress, setProofAddress] = useState('');
  const [address, setAddress] = useState('');
  const [ethBalance, setEthBalance] = useState('0');
  const [mrkoBalance, setMrkoBalance] = useState('0');
  const [wakuStatus, setWakuStatus] = useState('disconnected');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [offerAmount, setOfferAmount] = useState('0.001');
  const [wantAmount, setWantAmount] = useState('0.01');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expiry, setExpiry] = useState('24 hours');

  // ------------------------------------------------------------------
  // Helper: initialise ethers provider (Linea Sepolia)
  const initProvider = async () => {
    // Use the public RPC URL from .env
    const lineaProvider = new ethers.JsonRpcProvider(LINEA_RPC_URL);
    setProvider(lineaProvider as unknown as ethers.BrowserProvider);
  };

  // ------------------------------------------------------------------
  // Connect wallet (MetaMask) – optional, but useful for UI
  const connectWallet = async () => {
    if ((window as any).ethereum) {
      const ethProv = new ethers.BrowserProvider((window as any).ethereum);
      await ethProv.send('eth_requestAccounts', []);
      const signer = await ethProv.getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);
      setProvider(ethProv);
    } else {
      alert('MetaMask not detected');
    }
  };

  // ------------------------------------------------------------------
  // Get current RLN epoch (or fallback)
  const getCurrentEpoch = async () => {
    if (!provider) return;
    const rlnContract = new ethers.Contract(
      RLN_CONTRACT_ADDRESS,
      RLN_ABI,
      provider,
    );
    try {
      const depth = await rlnContract.treeDepth();
      setEpoch(depth.toString());
    } catch (e) {
      // Fallback to a rough estimate if the contract call fails
      setEpoch(Math.floor(Date.now() / 1000 / 3600).toString());
    }
  };

  // ------------------------------------------------------------------
  // Connect to the local Waku node (uses env vars)
  const connectWaku = async () => {
    try {
      const node = await createLightNode({
        // If you want to force the local peer, give it explicitly:
        pubsubPeers: [
          {
            // The SDK expects a multiaddr without the ws:// scheme, ending with ?ws
            multiaddr: `${WAKU_WS_URL.replace('ws://', '')}?ws`,
          },
        ],
        // Optional: HTTP RPC for admin calls (e.g., node.info())
        rpcUrl: WAKU_HTTP_URL,
        // Keep default bootstrap peers for broader connectivity
        defaultBootstrap: true,
      });

      await node.start();
      await waitForRemotePeer(node, ['lightpush', 'filter']);
      setWakuStatus('connected');
    } catch (err: any) {
      setWakuStatus(`error: ${err.message}`);
    }
  };

  // ------------------------------------------------------------------
  // Submit an offer – placeholder (replace console.log with LightPush later)
  const submitOffer = async () => {
    console.log('Submitting offer:', {
      proofAddress,
      offerAmount,
      wantAmount,
      title,
      description,
      expiry,
    });
    // TODO: generate RLN proof, then publish via node.lightPush.publish(...)
  };

  // ------------------------------------------------------------------
  // Load provider on component mount
  useEffect(() => {
    initProvider();
  }, []);

  // ------------------------------------------------------------------
  // UI rendering (unchanged apart from button handlers)
  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-6 bg-[#111827] p-4 text-white">
      {/* ==== Read‑only info ==== */}
      <section className="w-full max-w-lg rounded-xl bg-[#1e293b] p-4 shadow-md">
        <h2 className="text-lg font-semibold text-[#10b981] mb-2">
          Read‑only Info
        </h2>
        <button
          onClick={getCurrentEpoch}
          className="mb-2 rounded bg-[#0ea5e9] px-3 py-1 hover:bg-[#0284c7]"
        >
          Get Current Epoch
        </button>
        <p>Epoch: {epoch}</p>
      </section>

      {/* ==== Wallet ==== */}
      <section className="w-full max-w-lg rounded-xl bg-[#1e293b] p-4 shadow-md">
        <h2 className="text-lg font-semibold text-[#10b981] mb-2">
          Wallet Status
        </h2>
        {address ? (
          <p>Connected as: {address}</p>
        ) : (
          <button
            onClick={connectWallet}
            className="rounded bg-[#0ea5e9] px-3 py-1 hover:bg-[#0284c7]"
          >
            Connect Wallet
          </button>
        )}
      </section>

      {/* ==== Waku connection ==== */}
      <section className="w-full max-w-lg rounded-xl bg-[#1e293b] p-4 shadow-md">
        <h2 className="text-lg font-semibold text-[#10b981] mb-2">
          Connection Status
        </h2>
        <button
          onClick={connectWaku}
          className="rounded bg-[#0ea5e9] px-3 py-1 hover:bg-[#0284c7]"
        >
          Connect to Waku
        </button>
        <p>Status: {wakuStatus}</p>
        {wakuStatus.startsWith('error:') && (
          <p className="bg-[#ef4444] p-2 rounded mt-2 text-sm">
            Error: {wakuStatus.split('error: ')[1]}
          </p>
        )}
      </section>

      {/* ==== Create Value Exchange ==== */}
      <section className="w-full max-w-lg rounded-xl bg-[#1e293b] p-4 shadow-md">
        <h2 className="text-lg font-semibold text-[#10b981] mb-2">
          Create Value Exchange
        </h2>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              className="flex-1 bg-gray-800 p-2 rounded border border-gray-700 focus:border-[#0ea5e9] focus:outline-none transition"
            />
            <span>MRKO in exchange for</span>
            <input
              type="number"
              value={wantAmount}
              onChange={(e) => setWantAmount(e.target.value)}
              className="flex-1 bg-gray-800 p-2 rounded border border-gray-700 focus:border-[#0ea5e9] focus:outline-none transition"
            />
            <span>ETH</span>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full bg-gray-800 p-2 rounded border border-gray-700 focus:border-[#0ea5e9] focus:outline-none transition"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full bg-gray-800 p-2 rounded border border-gray-700 focus:border-[#0ea5e9] focus:outline-none transition h-20"
          />

          <select
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="w-full bg-gray-800 p-2 rounded border border-gray-700 focus:border-[#0ea5e9] focus:outline-none transition"
          >
            <option>Offer expires in: 24 hours</option>
          </select>

          <button
            onClick={submitOffer}
            className="w-full bg-[#10b981] px-3 py-2 rounded hover:bg-[#0e9f6e] transition"
          >
            Submit Offer
          </button>
        </div>
      </section>
    </div>
  );
}
