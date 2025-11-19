# ChhotaBot - Extension Snippets

This file contains code snippets for extending ChhotaBot with additional features.

---

## Adding Slash Commands

To add Discord slash commands, modify `index.js`:

```javascript
import { REST, Routes, SlashCommandBuilder } from 'discord.js';

// Define slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask the AI a question')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Your question')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear conversation context for this channel'),
];

// Register commands (run once during setup)
async function registerCommands() {
  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands.map(cmd => cmd.toJSON()) }
    );
    console.log('✅ Slash commands registered!');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Handle slash command interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  if (interaction.commandName === 'ask') {
    const question = interaction.options.getString('question');
    await interaction.deferReply();
    
    // Use your existing handleAICommand logic
    // Then reply with: await interaction.editReply(response);
  }
  
  if (interaction.commandName === 'clear') {
    const channelId = interaction.channel.id;
    contextStore.clearContext(channelId);
    await interaction.reply('🧹 Context cleared for this channel!');
  }
});

// Call after bot is ready
client.once('ready', async () => {
  await registerCommands();
});
```

---

## Implementing Response Streaming

To stream responses token-by-token (if API supports it):

```javascript
// In openrouter.js, add streaming function
export async function callOpenRouterStream(messages, callback, options = {}) {
  const requestBody = {
    model: MODEL,
    messages: messages,
    temperature: options.temperature || 0.3,
    max_tokens: options.max_output_tokens || 600,
    stream: true, // Enable streaming
  };
  
  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  // Read stream
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep incomplete line in buffer
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        
        try {
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            callback(content); // Stream each token
          }
        } catch (e) {
          console.warn('Failed to parse stream chunk:', e);
        }
      }
    }
  }
}

// Usage in index.js
let fullResponse = '';
let currentMessage = null;

await callOpenRouterStream(context, async (token) => {
  fullResponse += token;
  
  // Update message every 20 tokens
  if (fullResponse.length % 20 === 0) {
    if (!currentMessage) {
      currentMessage = await message.channel.send(fullResponse);
    } else {
      await currentMessage.edit(fullResponse.slice(0, 2000));
    }
  }
}, options);

// Final update
if (currentMessage) {
  await currentMessage.edit(fullResponse.slice(0, 2000));
}
```

---

## Custom Moderation Rules

Add custom moderation patterns in `utils/moderation.js`:

```javascript
// Add to rules array in checkModeration()
{
  patterns: [
    /your custom regex pattern/i,
    /another pattern/i,
  ],
  reason: "Your custom reason message",
  alternative: "Suggested alternative action",
},

// Example: Block crypto pump-and-dump requests
{
  patterns: [
    /\b(buy|invest|pump)\s+(coin|token|crypto)\b/i,
    /guaranteed\s+(profit|returns|money)/i,
  ],
  reason: "I can't provide financial advice or promote risky investments.",
  alternative: "For investing info, consult licensed financial advisors or educational resources like Investopedia.",
},
```

---

## Persistent Context Storage

To persist context across bot restarts using a database:

```javascript
// Install: npm install better-sqlite3

import Database from 'better-sqlite3';

class PersistentContextStore extends ContextStore {
  constructor(dbPath = './context.db') {
    super();
    this.db = new Database(dbPath);
    
    // Create table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS contexts (
        channel_id TEXT,
        role TEXT,
        content TEXT,
        timestamp INTEGER
      )
    `);
    
    // Load contexts on startup
    this.loadFromDB();
  }
  
  addMessage(channelId, role, content) {
    super.addMessage(channelId, role, content);
    
    // Save to DB
    const stmt = this.db.prepare(
      'INSERT INTO contexts VALUES (?, ?, ?, ?)'
    );
    stmt.run(channelId, role, content, Date.now());
  }
  
  loadFromDB() {
    const stmt = this.db.prepare(
      'SELECT * FROM contexts WHERE timestamp > ? ORDER BY timestamp'
    );
    const cutoff = Date.now() - (30 * 60 * 1000); // 30 min ago
    const rows = stmt.all(cutoff);
    
    for (const row of rows) {
      const context = this.contexts.get(row.channel_id) || [];
      context.push({
        role: row.role,
        content: row.content,
        timestamp: row.timestamp,
      });
      this.contexts.set(row.channel_id, context);
    }
  }
  
  cleanup() {
    super.cleanup();
    
    // Clean old DB entries
    const cutoff = Date.now() - (60 * 60 * 1000); // 1 hour
    this.db.prepare('DELETE FROM contexts WHERE timestamp < ?').run(cutoff);
  }
}

// Use in index.js
const contextStore = new PersistentContextStore();
```

---

## Multi-Model Support

Switch between different models dynamically:

```javascript
// In index.js, parse model flag
const modelMatch = query.match(/--model=([^\s]+)/);
let selectedModel = process.env.OPENROUTER_MODEL;

if (modelMatch) {
  selectedModel = modelMatch[1];
  cleanQuery = query.replace(/--model=[^\s]+/, '').trim();
}

// Pass to OpenRouter
const response = await callOpenRouter(context, {
  model: selectedModel, // Override default
  temperature: 0.3,
  max_output_tokens: 600,
});

// Update openrouter.js to accept model parameter
export async function callOpenRouter(messages, options = {}) {
  const model = options.model || MODEL;
  const requestBody = {
    model: model, // Use passed model
    messages: messages,
    // ... rest
  };
}
```

---

## Adding Image Support

For models that support vision:

```javascript
// In index.js, check for attachments
if (message.attachments.size > 0) {
  const attachment = message.attachments.first();
  
  if (attachment.contentType?.startsWith('image/')) {
    // Add image to context
    contextStore.addMessage(channelId, 'user', [
      {
        type: 'text',
        text: sanitized,
      },
      {
        type: 'image_url',
        image_url: { url: attachment.url },
      },
    ]);
  }
}
```

---

## Advanced Rate Limiting with Redis

For production deployments across multiple instances:

```javascript
// Install: npm install redis

import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

async function checkRateLimitRedis(guildId) {
  const key = `ratelimit:${guildId}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, 60); // 1 minute window
  }
  
  return count <= RATE_LIMIT;
}
```

---

These snippets provide a starting point for common extensions. Adapt them to your specific needs!
