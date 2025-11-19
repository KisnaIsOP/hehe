/**
 * OpenRouter API Integration
 * Handles chat completions with retries and error handling
 */

import dotenv from 'dotenv';
dotenv.config();

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL || 'google/gemma-3-4b-it:free';

// System prompt - Gen-Z personality
const SYSTEM_PROMPT = `You are a chill, confident AI assistant with Gen-Z vibes. Keep it short and real.

Rules:
- Max 1-3 lines per response
- No long paragraphs or essays
- Be confident, slightly superior but friendly
- Talk like a smart friend who knows their stuff
- Mix English and Hindi naturally
- No robotic explanations like "I am a language model"
- No emotional or clingy tone

Tone examples:
"Bro relax, bol kya chahiye."
"Easy stuff, I got you."
"Quick answer: [your answer]"

When asked about yourself:
"Main AI hoon bro. Smart enough to help, simple enough to keep it real."

Keep responses punchy, confident, and helpful.`;

/**
 * Sleep utility for exponential backoff
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call OpenRouter API with retry logic
 * 
 * @param {Array} conversation - Array of message objects with role and content
 * @param {string} userContent - The current user message content
 * @param {Object} options - Optional parameters (temperature, max_output_tokens, etc.)
 * @returns {Promise<string>} - The AI's response text
 */
export async function callOpenRouter(conversation, userContent, options = {}) {
  const {
    temperature = 0.3,
    max_output_tokens = 600,
    max_retries = 3,
  } = options;
  
  // Build messages array: system prompt + conversation history + new user message
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversation.map(msg => ({
      role: msg.role === 'user' ? 'user' : msg.role === 'system' ? 'system' : 'assistant',
      content: msg.content
    })),
    { role: 'user', content: userContent }
  ];
  
  // Build request body following OpenRouter's format
  const requestBody = {
    model: process.env.OPENROUTER_MODEL || MODEL,
    messages: messages,
    max_output_tokens: max_output_tokens,
    temperature: temperature
  };
  
  let lastError = null;
  
  // Retry loop with exponential backoff
  for (let attempt = 0; attempt < max_retries; attempt++) {
    try {
      console.log(`🔄 Calling OpenRouter (attempt ${attempt + 1}/${max_retries})...`);
      
      const response = await fetch(OPENROUTER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/chhotabot',
          'X-Title': 'ChhotaBot'
        },
        body: JSON.stringify(requestBody),
      });
      
      // Handle rate limiting (HTTP 429)
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
        
        console.warn(`⏳ Rate limited. Waiting ${waitTime}ms before retry...`);
        await sleep(waitTime);
        continue;
      }
      
      // Handle other non-2xx responses
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ Request body that caused error:', JSON.stringify(requestBody, null, 2));
        throw new Error(
          `OpenRouter API error (${response.status}): ${errorBody}`
        );
      }
      
      // Parse response
      const data = await response.json();
      
      // Extract message content with fallbacks
      const content = extractContent(data);
      
      if (!content) {
        console.error('❌ Request body:', JSON.stringify(requestBody, null, 2));
        console.error('❌ Response data:', JSON.stringify(data, null, 2));
        throw new Error('No content returned from API');
      }
      
      console.log('✅ OpenRouter call successful');
      return content;
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt + 1} failed:`, error.message);
      
      // Don't retry on certain errors
      if (error.message.includes('401') || error.message.includes('Invalid API key')) {
        throw new Error('Invalid API key. Check OPENROUTER_API_KEY in .env');
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < max_retries - 1) {
        const backoffTime = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Waiting ${backoffTime}ms before retry...`);
        await sleep(backoffTime);
      }
    }
  }
  
  // All retries exhausted
  throw new Error(`OpenRouter API failed after ${max_retries} attempts: ${lastError?.message}`);
}

/**
 * Extract content from OpenRouter response with fallbacks
 * 
 * @param {Object} data - The JSON response from OpenRouter
 * @returns {string|null} - The extracted message content
 */
function extractContent(data) {
  try {
    // Standard OpenAI-compatible format
    if (data.choices && data.choices.length > 0) {
      const choice = data.choices[0];
      
      // Check message.content (primary format)
      if (choice.message && choice.message.content) {
        return choice.message.content.trim();
      }
      
      // Check text field (some models use this)
      if (choice.text) {
        return choice.text.trim();
      }
    }
    
    // Fallback: check output_text field
    if (data.output_text) {
      return data.output_text.trim();
    }
    
    // Fallback: check if response has direct content field
    if (data.content) {
      return data.content.trim();
    }
    
    // Last resort: return stringified JSON for debugging
    console.warn('⚠️ Unexpected API response structure:', JSON.stringify(data, null, 2));
    return JSON.stringify(data);
    
  } catch (error) {
    console.error('❌ Error extracting content:', error);
    return null;
  }
}

/**
 * Format conversation history for API call
 * 
 * @param {Array} conversationHistory - Array of {role, content} objects
 * @returns {Array} - Formatted messages array
 */
export function formatMessages(conversationHistory) {
  // Ensure messages have correct roles
  return conversationHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));
}

/**
 * Test the API connection
 */
export async function testConnection() {
  try {
    console.log('🧪 Testing OpenRouter connection...');
    const response = await callOpenRouter([], 'Hi! Respond with just "OK" if you can hear me.', { max_output_tokens: 10 });
    console.log('✅ Connection test successful. Response:', response);
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}
