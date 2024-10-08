import React, { useState, Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faPoll, faShare, faVoteYea, faChartBar, faUsers, faBuilding, faGraduationCap, faLeaf, faCar, faHandshake, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import HowItWorksFlowDiag from './HowItWorksFlowDiag'
import { getUseCaseExample } from '../utils/aiUtils';
import { Dialog, Transition } from '@headlessui/react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex justify-between items-center w-full text-left font-semibold focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className="text-blue-500" />
      </button>
      {isOpen && (
        <p className="mt-2 text-gray-600">{answer}</p>
      )}
    </div>
  );
};

const UseCaseCard = ({ icon, title, description }) => {
  const [example, setExample] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateExample = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUseCaseExample(title);
      setExample(result);
      setIsOpen(true);
    } catch (err) {
      console.error('Error generating example:', err);
      setError(err.message || 'Failed to generate example. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center mb-3">
            <FontAwesomeIcon icon={icon} className="mr-2 text-blue-500 text-xl" />
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          <p className="text-gray-700 mb-4">{description}</p>
          <button
            onClick={handleGenerateExample}
            className="text-blue-500 border border-blue-500 hover:bg-blue-100 text-xs font-normal py-1 px-2 rounded"
            disabled={loading}
          >
            {loading ? 'Generating...' : '🤖 Generate Example'}
          </button>
          {error && (
            <p className="text-red-500 mt-2">{error}</p>
          )}
        </div>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Example Poll for {title}
                  </Dialog.Title>
                  <div className="mt-2">
                    <pre className="whitespace-pre-wrap text-sm text-gray-500">
                      {example}
                    </pre>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-small text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

const HowItWorks = () => {

  const useCases = [
    {
      icon: faUsers,
      title: "Community Decision Making",
      description: "Engage your community in important decisions, from choosing project priorities to deciding on event themes."
    },
    {
      icon: faBuilding,
      title: "Corporate Governance",
      description: "Facilitate transparent voting for board decisions or shareholder resolutions in a decentralized manner."
    },
    {
      icon: faGraduationCap,
      title: "Educational Surveys",
      description: "Conduct anonymous surveys in educational institutions to gather genuine feedback from students and staff."
    },
    {
      icon: faLeaf,
      title: "Environmental Initiatives",
      description: "Allow communities to vote on local environmental projects or sustainability initiatives."
    },
    {
      icon: faCar,
      title: "Product Development",
      description: "Gather customer preferences on new product features or designs through decentralized polling."
    },
    {
      icon: faHandshake,
      title: "Collaborative Decision Making",
      description: "Enable teams to make collective decisions on project directions or resource allocation."
    }
  ];

  const faqs = [
    {
      question: "Is my vote anonymous?",
      answer: "While votes are linked to wallet addresses on the blockchain for verification, the app doesn't display this information publicly. However, it's important to note that blockchain transactions are inherently traceable."
    },
    {
      question: "Do I need NeoX tokens to use this app?",
      answer: "Yes, you'll need a small amount of GAS tokens on the NeoX T4 Testnet to cover transaction fees when creating polls or voting."
    },
    {
      question: "Can I change my vote after submitting?",
      answer: "No, once a vote is recorded on the blockchain, it cannot be changed. This ensures the integrity of the polling process."
    },
    {
      question: "Is there a limit to how many options a poll can have?",
      answer: "Currently, polls are limited to a maximum of 10 options to ensure efficient gas usage and clear presentation of results."
    },
    {
      question: "How long does a poll remain active?",
      answer: "By default, polls remain active indefinitely. However, creators can set an end date when creating a poll if desired."
    },
    {
      question: "Can I create multiple polls?",
      answer: "Yes, you can create as many polls as you like, as long as you have sufficient GAS to cover the transaction fees."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">How Neo Quick Poll Works</h1>
      
      <div className="max-w-6xl mx-auto mb-8 bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-bold mb-4">Smart Contract Details 📊</h2>
          <p className="mb-4">
            This decentralized polling application is powered by a smart contract deployed on the NeoX T4 (Testnet).
          </p>
          <ul className="list-disc list-inside mb-6 space-y-2">
            <li>Contract Address: <a href="https://xt4scan.ngd.network/address/0xA3A586e410164140D9e71C8B0eD460a95A239513?tab=activity" target="_blank">0xA3A586e410164140D9e71C8B0eD460a95A239513</a></li>
            <li>Network: NeoX T4 Testnet</li>
            <li>Features: Create Polls, Cast Votes, View Results</li>
          </ul>
          
          {/* <h2 className="text-xl font-semibold mb-3">How It Works:</h2>
          <ol className="list-none space-y-4">
            <li className="flex items-center">
              <FontAwesomeIcon icon={faWallet} className="mr-2 text-blue-500" />
              Connect your MetaMask wallet to the NeoX T4 Testnet
            </li>
            <li className="flex items-center">
              <FontAwesomeIcon icon={faPoll} className="mr-2 text-green-500" />
              Create a new poll by submitting a question and options
            </li>
            <li className="flex items-center">
              <FontAwesomeIcon icon={faShare} className="mr-2 text-purple-500" />
              Share the poll ID with others to collect votes
            </li>
            <li className="flex items-center">
              <FontAwesomeIcon icon={faVoteYea} className="mr-2 text-yellow-500" />
              Cast your vote on existing polls
            </li>
            <li className="flex items-center">
              <FontAwesomeIcon icon={faChartBar} className="mr-2 text-red-500" />
              View real-time results as votes are recorded on the blockchain
            </li>
          </ol> */}
        </div>
      </div>

      <HowItWorksFlowDiag />
      <div className="max-w-6xl mx-auto mb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Use Cases 🚀</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <UseCaseCard key={index} {...useCase} />
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-8 mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-bold mb-4">❓Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;