import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { createLightNode, waitForRemotePeer } from '@waku/sdk';

// MRKO and RLN details
const MRKO_ADDRESS = '0x5ddc2B6825F7eb721b80F5F3976E2BD3F0074817';
const MRKO_ABI = ['function balanceOf(address owner) view returns (uint256)'];
const RLN_CONTRACT_ADDRESS = '0xc2A987F8594892934734549e742B7A5C3c2754bb';
const RLN_ABI = [
  'function treeDepth() view returns (uint256)',
  // Add 'function getCurrentEpoch() view returns (uint256)' if available
];

function App() {
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

  const getCurrentEpoch = async () => {
    if (provider) {
      const rlnContract = new ethers.Contract(RLN_CONTRACT_ADDRESS, RLN_ABI, provider);
      try {
        const depth = await rlnContract.treeDepth(); // Test; replace with getCurrentEpoch
        setEpoch(depth.toString());
      } catch (e) {
        setEpoch(Math.floor(Date.now() / 1000 / 3600).toString());
      }
    }
  };

  const sendTransaction = async () => {
    console.log('Submitting:', proofAddress);
  };

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

  const connectWaku = async () => {
    try {
      const node = await createLightNode({
        defaultBootstrap: true,
        libp2p: { addresses: { listen: ['/ip4/127.0.0.1/tcp/8000/ws'] } }
      });
      await node.start();
      await waitForRemotePeer(node, ['lightpush', 'filter']);
      setWakuStatus('connected');
    } catch (e) {
      setWakuStatus(`error: ${e.message}`);
    }
  };

  const submitOffer = () => {
    const offer = { offerAmount, wantAmount, title, description, expiry, sender: address };
    console.log('Submitted offer:', offer);
    // Todo: Send via Waku
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-primary text-text space-y-6 p-4">
      <h1 className="text-2xl font-bold text-accent flex items-center mb-4">
        <span className="mr-2">🚀</span> RLN Demo (Linea Sepolia)
      </h1>

      <section className="w-full max-w-lg bg-secondary rounded-xl p-4 shadow-md">
        <h2 className="text-lg font-semibold mb-2">Read-only Info</h2>
        <div className="flex justify-between items-center">
          <button onClick={getCurrentEpoch} className="bg-accent px-3 py-1 rounded text-sm hover:opacity-90">Get Current Epoch</button>
          <p>Epoch: {epoch}</p>
        </div>
      </section>

      <section className="w-full max-w-lg bg-secondary rounded-xl p-4 shadow-md">
        <h2 className="text-lg font-semibold mb-2">Send a transaction (optional)</h2>
        <input
          type="text"
          value={proofAddress}
          onChange={(e) => setProofAddress(e.target.value)}
          placeholder="Proof / address"
          className="w-full bg-[#1e293b] p-2 rounded mb-2 border border-gray-700" // Arbitrary secondary for input
        />
        <button onClick={sendTransaction} className="w-full bg-success px-3 py-2 rounded hover:opacity-90">Submit</button>
      </section>

      <section className="w-full max-w-lg bg-secondary rounded-xl p-4 shadow-md">
        <h2 className="text-lg font-semibold mb-2">Wallet Status</h2>
        {!address ? (
          <button onClick={connectWallet} className="bg-accent px-3 py-2 rounded w-full hover:opacity-90">Connect Wallet</button>
        ) : (
          <div className="space-y-1">
            <p className="bg-blue-600 p-2 rounded">ETH: {ethBalance} (Linea Sepolia)</p>
            <p className="bg-orange-600 p-2 rounded">MRKO: {mrkoBalance}</p>
            <p className="text-sm text-gray-400">Address: {address.slice(0, 6)}...{address.slice(-4)}</p>
          </div>
        )}
        <p className="bg-warning p-2 rounded mt-2 text-sm">Need More Funding - Get testnet coins</p>
      </section>

      <section className="w-full max-w-lg bg-secondary rounded-xl p-4 shadow-md">
        <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
        <button onClick={connectWaku} className="bg-accent px-3 py-2 rounded w-full hover:opacity-90">Connect to Waku</button>
        <p className="mt-2 text-sm">Status: {wakuStatus}</p>
        {wakuStatus.includes('error') && <p className="bg-error p-2 rounded mt-2 text-sm">Error: {wakuStatus.split('error: ')[1]}</p>}
      </section>

      <section className="w-full max-w-lg bg-secondary rounded-xl p-4 shadow-md">
        <h2 className="text-lg font-semibold text-green-400 mb-2">Create Value Exchange</h2>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              className="flex-1 bg-[#1e293b] p-2 rounded border border-gray-700"
            />
            <span>MRKO in exchange for</span>
            <input
              type="number"
              value={wantAmount}
              onChange={(e) => setWantAmount(e.target.value)}
              className="flex-1 bg-[#1e293b] p-2 rounded border border-gray-700"
            />
            <span>ETH</span>
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full bg-[#1e293b] p-2 rounded border border-gray-700"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full bg-[#1e293b] p-2 rounded border border-gray-700 h-20"
          />
          <select
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="w-full bg-[#1e293b] p-2 rounded border border-gray-700"
          >
            <option>Offer expires in: 24 hours</option>
          </select>
          <button onClick={submitOffer} className="w-full bg-green-500 px-3 py-2 rounded hover:opacity-90">Submit Offer</button>
        </div>
      </section>
    </div>
  );
}

export default App;
