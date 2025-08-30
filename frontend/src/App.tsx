import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { createLightNode, waitForRemotePeer } from '@waku/sdk';

// MRKO Token details from your logs/repo
const MRKO_ADDRESS = '0x5ddc2B6825F7eb721b80F5F3976E2BD3F0074817';
const MRKO_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
];

// RLN Contract details
const RLN_CONTRACT_ADDRESS = '0xc2A987F8594892934734549e742B7A5C3c2754bb';
// Add RLN ABI if you have it for epoch, e.g.:
const RLN_ABI = [
  'function getCurrentEpoch() view returns (uint256)',
  // Add more methods as needed
];

function App() {
  const [epoch, setEpoch] = useState('-');
  const [proofAddress, setProofAddress] = useState('');
  const [address, setAddress] = useState('');
  const [ethBalance, setEthBalance] = useState('0');
  const [mrkoBalance, setMrkoBalance] = useState('0');
  const [wakuStatus, setWakuStatus] = useState('disconnected');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  // Get Epoch from RLN contract
  const getCurrentEpoch = async () => {
    if (provider) {
      const rlnContract = new ethers.Contract(RLN_CONTRACT_ADDRESS, RLN_ABI, provider);
      try {
        const currentEpoch = await rlnContract.getCurrentEpoch();
        setEpoch(currentEpoch.toString());
      } catch (e) {
        console.error('Epoch fetch error:', e);
        setEpoch(Math.floor(Date.now() / 1000 / 3600).toString()); // Fallback
      }
    }
  };

  // Send Transaction (placeholder)
  const sendTransaction = async () => {
    console.log('Submitting proof/address:', proofAddress);
    // Integrate RLN tx here
  };

  // Wallet Connect
  const connectWallet = async () => {
    if (window.ethereum) {
      const prov = new ethers.BrowserProvider(window.ethereum);
      setProvider(prov);
      const accounts = await prov.send('eth_requestAccounts', []);
      setAddress(accounts[0]);
    }
  };

  useEffect(() => {
    if (provider && address) {
      provider.getBalance(address).then(bal => setEthBalance(ethers.formatEther(bal)));
      const mrkoContract = new ethers.Contract(MRKO_ADDRESS, MRKO_ABI, provider);
      mrkoContract.balanceOf(address).then(bal => setMrkoBalance(ethers.formatEther(bal)));
    }
  }, [provider, address]);

  // Waku Connect to local node
  const connectWaku = async () => {
    try {
      const node = await createLightNode({
        defaultBootstrap: true,
        libp2p: {
          addresses: {
            listen: ['/ip4/127.0.0.1/tcp/8000/ws']
          }
        }
      });
      await node.start();
      await waitForRemotePeer(node, ['lightpush', 'filter']);
      setWakuStatus('connected');
    } catch (e) {
      setWakuStatus(`error: ${e.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-[--primary] text-[--text] p-4 space-y-6">
      <h1 className="text-2xl font-bold text-[--accent] flex items-center mb-4">
        <span className="mr-2">🚀</span> RLN Demo (Linea Sepolia)
      </h1>

      <section className="w-full max-w-lg bg-[--secondary] rounded-xl p-4 shadow-md">
        <h2 className="text-lg font-semibold mb-2">Read-only Info</h2>
        <div className="flex justify-between items-center">
          <button onClick={getCurrentEpoch} className="bg-[--accent] px-3 py-1 rounded text-sm hover:opacity-90">Get Current Epoch</button>
          <p>Epoch: {epoch}</p>
        </div>
      </section>

      <section className="w-full max-w-lg bg-[--secondary] rounded-xl p-4 shadow-md">
        <h2 className="text-lg font-semibold mb-2">Send a transaction (optional)</h2>
        <input
          type="text"
          value={proofAddress}
          onChange={e => setProofAddress(e.target.value)}
          placeholder="Proof / address"
          className="w-full bg-gray-800 text-[--text] p-2 rounded mb-2 border border-gray-700"
        />
        <button onClick={sendTransaction} className="w-full bg-[--success] px-3 py-2 rounded hover:opacity-90">Submit</button>
      </section>

      <section className="w-full max-w-lg bg-[--secondary] rounded-xl p-4 shadow-md">
        <h2 className="text-lg font-semibold mb-2">Wallet Status</h2>
        {!address ? (
          <button onClick={connectWallet} className="bg-[--accent] px-3 py-2 rounded w-full hover:opacity-90">Connect Wallet</button>
        ) : (
          <div className="space-y-1">
            <p className="bg-blue-600 p-2 rounded">ETH: {ethBalance} (Linea Sepolia)</p>
            <p className="bg-orange-600 p-2 rounded">MRKO: {mrkoBalance}</p>
            <p className="text-sm text-gray-400">Address: {address.slice(0,6)}...{address.slice(-4)}</p>
          </div>
        )}
        <p className="bg-[--warning] p-2 rounded mt-2 text-sm">Need More Funding - Get testnet coins</p>
      </section>

      <section className="w-full max-w-lg bg-[--secondary] rounded-xl p-4 shadow-md">
        <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
        <button onClick={connectWaku} className="bg-[--accent] px-3 py-2 rounded w-full hover:opacity-90">Connect to Waku</button>
        <p className="mt-2 text-sm">Status: {wakuStatus}</p>
        {wakuStatus.includes('error') && <p className="bg-[--error] p-2 rounded mt-2 text-sm">{wakuStatus}</p>}
      </section>

      <section className="w-full max-w-lg bg-[--secondary] rounded-xl p-4 shadow-md">
        <h2 className="text-lg font-semibold text-green-400 mb-2">Create Value Exchange</h2>
        <div className="space-y-2">
          <div className="flex space-x-2 items-center">
            <input type="number" placeholder="0.001" className="flex-1 bg-gray-800 p-2 rounded border border-gray-700" />
            <span>MRKO in exchange for</span>
            <input type="number" placeholder="0.01" className="flex-1 bg-gray-800 p-2 rounded border border-gray-700" />
            <span>ETH</span>
          </div>
          <input placeholder="Title (optional)" className="w-full bg-gray-800 p-2 rounded border border-gray-700" />
          <textarea placeholder="Description (optional)" className="w-full bg-gray-800 p-2 rounded border border-gray-700 h-20" />
          <select className="w-full bg-gray-800 p-2 rounded border border-gray-700">
            <option>Offer expires in: 24 hours</option>
          </select>
          <button className="w-full bg-green-500 px-3 py-2 rounded hover:opacity-90">Submit Offer</button>
        </div>
      </section>
    </div>
  );
}

export default App;
