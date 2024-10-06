import React, { useState, useEffect } from 'react';
import { getContract } from '../config';
import CustomAlert from './CustomAlert';

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
      className="w-full px-3 py-2 border rounded"
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

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Create a New Poll on NeoX</h2>
      </div>
      {walletInfo && (
        <div className="mb-4">
          <p>Connected: {walletInfo.address}</p>
          <p>Balance: {walletInfo.gasBalance} GAS</p>
        </div>
      )}
      {error && <CustomAlert message={error} type="error" />}
      <form onSubmit={onSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="question">Poll Question</Label>
            <input
              id="question"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="Enter your poll question"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          {pollOptions.map((option, index) => (
            <div key={index}>
              <Label htmlFor={`option-${index}`}>Option {index + 1}</Label>
              <input
                id={`option-${index}`}
                value={option}
                onChange={(e) => {
                  const newOptions = [...pollOptions];
                  newOptions[index] = e.target.value;
                  setPollOptions(newOptions);
                }}
                placeholder={`Enter option ${index + 1}`}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          ))}
          <Button type="button" onClick={addOption} className="mr-2">
            Add Option
          </Button>
          <Button
            type="button"
            onClick={getSuggestions}
            disabled={isLoadingSuggestions}
            className="w-full mb-2"
          >
            {isLoadingSuggestions ? 'Getting AI Suggestions...' : 'Get AI Suggestions for Options'}
          </Button>
          
          {aiSuggestions.length > 0 && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-bold mb-2">AI Suggestions:</h3>
              {<ul className="list-disc pl-5">
                {aiSuggestions.map((suggestion, index) => (
                  <li key={index} className="mb-1">
                    {suggestion}
                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = [...pollOptions];
                        newOptions.push(suggestion);
                        setPollOptions(newOptions);
                      }}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      Add
                    </button>
                  </li>
                ))}
              </ul>}
              {/* <pre className="whitespace-pre-wrap text-sm">{aiSuggestions}</pre> */}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Poll...' : 'Create Poll on NeoX T4'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CreatePoll;