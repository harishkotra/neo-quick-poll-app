import React from 'react';

const HowItWorks = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold mb-4">Smart Contract Details</h1>
          <p className="mb-4">
            This decentralized polling application is powered by a smart contract deployed on the NeoX T4 Testnet.
          </p>
          <ul className="list-disc list-inside mb-6 space-y-2">
            <li>Contract Address: 0xA3A586e410164140D9e71C8B0eD460a95A239513</li>
            <li>Network: NeoX T4 Testnet</li>
            <li>Features: Create Polls, Cast Votes, View Results</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-3">How It Works:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Connect your MetaMask wallet to the NeoX T4 Testnet</li>
            <li>Create a new poll by submitting a question and options</li>
            <li>Share the poll ID with others to collect votes</li>
            <li>Cast your vote on existing polls</li>
            <li>View real-time results as votes are recorded on the blockchain</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;