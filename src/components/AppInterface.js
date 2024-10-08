import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getContract } from '../config.js';
import { v4 as uuidv4 } from 'uuid';
import { Tab } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery, gql } from '@apollo/client';
import { faSpinner, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import VoteButton from './VoteButton';
import { getAISuggestions } from '../utils/aiUtils';
import CreatePoll from './CreatePoll';

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
      createdAt
    }
    votes(first: 100) {
      id
      poll {
        id
      }
      voter
      option
    }
  }
`;

// const VOTE_MUTATION = gql`
//   mutation Vote($pollId: String!, $option: String!) {
//     vote(pollId: $pollId, option: $option) {
//       id
//       poll {
//         id
//       }
//       voter
//       option
//     }
//   }
// `;

const CustomAlert = ({ message, type = 'error' }) => (
  <div className={`p-4 mb-4 text-sm rounded-lg ${type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`} role="alert">
    <span className="font-medium">{type === 'error' ? 'Error! ' : 'Success! '}</span>{message}
  </div>
);

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-md ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white flex items-center`}>
      <FontAwesomeIcon 
        icon={type === 'success' ? faCheckCircle : faExclamationCircle} 
        className="mr-2"
      />
      {message}
    </div>
  );
};

const AppInterface = ({ isConnected, account, onConnectWallet, onDisconnectWallet }) => {
  //const [account, setAccount] = useState('');
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
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const NEOX_T4_CHAIN_ID = '0xba9304'; //current deployed smart contract for neo quick poll
  
  const fetchWalletInfo = useCallback(async (address) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      const gasBalance = ethers.formatEther(balance);
      
      setWalletInfo({ address, gasBalance });
      //console.log('Wallet Info:', { address, gasBalance: gasBalance + ' GAS' });
    } catch (err) {
      console.error('Error fetching wallet info:', err);
      setError('Failed to fetch wallet info');
    }
  }, []);

  useEffect(() => {
    if (isConnected && account) {
      fetchWalletInfo(account);
    }
  }, [isConnected, account, fetchWalletInfo]);

  const checkWalletConnection = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        if (network.chainId.toString(16) === NEOX_T4_CHAIN_ID.slice(2)) {
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            await fetchWalletInfo(accounts[0].address);
          } else {
            onDisconnectWallet();
          }
        } else {
          setError('Please switch to the NeoX T4 Testnet in MetaMask');
          onDisconnectWallet();
        }
      } catch (err) {
        console.error('Failed to check wallet connection:', err);
        onDisconnectWallet();
      }
    }
  }, [NEOX_T4_CHAIN_ID, fetchWalletInfo, onDisconnectWallet]);

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
        
        // Instead of setting the account directly, we'll call the onConnectWallet prop
        onConnectWallet(address);
        
        setError('');
        setSuccess('Wallet connected successfully');
        await fetchWalletInfo(address);
      } catch (err) {
        setError('Failed to connect wallet to NeoX T4 Testnet');
        console.error(err);
      }
    } else {
      setError('Please install MetaMask');
    }
  };

  const handleLogout = () => {
    // Call the onDisconnectWallet prop to handle account and connection state in the parent
    onDisconnectWallet();
  
    // Reset local component state
    setPollQuestion('');
    setPollOptions(['', '']);
    setError('');
    setSuccess('');
    setWalletInfo(null);
    // If you're managing existingPolls in this component, uncomment the next line
    // setExistingPolls([]);
  };

  const handleCreatePoll = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
  
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const contract = await getContract();
      
      if (!pollQuestion.trim()) {
        throw new Error('Please enter a poll question.');
      }
      const validOptions = pollOptions.filter(option => option.trim() !== '');
      if (validOptions.length < 2) {
        throw new Error('Please provide at least two non-empty options');
      }
  
      // Generate a unique pollId
      const pollId = uuidv4();
  
      // Call the createPoll function on the smart contract
      const tx = await contract.createPoll(pollId, pollQuestion, validOptions);
      //console.log('Transaction sent:', tx.hash);
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

    } catch (err) {
      console.error('Error creating poll:', err);
      setError('Failed to create poll: ' + (err.reason || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetSuggestions = async () => {
    if (!pollQuestion) {
      alert('Please enter a poll question first.');
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const suggestions = await getAISuggestions(pollQuestion);
      setIsLoadingSuggestions(false);
      return suggestions;
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      alert('Failed to get AI suggestions. Please try again.');
    } finally {
      setIsLoadingSuggestions(false);
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

  const ExistingPolls = ({ isLoggedIn, account }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [votingPollId, setVotingPollId] = useState(null);
    const [localPolls, setLocalPolls] = useState([]);
    const { loading, error, data, refetch } = useQuery(GET_POLLS, {
      onCompleted: (fetchedData) => {
        setLocalPolls(fetchedData.polls);
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
  
    const handleVoteSuccess = ({ pollId, option }) => {
      setLocalPolls(prevPolls => 
        prevPolls.map(poll => {
          if (poll.id === pollId) {
            const updatedVotes = [...poll.votes];
            const optionIndex = poll.options.indexOf(option);
            if (optionIndex !== -1) {
              updatedVotes[optionIndex] += 1;
            }
            return { ...poll, votes: updatedVotes };
          }
          return poll;
        })
      );
      setVotingPollId(null);
    };
  
    const handleVoteStart = (pollId) => {
      setVotingPollId(pollId);
    };
  
    const hasVotedOnPoll = (pollId) => {
      if (!data || !data.votes || !account) return false;
      return data.votes.some(vote => vote.poll.id === pollId && vote.voter.toLowerCase() === account.toLowerCase());
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
  
    if (!localPolls || localPolls.length === 0) {
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
          {localPolls.map((poll) => {
            const userHasVoted = hasVotedOnPoll(poll.id);
            return (
              <div key={poll.id} className="border p-4 rounded">
                <h3 className="text-xl font-semibold mb-2">{poll.question}</h3>
                <ul>
                  {poll.options.map((option, index) => (
                    <li key={index} className="flex justify-between items-center mb-2">
                      <span>{option}: {poll.votes[index]} votes</span>
                      <VoteButton
                        pollId={poll.id}
                        option={option}
                        isConnected={isLoggedIn}
                        onVoteSuccess={handleVoteSuccess}
                        hasVoted={userHasVoted}
                        isVoting={votingPollId === poll.id}
                        onVoteStart={handleVoteStart}
                      />
                    </li>
                  ))}
                </ul>
                {poll.createdAt && (
                  <p className="text-sm text-gray-500 mt-2">
                    Created at: {new Date(parseInt(poll.createdAt) * 1000).toLocaleString()}
                  </p>
                )}
              </div>
            );
          })}
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
      {isConnected ? (
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
                <CreatePoll
                  account={account}
                  pollQuestion={pollQuestion}
                  setPollQuestion={setPollQuestion}
                  pollOptions={pollOptions}
                  setPollOptions={setPollOptions}
                  walletInfo={walletInfo}
                  isLoading={isLoading}
                  handleCreatePoll={handleCreatePoll}
                  handleGetSuggestions={handleGetSuggestions}
                  isLoadingSuggestions={isLoadingSuggestions}
                  error={error}
                  setError={setError}
                />
              </Tab.Panel>
              <Tab.Panel>
                <ExistingPolls isLoggedIn={isConnected} account={account} />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      ) : (
        <AppInfo connectWallet={onConnectWallet} />
      )}
      {showConfirmation && <ConfirmationModal />}
    </div>
  );
};
const Feature = ({ title, description }) => (
  <div className="flex items-center p-4 bg-white rounded-lg shadow-md">
    {/* <i className={`${icon} text-3xl text-blue-500 mr-4`}></i> */}
    <div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

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
          <div className="grid md:grid-cols-2 gap-6">
              <Feature
                title="📊 Real-time Results"
                description="Instantly view poll outcomes as votes are cast on the blockchain."
              />
              <Feature
                title="🔒 Secure Voting"
                description="Leverage NeoX's robust security for tamper-proof polling."
              />
              <Feature
                title="👥 Community Engagement"
                description="Foster active participation in the NeoX ecosystem's governance."
              />
              <Feature
                title="⚡ Efficient Decision-Making"
                description="Streamline consensus-building for faster project evolution."
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Why Neo Quick Poll Matters:</h3>
              <ul className="space-y-2">
                <li>
                  <FontAwesomeIcon icon="fa-solid fa-check-circle" className="text-green-500 mr-2" />
                  Enhances transparency in the NeoX ecosystem
                </li>
                <li>
                  <FontAwesomeIcon icon="fa-solid fa-check-circle" className="text-green-500 mr-2" />
                  Provides a testbed for decentralized governance models
                </li>
                <li>
                  <FontAwesomeIcon icon="fa-solid fa-check-circle" className="text-green-500 mr-2" />
                  Encourages community-driven development and decision-making
                </li>
              </ul>
            </div>

            <div className="text-center mt-8">
              <button 
                onClick={() => {/* Add navigation logic here */}}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
              >
                Learn How It Works
              </button>
              <p className="mt-2 text-sm text-gray-600">
                Discover how to use Neo Quick Poll on the NeoX T4 (Testnet)
              </p>
            </div>
          </div>
        </div>
        <div className="mt-12 bg-gradient-to-r from-[#F6851B] to-[#E2761B] rounded-lg shadow-xl overflow-hidden">
          <div className="p-8 flex flex-col items-center justify-center">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
            <button 
              onClick={connectWallet} 
              className="flex items-center justify-center px-8 py-4 bg-white text-[#F6851B] font-bold rounded-full hover:bg-gray-100 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
            >
              <img 
                src="https://github.com/MetaMask/brand-resources/raw/master/SVG/SVG_MetaMask_Icon_Color.svg" 
                alt="MetaMask Logo" 
                className="w-6 h-6 mr-2"
              />
              Connect MetaMask
            </button>
            <p className="mt-4 text-sm text-white">
              Connect your MetaMask wallet to start creating and participating in decentralized polls on the NeoX T4 Testnet!
            </p>
          </div>
        </div>
            {/* <div className="bg-blue-50 p-6 rounded-lg shadow-inner">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">NeoX T4 Testnet Details:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center"><i className="fas fa-network-wired text-blue-500 mr-2"></i> TestNet: NeoX T4</li>
                <li className="flex items-center"><i className="fas fa-fingerprint text-blue-500 mr-2"></i> Chain ID: 12227332</li>
                <li className="flex items-center"><i className="fas fa-link text-blue-500 mr-2"></i> RPC Endpoint: https://neoxt4seed1.ngd.network</li>
                <li className="flex items-center"><i className="fas fa-coins text-blue-500 mr-2"></i> Currency Symbol: GAS</li>
              </ul>
            </div> */}
    </div>
  </div>
);

export default AppInterface;