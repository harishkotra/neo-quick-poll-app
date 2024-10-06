import React from 'react';
import { useQuery, gql } from '@apollo/client';

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

const PollList = () => {
  const { loading, error, data } = useQuery(GET_POLLS, {
    onError: (error) => {
      console.error('GraphQL error:', error);
    }
  });

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error('Error details:', error);
    return <p>Error: {error.message}</p>;
  }

  if (!data || !data.polls) {
    return <p>No polls data available</p>;
  }

  return (
    <div>
      {data.polls.map((poll) => (
        <div key={poll.id}>
          <h3>{poll.question}</h3>
          <ul>
            {poll.options.map((option, index) => (
              <li key={index}>
                {option}: {poll.votes[index]} votes
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default PollList;