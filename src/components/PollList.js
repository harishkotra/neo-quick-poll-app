import React from 'react';
import { useQuery, gql } from '@apollo/client';
import VoteButton from './VoteButton';

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

const PollList = ({ isConnected, account }) => {
  const { loading, error, data, refetch } = useQuery(GET_POLLS, {
    onError: (error) => {
      console.error('GraphQL error:', error);
    }
  });

  const handleVoteSuccess = () => {
    refetch();
  };

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error('Error details:', error);
    return <p>Error: {error.message}</p>;
  }

  if (!data || !data.polls) {
    return <p>No polls data available</p>;
  }

  return (
    <div className="space-y-6">
      {data.polls.map((poll) => (
        <div key={poll.id} className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">{poll.question}</h3>
          <ul className="space-y-2">
            {poll.options.map((option, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{option}: {poll.votes[index]} votes</span>
                <VoteButton
                  pollId={poll.id}
                  option={option}
                  isConnected={isConnected}
                  onVoteSuccess={handleVoteSuccess}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default PollList;