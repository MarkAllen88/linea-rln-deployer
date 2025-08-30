import { useState } from 'react';

function App() {
  const [epoch, setEpoch] = useState('-');
  const [proofAddress, setProofAddress] = useState('');

  const getCurrentEpoch = async () => {
    // Your logic to fetch epoch from contract (using ethers)
    // For now, mock it
    setEpoch(Math.floor(Date.now() / 1000).toString());
  };

  const sendTransaction = async () => {
    // Your logic to send tx with proof/address
    console.log('Sending:', proofAddress);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8">
      {/* Header */}
      <h1 className="text-3xl font-bold text-[--accent] flex items-center">
        <span className="mr-2">🚀</span> RLN Demo (Linea Sepolia)
      </h1>

      {/* Read-only Info Card */}
      <div className="w-full max-w-md bg-[--secondary] rounded-lg shadow-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-[--text]">Read-only Info</h2>
        <div className="flex items-center justify-between">
          <button
            onClick={getCurrentEpoch}
            className="bg-[--accent] text-[--text] px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Get Current Epoch
          </button>
          <p className="text-[--text]">Epoch: {epoch}</p>
        </div>
      </div>

      {/* Send Transaction Card */}
      <div className="w-full max-w-md bg-[--secondary] rounded-lg shadow-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-[--text]">Send a transaction (optional)</h2>
        <input
          type="text"
          value={proofAddress}
          onChange={(e) => setProofAddress(e.target.value)}
          placeholder="Proof / address"
          className="w-full bg-gray-800 text-[--text] px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:border-[--accent]"
        />
        <button
          onClick={sendTransaction}
          className="w-full bg-[--success] text-[--text] px-4 py-2 rounded-md hover:bg-green-600 transition"
        >
          Submit
        </button>
      </div>

      {/* Placeholder for Wallet Status (like Veri) */}
      <div className="w-full max-w-md bg-[--secondary] rounded-lg shadow-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-[--text]">Wallet Status</h2>
        {/* Add connect button and balances here as in previous code */}
        <div className="bg-[--warning] text-[--text] p-2 rounded-md">Need More Funding - Get testnet coins</div>
      </div>

      {/* Placeholder for Waku Connection */}
      <div className="w-full max-w-md bg-[--secondary] rounded-lg shadow-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-[--text]">Connection Status</h2>
        <button className="bg-[--accent] text-[--text] px-4 py-2 rounded-md">Connect to Waku</button>
        <div className="bg-[--error] text-[--text] p-2 rounded-md">Error: Waku initialization failed</div>
      </div>

      {/* Placeholder for Create Offer */}
      <div className="w-full max-w-md bg-[--secondary] rounded-lg shadow-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-green-400">Create Value Exchange</h2>
        {/* Add form fields here as in previous code */}
      </div>
    </div>
  );
}

export default App;
