/**
 * ChhotaBot - Discord AI Chatbot
 * Main entry point for the bot
 */

import { Client, GatewayIntentBits, Partials, AttachmentBuilder } from 'discord.js';
import dotenv from 'dotenv';
import { callOpenRouter } from './openrouter.js';
import { checkModeration, sanitizeInput } from './utils/moderation.js';
import { ContextStore } from './utils/contextStore.js';
import helpCommand from './commands/help.js';
import { runSanityChecks } from './sanity.js';

// Load environment variables
dotenv.config();

// Run sanity checks before starting
const sanityPassed = await runSanityChecks();
if (!sanityPassed) {
  process.exit(1);
}

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

// Initialize context store
const contextStore = new ContextStore();

// Command prefix
const PREFIX = '!ai';

// Rate limiting: track API calls per guild
const rateLimitMap = new Map(); // guildId -> { count, resetTime }
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT_PER_MINUTE) || 10;

/**
 * Check if guild has exceeded rate limit
 */
function checkRateLimit(guildId) {
  const now = Date.now();
  const limit = rateLimitMap.get(guildId) || { count: 0, resetTime: now + 60000 };
  
  // Reset if time window passed
  if (now > limit.resetTime) {
    limit.count = 0;
    limit.resetTime = now + 60000;
  }
  
  if (limit.count >= RATE_LIMIT) {
    return false; // Rate limit exceeded
  }
  
  limit.count++;
  rateLimitMap.set(guildId, limit);
  return true;
}

/**
 * Split long text into chunks under 2000 characters
 */
function chunkMessage(text, maxLength = 2000) {
  const chunks = [];
  let remaining = text;
  
  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }
    
    // Find last newline before maxLength
    let splitIndex = remaining.lastIndexOf('\n', maxLength);
    if (splitIndex === -1 || splitIndex < maxLength / 2) {
      splitIndex = maxLength;
    }
    
    chunks.push(remaining.substring(0, splitIndex));
    remaining = remaining.substring(splitIndex).trim();
  }
  
  return chunks;
}

/**
 * Send response to channel (with chunking or file attachment)
 */
async function sendResponse(channel, content, originalMessage) {
  try {
    // If response is extremely long (>16000 chars), send as file
    if (content.length > 16000) {
      const buffer = Buffer.from(content, 'utf-8');
      const attachment = new AttachmentBuilder(buffer, { name: 'response.txt' });
      await channel.send({
        content: '📄 Response too long! Sending as file:',
        files: [attachment],
      });
      return;
    }
    
    // Chunk and send multiple messages if needed
    const chunks = chunkMessage(content);
    for (let i = 0; i < chunks.length; i++) {
      await channel.send(chunks[i]);
      // Small delay between chunks to avoid rate limits
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  } catch (error) {
    console.error('Error sending response:', error);
    await channel.send('❌ Sorry, I had trouble sending the response. Please try again.');
  }
}

/**
 * Process AI command
 */
async function handleAICommand(message, query) {
  const channelId = message.channel.id;
  const guildId = message.guildId || 'dm';
  
  // Check rate limit
  if (!checkRateLimit(guildId)) {
    const resetTime = rateLimitMap.get(guildId).resetTime;
    const waitSeconds = Math.ceil((resetTime - Date.now()) / 1000);
    await message.reply(`⏳ Rate limit reached. Please wait ${waitSeconds} seconds.`);
    return;
  }
  
  // Parse mode flag
  let mode = 'normal';
  let cleanQuery = query;
  const modeMatch = query.match(/--mode=(\w+)/);
  if (modeMatch) {
    mode = modeMatch[1];
    cleanQuery = query.replace(/--mode=\w+/, '').trim();
  }
  
  // Sanitize input
  const sanitized = sanitizeInput(cleanQuery);
  
  // Check for disallowed content
  const moderationResult = checkModeration(sanitized);
  if (!moderationResult.allowed) {
    await message.reply(
      `🛡️ I can't help with that. ${moderationResult.reason}\n\n` +
      `💡 ${moderationResult.alternative || 'Try asking something else!'}`
    );
    return;
  }
  
  // Check cache
  const cacheKey = `${channelId}:${sanitized.toLowerCase()}`;
  const cached = contextStore.getCache(cacheKey);
  if (cached) {
    console.log('📦 Using cached response');
    await sendResponse(message.channel, cached, message);
    return;
  }
  
  try {
    // Show typing indicator
    await message.channel.sendTyping();
    
    // Get conversation context
    const context = contextStore.getContext(channelId);
    
    // Add user message to context
    contextStore.addMessage(channelId, 'user', sanitized);
    
    // Call OpenRouter API
    const options = mode === 'short' ? {
      temperature: 0.2,
      max_output_tokens: 150,
    } : {};
    
    const response = await callOpenRouter(context, options);
    
    // Add assistant response to context
    contextStore.addMessage(channelId, 'assistant', response);
    
    // Cache the response
    contextStore.setCache(cacheKey, response);
    
    // Send response
    await sendResponse(message.channel, response, message);
    
  } catch (error) {
    console.error('Error handling AI command:', error);
    
    if (error.message.includes('429')) {
      await message.reply(
        '⏳ The AI is a bit busy right now. Please try again in a moment.'
      );
    } else if (error.message.includes('timeout')) {
      await message.reply(
        '⏰ Request timed out. The AI might be overloaded. Try again?'
      );
    } else {
      await message.reply(
        '❌ Oops! Something went wrong. Please try again later.'
      );
    }
  }
}

/**
 * Bot ready event
 */
client.once('ready', () => {
  console.log('✅ ChhotaBot is online!');
  console.log(`📝 Logged in as ${client.user.tag}`);
  console.log(`🌐 Serving ${client.guilds.cache.size} guilds`);
  client.user.setActivity('!ai for help', { type: 'LISTENING' });
});

/**
 * Message handler
 */
client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;
  
  const content = message.content.trim();
  
  // Help command
  if (content === '!help') {
    await message.reply(helpCommand());
    return;
  }
  
  // Check if message mentions bot
  const botMentioned = message.mentions.has(client.user);
  
  // Check if message starts with prefix
  const hasPrefix = content.toLowerCase().startsWith(PREFIX.toLowerCase());
  
  if (hasPrefix) {
    // Extract query after prefix
    const query = content.substring(PREFIX.length).trim();
    if (!query) {
      await message.reply('💭 Ask me anything! Example: `!ai What is quantum physics?`');
      return;
    }
    await handleAICommand(message, query);
  } else if (botMentioned) {
    // Extract query after mention
    const query = content.replace(/<@!?\d+>/g, '').trim();
    if (!query) {
      await message.reply('👋 Hi! Use `!ai <question>` to chat with me!');
      return;
    }
    await handleAICommand(message, query);
  }
});

/**
 * Error handler
 */
client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
