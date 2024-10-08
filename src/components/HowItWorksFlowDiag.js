import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faPoll, faShare, faVoteYea, faChartBar } from '@fortawesome/free-solid-svg-icons';

const FlowStep = ({ icon, text, isActive, onClick }) => (
  <div 
    className={`flex flex-col items-center p-4 rounded-lg transition-all duration-300 cursor-pointer ${
      isActive ? 'bg-blue-100 scale-105' : 'bg-gray-100 hover:bg-gray-200'
    }`}
    onClick={onClick}
  >
    <FontAwesomeIcon icon={icon} className={`text-3xl mb-2 ${isActive ? 'text-blue-500' : 'text-gray-600'}`} />
    <p className={`text-center ${isActive ? 'text-blue-700 font-semibold' : 'text-gray-700'}`}>{text}</p>
  </div>
);

const HowItWorksFlowDiag = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { icon: faWallet, text: "Connect your MetaMask wallet to the NeoX T4 Testnet" },
    { icon: faPoll, text: "Create a new poll by submitting a question and options" },
    { icon: faShare, text: "Share the poll ID with others to collect votes" },
    { icon: faVoteYea, text: "Cast your vote on existing polls" },
    { icon: faChartBar, text: "View real-time results as votes are recorded on the blockchain" }
  ];

  return (
    <div className="max-w-6xl mx-auto mb-8 bg-white shadow-lg rounded-lg overflow-hidden p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {steps.map((step, index) => (
          <FlowStep
            key={index}
            icon={step.icon}
            text={step.text}
            isActive={index === activeStep}
            onClick={() => setActiveStep(index)}
          />
        ))}
      </div>
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Step {activeStep + 1}:</h3>
        <p>{steps[activeStep].text}</p>
        <p className="mt-2 text-sm text-gray-600">
          {activeStep === 0 && "Ensure you have MetaMask installed and set up with the NeoX T4 Testnet."}
          {activeStep === 1 && "Think of a question and provide multiple options for voters to choose from."}
          {activeStep === 2 && "Use social media or messaging apps to distribute your poll ID to participants."}
          {activeStep === 3 && "Select your preferred option in an existing poll and confirm the transaction."}
          {activeStep === 4 && "Watch as the results update in real-time with each new vote cast."}
        </p>
      </div>
    </div>
  );
};

export default HowItWorksFlowDiag;