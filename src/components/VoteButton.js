import React, { useState } from 'react';
import { ethers } from 'ethers';
import { gql } from '@apollo/client';
import { getContract } from '../config';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ConfirmationDialog = ({ isOpen, onClose, message, isError }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <h3 className={`text-lg font-medium mb-4 ${isError ? 'text-red-600' : 'text-green-600'}`}>
            {isError ? 'Error' : 'Vote Recorded'}
          </h3>
          <p className="mb-4">{message}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    );
};

const VoteButton = ({ pollId, option, isConnected, onVoteSuccess, hasVoted, isVoting, onVoteStart }) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [isError, setIsError] = useState(false);
  
    console.log(`VoteButton Debug - pollId: ${pollId}, isConnected: ${isConnected}, hasVoted: ${hasVoted}, isVoting: ${isVoting}`);
  
    const handleVote = async () => {
      if (!isConnected) {
        setConfirmationMessage('Please connect your wallet to vote.');
        setIsError(true);
        setShowConfirmation(true);
        return;
      }
  
      if (hasVoted) {
        setConfirmationMessage('You have already voted on this poll.');
        setIsError(true);
        setShowConfirmation(true);
        return;
      }
  
      onVoteStart(pollId);
  
      try {
        const contract = await getContract();
        const tx = await contract.vote(pollId, option);
        await tx.wait();
  
        setConfirmationMessage(`Your vote for "${option}" has been recorded successfully!`);
        setIsError(false);
        setShowConfirmation(true);
        onVoteSuccess({ pollId, option });
      } catch (error) {
        console.error('Error voting:', error);
        if (error.message.includes('Already voted')) {
          setConfirmationMessage('You have already voted on this poll.');
        } else {
          setConfirmationMessage('Failed to vote. Please try again.');
        }
        setIsError(true);
        setShowConfirmation(true);
      } finally {
        onVoteStart(null); // Reset voting state
      }
    };
  
    return (
      <>
        <button
          onClick={handleVote}
          disabled={isVoting || !isConnected || hasVoted}
          className={`px-4 py-2 text-white rounded ${
            hasVoted
              ? 'bg-gray-400 cursor-not-allowed'
              : isVoting
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400'
          }`}
        >
          {isVoting ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : hasVoted ? (
            'Voted'
          ) : (
            'Vote'
          )}
        </button>
        <ConfirmationDialog
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          message={confirmationMessage}
          isError={isError}
        />
      </>
    );
  };

export default VoteButton;