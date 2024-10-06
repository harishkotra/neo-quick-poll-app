import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getContract } from '../config.js';
import { v4 as uuidv4 } from 'uuid';
import { Tab } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery, gql } from '@apollo/client';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const Button = ({ children, onClick, className }) => (
  <button onClick={onClick} className={`px-4 py-2 bg-blue-500 text-white rounded ${className}`}>{children}</button>
);

const Card = ({ children, className }) => (
  <div className={`bg-white shadow-md rounded-lg p-6 ${className}`}>{children}</div>
);

// const Input = ({ id, value, onChange, placeholder }) => (
//   <input
//     id={id}
//     value={value}
//     onChange={onChange}
//     placeholder={placeholder}
//     className="w-full px-3 py-2 border rounded"
//   />
// );

const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block mb-2 text-sm font-bold">{children}</label>
);

const GET_POLLS = gql`
  query GetPolls {
    polls(first: 5) {
        id
        question
        options
        votes
    }
    votes(first: 5) {
        id
        poll {
        id
        }
        voter
        option
    }
  }
`;

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

const CustomAlert = ({ message, type = 'error' }) => (
  <div className={`p-4 mb-4 text-sm rounded-lg ${type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`} role="alert">
    <span className="font-medium">{type === 'error' ? 'Error! ' : 'Success! '}</span>{message}
  </div>
);

const AppInterface = () => {
  const [account, setAccount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletInfo, setWalletInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [existingPolls, setExistingPolls] = useState([]);

  const NEOX_T4_CHAIN_ID = '0xba9304'; // Hexadecimal representation of 12227332

  const fetchWalletInfo = useCallback(async (address) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      const gasBalance = ethers.formatEther(balance);
      
      setWalletInfo({ address, gasBalance });
      console.log('Wallet Info:', { address, gasBalance: gasBalance + ' GAS' });
    } catch (err) {
      console.error('Error fetching wallet info:', err);
      setError('Failed to fetch wallet info');
    }
  }, []);

  const checkWalletConnection = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        if (network.chainId.toString(16) === NEOX_T4_CHAIN_ID.slice(2)) {
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0].address);
            setIsLoggedIn(true);
            await fetchWalletInfo(accounts[0].address);
            //await fetchExistingPolls();
          } else {
            setIsLoggedIn(false);
            setAccount('');
            setWalletInfo(null);
          }
        } else {
          setError('Please switch to the NeoX T4 Testnet in MetaMask');
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error('Failed to check wallet connection:', err);
        setIsLoggedIn(false);
        setAccount('');
        setWalletInfo(null);
      }
    }
  }, [NEOX_T4_CHAIN_ID, fetchWalletInfo]);

  useEffect(() => {
    checkWalletConnection();
  }, [checkWalletConnection]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();

        if (network.chainId.toString(16) !== NEOX_T4_CHAIN_ID.slice(2)) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: NEOX_T4_CHAIN_ID }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: NEOX_T4_CHAIN_ID,
                  chainName: 'NeoX T4 Testnet',
                  nativeCurrency: { name: 'GAS', symbol: 'GAS', decimals: 18 },
                  rpcUrls: ['https://neoxt4seed1.ngd.network'],
                  blockExplorerUrls: ['https://xt4scan.ngd.network/'],
                }],
              });
            } else {
              throw switchError;
            }
          }
        }

        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        setIsLoggedIn(true);
        setError('');
        setSuccess('Wallet connected successfully');
        await fetchWalletInfo(address);
        //await fetchExistingPolls();
      } catch (err) {
        setError('Failed to connect wallet to NeoX T4 Testnet');
        console.error(err);
      }
    } else {
      setError('Please install MetaMask');
    }
  };

  const logout = () => {
    setAccount('');
    setIsLoggedIn(false);
    setPollQuestion('');
    setPollOptions(['', '']);
    setError('');
    setSuccess('');
    setWalletInfo(null);
    //setExistingPolls([]);
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const contract = await getContract();
  
      // Remove any empty options
      const validOptions = pollOptions.filter(option => option.trim() !== '');
  
      if (validOptions.length < 2) {
        setError('Please provide at least two non-empty options');
        setIsLoading(false);
        return;
      }
  
      // Generate a unique pollId
      const pollId = uuidv4();
  
      // Call the createPoll function on the smart contract
      const tx = await contract.createPoll(pollId, pollQuestion, validOptions);
      console.log('Transaction sent:', tx.hash);
      setTransactionHash(tx.hash);
      
      // Wait for the transaction to be mined
      await tx.wait();
      console.log('Poll created successfully on NeoX T4');
  
      // Show confirmation
      setShowConfirmation(true);
      setSuccess('Poll created successfully');
  
      // Reset form
      setPollQuestion('');
      setPollOptions(['', '']);

      // Fetch updated polls
      //await fetchExistingPolls();
    } catch (err) {
      console.error('Error creating poll:', err);
      setError('Failed to create poll: ' + (err.reason || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionChange = (newValue) => {
    setPollQuestion(newValue);
  };

  const handleOptionChange = (index, newValue) => {
    const newOptions = [...pollOptions];
    newOptions[index] = newValue;
    setPollOptions(newOptions);
  };

  const addOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  // const fetchExistingPolls = async () => {
  //   try {
  //     const contract = await getContract();
  //     const pollCount = await contract.getPollCount();
  //     const polls = [];

  //     for (let i = 0; i < pollCount; i++) {
  //       const pollId = await contract.getPollIdByIndex(i);
  //       const poll = await contract.getPoll(pollId);
  //       polls.push({
  //         id: pollId,
  //         question: poll.question,
  //         options: poll.options,
  //         votes: poll.votes.map(v => v.toNumber())
  //       });
  //     }

  //     setExistingPolls(polls);
  //   } catch (err) {
  //     console.error('Error fetching existing polls:', err);
  //     setError('Failed to fetch existing polls');
  //   }
  // };

  const CreatePoll = () => (
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
      <form onSubmit={handleCreatePoll}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="question">Poll Question</Label>
            <DebouncedInput
              id="question"
              value={pollQuestion}
              onChange={handleQuestionChange}
              placeholder="Enter your poll question"
            />
          </div>
          {pollOptions.map((option, index) => (
            <div key={index}>
              <Label htmlFor={`option-${index}`}>Option {index + 1}</Label>
              <DebouncedInput
                id={`option-${index}`}
                value={option}
                onChange={(newValue) => handleOptionChange(index, newValue)}
                placeholder={`Enter option ${index + 1}`}
              />
            </div>
          ))}
          <Button type="button" onClick={addOption} className="mr-2">
            Add Option
          </Button>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Poll...' : 'Create Poll on NeoX T4'}
          </Button>
        </div>
      </form>
    </Card>
  );

  const ExistingPolls = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { loading, error, data, refetch } = useQuery(GET_POLLS, {
      onCompleted: () => {
        if (error) {
          console.log('Data loaded successfully, clearing previous error');
        }
        setIsRefreshing(false);
      },
      onError: (error) => {
        console.error('GraphQL error:', error);
        setIsRefreshing(false);
      },
      fetchPolicy: 'network-only',
    });
  
    useEffect(() => {
      refetch();
    }, [refetch]);
  
    const handleRefresh = () => {
      setIsRefreshing(true);
      refetch();
    };
  
    if (loading && !isRefreshing) return <Card><p className="text-center">Loading polls...</p></Card>;
    
    if (error) {
      console.error('Error details:', error);
      return (
        <Card>
          <p className="text-red-500">Error loading polls: {error.message}</p>
          <Button onClick={handleRefresh} className="mt-4">
            {isRefreshing ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Refreshing...
              </>
            ) : (
              'Try Again'
            )}
          </Button>
        </Card>
      );
    }
  
    if (!data || !data.polls || data.polls.length === 0) {
      return (
        <Card>
          <p className="text-center">No polls found. Create a new poll to get started!</p>
        </Card>
      );
    }
  
    return (
      <Card>
        <h2 className="text-2xl font-bold mb-4">Existing Polls</h2>
        <div className="space-y-4">
          {data.polls.map((poll) => (
            <div key={poll.id} className="border p-4 rounded">
              <h3 className="text-xl font-semibold mb-2">{poll.question}</h3>
              <ul>
                {poll.options.map((option, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{option}</span>
                    <span>{poll.votes[index]} votes</span>
                  </li>
                ))}
              </ul>
              {poll.createdAt && (
                <p className="text-sm text-gray-500 mt-2">
                  Created at: {new Date(parseInt(poll.createdAt) * 1000).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
        <Button 
          onClick={handleRefresh} 
          className="mt-4 inline-flex items-center justify-center"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              Refreshing...
            </>
          ) : (
            'Refresh Polls'
          )}
        </Button>
      </Card>
    );
  };

  const ConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <Card className="w-[400px]">
        <h3 className="text-xl font-bold mb-4">Poll Created Successfully!</h3>
        <p className="mb-2">Your poll has been created on the NeoX T4 network.</p>
        <p className="mb-4">Transaction Hash: {transactionHash}</p>
        <p className="mb-4">
          You can verify this transaction on the{' '}
          <a
            href={`https://xt4scan.ngd.network/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            NeoX T4 Block Explorer
          </a>
        </p>
        <Button onClick={() => setShowConfirmation(false)} className="w-full">
          Close
        </Button>
      </Card>
    </div>
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {isLoggedIn ? (
        <div className="w-full max-w-4xl">
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-4">
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
                  ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
                }
              >
                Create Poll
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700
                  ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
                }
              >
                Existing Polls
              </Tab>
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
                <CreatePoll />
              </Tab.Panel>
              <Tab.Panel>
                <ExistingPolls />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      ) : (
        <AppInfo connectWallet={connectWallet} />
      )}
      {error && <CustomAlert message={error} type="error" />}
      {success && <CustomAlert message={success} type="success" />}
      {showConfirmation && <ConfirmationModal />}
    </div>
  );
};

const AppInfo = ({ connectWallet }) => (
  <div className="bg-gray-100 min-h-screen">
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
        <div className="relative h-64 bg-gradient-to-br from-blue-400 to-indigo-600">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <h1 className="text-4xl font-bold text-center">Neo Quick Poll</h1>
            <p className="text-xl mt-2 text-center">Empowering Decentralized Decision-Making</p>
          </div>
        </div>
        
        <div className="p-8 space-y-8">
          <p className="text-center text-gray-700 text-lg">
            Neo Quick Poll brings the power of blockchain-based voting to the NeoX ecosystem, 
            enabling transparent and secure community-driven decisions.
          </p>
          
          <div className="text-center">
            <button 
              onClick={connectWallet} 
              className="px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
            >
              <FontAwesomeIcon icon="fa-ethereum" className="mr-2" /> Connect MetaMask to NeoX T4
            </button>
            <p className="mt-4 text-sm text-gray-600">
              Connect your MetaMask wallet to start creating and participating in decentralized polls on the NeoX T4 Testnet!
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AppInterface;