import React, { useState } from 'react';
import { getContract } from '../config';

const CreatePoll = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [createdPollId, setCreatedPollId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setCreatedPollId(null);

    if (!question || !options) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const contract = await getContract();
      const optionsArray = options.split(',').map(option => option.trim());
      
      const pollId = 'poll_' + Date.now();

      console.log("Calling createPoll with args:", pollId, question, optionsArray);
      
      const tx = await contract.createPoll(pollId, question, optionsArray);
      const receipt = await tx.wait();
      
      console.log("Transaction receipt:", receipt);

      // Check for PollCreated event
      const event = receipt.logs.find(log => log.event === 'PollCreated');
      if (event) {
        console.log("Poll created event:", event);
        setCreatedPollId(event.args.pollId);
      }

      setSuccess(true);
      setQuestion('');
      setOptions('');
    } catch (err) {
      console.error("Error details:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-4">Create a New Poll</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="question">
            Question
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="question"
            type="text"
            placeholder="Enter your question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="options">
            Options (comma-separated)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="options"
            type="text"
            placeholder="Option 1, Option 2, Option 3"
            value={options}
            onChange={(e) => setOptions(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Poll"}
          </button>
        </div>
      </form>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4" role="alert">
          <span className="block sm:inline">Poll created successfully!</span>
          {createdPollId && (
            <p className="mt-2">Poll ID: {createdPollId}</p>
          )}
          <p className="mt-2">You can now share this poll with others to start collecting votes.</p>
        </div>
      )}
    </div>
  );
};

export default CreatePoll;