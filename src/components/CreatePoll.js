import React, { useState, useEffect } from 'react';
import { getContract } from '../config';
import CustomAlert from './CustomAlert';

const maskAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const Button = ({ children, onClick, className }) => (
  <button onClick={onClick} className={`px-4 py-2 bg-blue-500 text-white rounded ${className}`}>{children}</button>
);

const Card = ({ children, className }) => (
  <div className={`bg-white shadow-md rounded-lg p-6 ${className}`}>{children}</div>
);

const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block mb-2 text-sm font-bold">{children}</label>
);

const DebouncedInput = ({ value: initialValue, onChange, debounceTimeout = 300, ...props }) => {
  const [value, setValue] = useState(initialValue);
  const timeoutRef = React.useRef(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceTimeout);
  };

  return (
    <input
      {...props}
      value={value}
      onChange={handleChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};

const CreatePoll = ({
  account,
  pollQuestion,
  setPollQuestion,
  pollOptions,
  setPollOptions,
  walletInfo,
  isLoading,
  handleCreatePoll,
  handleGetSuggestions,
  isLoadingSuggestions,
  error,
  setError
}) => {
  const [aiSuggestions, setAiSuggestions] = useState([]);
  
  const onSubmit = (e) => {
    e.preventDefault();
    handleCreatePoll();
  };

  const addOption = (e) => {
    e.preventDefault();
    setPollOptions([...pollOptions, '']);
  };

  const getSuggestions = async (e) => {
    e.preventDefault();
    try {
      const suggestions = await handleGetSuggestions();
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      setError('Failed to get AI suggestions. Please try again.');
    }
  };
  const isPollQuestionEmpty = pollQuestion.trim() === '';
  const tooltipText = isPollQuestionEmpty
  ? "Enter a poll question to enable AI suggestions"
  : "Get AI-generated suggestions for poll options";
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-4xl mx-auto">
      <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600">
        <h2 className="text-3xl font-bold text-center text-white">Create a New Poll on NeoX</h2>
        {walletInfo && (
          <div className="text-sm text-white mt-2 opacity-90">
            <p>Connected Wallet: <span className="font-medium">{maskAddress(walletInfo.address)}</span></p>
            <p>Balance: <span className="font-medium">{walletInfo.gasBalance} GAS</span></p>
          </div>
        )}
      </div>
      <div className="p-6">
        {error && <CustomAlert message={error} type="error" />}
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">Poll Question</label>
            <DebouncedInput
              id="question"
              value={pollQuestion}
              onChange={setPollQuestion}
              placeholder="Enter your poll question"
            />
          </div>
          {pollOptions.map((option, index) => (
            <div key={index}>
              <label htmlFor={`option-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Option {index + 1}</label>
              <DebouncedInput
                id={`option-${index}`}
                value={option}
                onChange={(newValue) => {
                  const newOptions = [...pollOptions];
                  newOptions[index] = newValue;
                  setPollOptions(newOptions);
                }}
                placeholder={`Enter option ${index + 1}`}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          >
            ➕ Add Option
          </button>
          <button
            type="button"
            onClick={getSuggestions}
            disabled={isLoadingSuggestions || isPollQuestionEmpty}
            title={tooltipText}
            className="text-xs font-medium text-blue-600 border border-blue-600 rounded-md px-3 py-1 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingSuggestions ? '⏳ Getting AI Suggestions...' : '🤖 Get AI Suggestions for Options'}
          </button>
          {isPollQuestionEmpty && (
              <p className="text-xs text-gray-500 mt-0 pt-0">Enter a poll question to enable AI suggestions</p>
          )}
          {aiSuggestions.length > 0 && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-bold mb-2 text-lg">AI Suggestions:</h3>
              <ul className="list-disc pl-5 space-y-2">
                {aiSuggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{suggestion}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = [...pollOptions, suggestion];
                        setPollOptions(newOptions);
                      }}
                      className="text-sm text-blue-500 hover:text-blue-700 focus:outline-none"
                    >
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? '⏳ Creating Poll...' : '🚀 Create Poll & Mint On-Chain'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePoll;