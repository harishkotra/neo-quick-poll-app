// src/utils/aiUtils.js
import axios from 'axios';

//const API_URL = 'https://llama.us.gaianet.network/v1/chat/completions';

export const getAISuggestions = async (question) => {
  try {
    console.log(question);
    const response = await axios.post(
      'https://llama.us.gaianet.network/v1/chat/completions',
      {
        model: 'llama',
        messages: [
          { role: 'system', content: "You are an assistant that generates poll options. When given a poll question, respond only with a numbered list of 4-6 potential options. Do not include any other text or explanations. Each option should be concise and directly related to the question. Format your response as a simple numbered list, with each option on a new line." },
          { role: 'user', content: `Generate poll options for the following question: "${question}"` }
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const suggestions = response.data.choices[0].message.content
      .split('\n')
      .filter(option => option.trim() !== '')
      .map(option => option.replace(/^\d+\.\s*/, '').trim());

    return suggestions;
  } catch (error) {
    console.error('Error calling AI API:', error);
    throw error;
  }
};

/**
 * 
 * @param {string} useCase 
 * @returns example polls and options for each poll based on the use case passed to it. Used in the HowItWorks.js page.
 */
export const getUseCaseExample = async (useCase) => {
  try {
    const response = await axios.post(
      'https://llama.us.gaianet.network/v1/chat/completions',
      {
        model: 'llama',
        messages: [
          { role: 'system', content: "You are an assistant that generates example polls for specific use cases. When given a use case, respond with a relevant poll question and 4-6 options. Format your response as a question followed by a numbered list of options." },
          { role: 'user', content: `Generate an example poll for the following use case: "${useCase}"` }
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling AI API for use case example:', error);
    throw error;
  }
};