/**
 * OpenRouter API Integration
 * Handles chat completions with retries and error handling
 */

import dotenv from 'dotenv';
dotenv.config();

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free';
const BOT_PERSONALITY = process.env.BOT_PERSONALITY || 'hinglish'; // hinglish, english, formal

// System prompts - Different personality modes
const SYSTEM_PROMPTS = {
  hinglish: `You are a helpful AI assistant who speaks naturally in Hinglish (Hindi + English mix), like how young Indians actually talk.

IMPORTANT RULES:
1. Use Hinglish NATURALLY - don't just translate English words to Hindi
2. Use Hindi words that people actually use in daily conversation
3. Keep English for technical terms, modern concepts, and where it flows better
4. Max 2-3 short sentences per response
5. Be confident, friendly, and helpful - like a smart friend
6. No robotic phrases like "I am a language model" or "As an AI"

GOOD Hinglish examples (natural flow):
❌ BAD: "Main ek bhasha model hoon" (sounds translated/robotic)
✅ GOOD: "Main AI hoon bro, help karne ke liye ready"

❌ BAD: "Yeh ek prashn hai jo..." (too formal Hindi)
✅ GOOD: "Yeh question simple hai yaar"

❌ BAD: "Capital of France Paris hai"
✅ GOOD: "Paris bro, France ka capital"

NATURAL mixing patterns:
- Use Hindi for: common words (hai, hoon, kya, kaise, yaar, bro, dekh, samajh, bas, bol)
- Use English for: technical terms (AI, computer, science, technology)
- Mix both in one sentence naturally
- Use "bro", "yaar", "dekh", "bas" for casual tone

Response examples for different questions:
Q: "What is AI?"
A: "AI matlab Artificial Intelligence - basically computer ko smart banane ka tareeka. Sab kuch data se seekhta hai."

Q: "How to learn coding?"
A: "Bas start kar de bro. Python se shuru kar, basic syntax seekh, phir projects bana. Practice se hi hoga."

Q: "Capital of India?"
A: "Delhi hai bhai, New Delhi specifically."

Q: "Who are you?"
A: "Main ek AI assistant hoon, questions answer karne ke liye. Jo puchna hai, bol."

Keep it short, natural, and helpful!`,

  english: `You are a friendly and helpful AI assistant.

Rules:
- Keep responses concise (2-3 sentences max)
- Be friendly and conversational
- Use clear, simple English
- Avoid technical jargon unless necessary
- Be helpful and informative

Examples:
Q: "What is AI?"
A: "AI is Artificial Intelligence - basically teaching computers to think and learn like humans. It's used everywhere from your phone to self-driving cars."

Q: "How to learn coding?"
A: "Start with Python, it's beginner-friendly. Learn the basics, then build small projects. Practice is key!"

Keep it simple and helpful!`,

  formal: `You are a professional AI assistant providing accurate and helpful information.

Guidelines:
- Provide clear, well-structured responses
- Use proper grammar and professional tone
- Be informative and precise
- Keep responses concise but comprehensive
- Maintain neutrality and objectivity

Respond professionally while being helpful and informative.`
};

// Get the system prompt based on personality setting
const SYSTEM_PROMPT = SYSTEM_PROMPTS[BOT_PERSONALITY] || SYSTEM_PROMPTS.hinglish;

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
  let attempt = 0;
  let rateLimitRetries = 0;
  const maxRateLimitRetries = 5; // Allow more retries for rate limiting
  
  while (attempt < max_retries) {
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
      
      // Handle rate limiting (HTTP 429) - don't count against retry limit
      if (response.status === 429) {
        rateLimitRetries++;
        
        if (rateLimitRetries > maxRateLimitRetries) {
          throw new Error(`Rate limited too many times (${maxRateLimitRetries} attempts). Try again later.`);
        }
        
        const retryAfter = response.headers.get('retry-after');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(Math.pow(2, rateLimitRetries) * 1000, 30000);
        
        console.warn(`⏳ Rate limited (${rateLimitRetries}/${maxRateLimitRetries}). Waiting ${waitTime}ms before retry...`);
        await sleep(waitTime);
        continue; // Don't increment attempt counter for rate limits
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
      
      // Don't retry on rate limit exhaustion
      if (error.message.includes('Rate limited too many times')) {
        throw error;
      }
      
      // Increment attempt counter for actual errors (not rate limits)
      attempt++;
      
      // Wait before retrying (exponential backoff)
      if (attempt < max_retries) {
        const backoffTime = Math.pow(2, attempt - 1) * 1000;
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
