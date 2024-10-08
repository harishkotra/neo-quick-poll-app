import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { Menu, Transition, Dialog } from '@headlessui/react';
import { ChevronDownIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import AppInterface from './components/AppInterface';
import HowItWorks from './components/HowItWorks';
import CreatePoll from './components/CreatePoll';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './fontawesome';
import { ethers } from 'ethers';
import { ApolloProvider } from '@apollo/client';
import client from './apollo-client';

// Function to mask wallet address
const maskAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const Header = ({ isConnected, account, onConnectWallet, onDisconnectWallet, onUnlinkWallet }) => {
  const [isUnlinkModalOpen, setIsUnlinkModalOpen] = useState(false);

  const openUnlinkModal = () => setIsUnlinkModalOpen(true);
  const closeUnlinkModal = () => setIsUnlinkModalOpen(false);

  const handleUnlink = () => {
    onUnlinkWallet();
    closeUnlinkModal();
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <FontAwesomeIcon icon="fa-solid fa-poll" className="text-2xl mr-2" />
            <Link to="/" className="text-xl font-bold">Neo Quick Poll</Link>
          </div>
          <nav className="flex items-center">
            <ul className="flex space-x-4 mr-4">
              <li><Link to="/" className="hover:text-blue-200 transition duration-150 ease-in-out">Home</Link></li>
              <li><Link to="/how-it-works" className="hover:text-blue-200 transition duration-150 ease-in-out">How It Works</Link></li>
            </ul>
            {isConnected ? (
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500">
                    {maskAddress(account)}
                    <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                  </Menu.Button>
                </div>
                <Transition
                  as={React.Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={onDisconnectWallet}
                            className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block w-full text-left px-4 py-2 text-sm`}
                          >
                            Logout
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={openUnlinkModal}
                            className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block w-full text-left px-4 py-2 text-sm text-red-600`}
                          >
                            Unlink Wallet
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <button
                onClick={onConnectWallet}
                className="flex items-center justify-center px-4 py-2 bg-[#efefef] text-[#F6851B] font-bold rounded-full transition duration-300 transform hover:scale-105 shadow-lg"
              >
                <img 
                  src="https://github.com/MetaMask/brand-resources/raw/master/SVG/SVG_MetaMask_Icon_Color.svg" 
                  alt="MetaMask Logo" 
                  className="w-5 h-5 mr-2"
                />
                Connect MetaMask
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Unlink Wallet Confirmation Modal */}
      <Dialog open={isUnlinkModalOpen} onClose={closeUnlinkModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mr-2" />
              Warning: Unlink Wallet
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-500">
              Unlinking your wallet will remove all associated data from this application. Please note:
              <ul className="list-disc list-inside mt-2">
                <li>This action is not reversible.</li>
                <li>Polls you've created cannot be deleted from the blockchain.</li>
                <li>All your created polls will be removed from your account in this application.</li>
              </ul>
            </Dialog.Description>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={closeUnlinkModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                onClick={handleUnlink}
              >
                Unlink Wallet
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-gray-800 text-white py-8">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <p className="text-lg">&copy; 2024 Neo Quick Poll. It's all on-chain!</p>
      {/* <div className="mt-4 flex justify-center space-x-6">
        <a href="#" className="text-gray-400 hover:text-white transition duration-150 ease-in-out">
          <FontAwesomeIcon icon="fa-brands fa-twitter" size="lg" />
        </a>
        <a href="#" className="text-gray-400 hover:text-white transition duration-150 ease-in-out">
          <FontAwesomeIcon icon="fa-brands fa-github" size="lg" />
        </a>
        <a href="#" className="text-gray-400 hover:text-white transition duration-150 ease-in-out">
          <FontAwesomeIcon icon="fa-brands fa-discord" size="lg" />
        </a>
      </div> */}
    </div>
  </footer>
);

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletInfo, setWalletInfo] = useState(null);

  useEffect(() => {
    checkWalletConnection();
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet();
    } else {
      // User switched to a different account
      setAccount(accounts[0]);
      setIsConnected(true);
    }
  };

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setIsConnected(true);
          setAccount(accounts[0].address);
        }
      } catch (err) {
        console.error('Failed to check wallet connection:', err);
      }
    }
  };

  const onConnectWallet = (address) => {
    setAccount(address);
    setIsConnected(true);
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        setIsConnected(true);
      } catch (err) {
        console.error('Failed to connect wallet:', err);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount('');
    setIsLoggedIn(false);
    setWalletInfo(null);
  };

  const unlinkWallet = () => {
    setIsConnected(false);
    setAccount('');
    localStorage.removeItem('walletConnected');
    //console.log('Wallet unlinked and all associated data removed');
  };

  // Wrapper component to check for wallet connection
  const ProtectedRoute = ({ children }) => {
    if (!isConnected) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <ApolloProvider client={client}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header 
            isConnected={isConnected} 
            account={account}
            onConnectWallet={connectWallet} 
            onDisconnectWallet={disconnectWallet} 
            onUnlinkWallet={unlinkWallet}
          />
          <main className="flex-grow bg-gray-100">
            <Routes>
              <Route path="/" element={
                <AppInterface 
                  isConnected={isConnected} 
                  account={account} 
                  onConnectWallet={connectWallet}
                  onDisconnectWallet={disconnectWallet}
                />
              } />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/create-poll" element={
                <ProtectedRoute>
                  <CreatePoll 
                    account={account}
                    // Pass other necessary props here
                  />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;