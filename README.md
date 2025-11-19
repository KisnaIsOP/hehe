# ChhotaBot 🤖

A production-ready Discord AI chatbot powered by OpenRouter's API using the `google/gemma-3-4b-it:free` model.

## Features

- 💬 Responds to `!ai` commands and bot mentions
- 🧠 Maintains context (last 6 messages per channel)
- 🛡️ Built-in moderation and content filtering
- ⚡ Rate limiting and smart caching
- 📝 Auto-chunking for long responses
- 🎯 Short mode with `!ai --mode=short`
- 📎 Saves very long responses as `.txt` files
- ✅ Comprehensive startup sanity checks
- 🚀 Railway deployment ready

## Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Add your `DISCORD_TOKEN` from [Discord Developer Portal](https://discord.com/developers/applications)
   - Add your `OPENROUTER_API_KEY` from [OpenRouter](https://openrouter.ai/)

3. **Run the bot:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

## Usage

- `!ai <question>` - Ask the AI anything
- `!ai --mode=short <question>` - Get a brief response
- `@ChhotaBot <question>` - Mention the bot to chat
- `!help` - Show help message

## Configuration

Edit `.env` to customize:
- `OPENROUTER_MODEL` - Change AI model (default: `google/gemma-3-4b-it:free`)
- `RATE_LIMIT_PER_MINUTE` - API calls per guild per minute (default: 10)
- `CACHE_TTL_SECONDS` - How long to cache identical queries (default: 300)

## Deploy to Railway

Railway makes deployment simple and provides free hosting for hobby projects.

### Prerequisites
1. GitHub account with your ChhotaBot repository
2. [Railway account](https://railway.app/) (sign up with GitHub)
3. Discord bot token and OpenRouter API key ready

### Deployment Steps

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Create Railway Project:**
   - Go to [railway.app](https://railway.app/)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your ChhotaBot repository
   - Railway will auto-detect Node.js and use `npm start`

3. **Add Environment Variables:**
   - In your Railway project, go to "Variables" tab
   - Add the following:
     ```
     DISCORD_TOKEN=<your-discord-bot-token>
     OPENROUTER_API_KEY=<your-openrouter-api-key>
     OPENROUTER_MODEL=google/gemma-3-4b-it:free
     RATE_LIMIT_PER_MINUTE=10
     CACHE_TTL_SECONDS=300
     ```

4. **Deploy:**
   - Railway automatically deploys on push
   - Click "Deploy" or wait for auto-deployment
   - Monitor deployment in the "Deployments" tab

5. **Check Logs:**
   - Go to "Deployments" → Click latest deployment
   - View logs to ensure bot started successfully
   - Look for: `✅ All sanity checks passed! Starting bot...`
   - Then: `✅ ChhotaBot is online!`

### Railway Tips

- **Auto-deploys:** Railway automatically redeploys on git push
- **Logs:** View real-time logs in the Railway dashboard
- **Sleep mode:** Free tier may sleep after inactivity (upgrade for 24/7)
- **Domains:** Railway provides a URL (not needed for Discord bots)
- **Restart:** Use Railway dashboard to restart your bot anytime

### Troubleshooting

If deployment fails:
1. Check logs in Railway dashboard
2. Verify all environment variables are set correctly
3. Ensure Discord bot has MESSAGE CONTENT INTENT enabled
4. Test OpenRouter API key is valid

## Deploy to Zeabur

Zeabur provides simple deployment with automatic scaling and free tier.

### Deployment Steps

1. **Connect GitHub Repository:**
   - Go to [zeabur.com](https://zeabur.com/)
   - Create new project and connect your GitHub repository

2. **Add Environment Variables:**
   - In Zeabur dashboard, go to your service settings
   - Add the following environment variables:
     ```
     DISCORD_TOKEN=<your-discord-bot-token>
     OPENROUTER_API_KEY=<your-openrouter-api-key>
     OPENROUTER_MODEL=google/gemma-3-4b-it:free
     RATE_LIMIT_PER_MINUTE=60
     CACHE_TTL_SECONDS=120
     ```

3. **Click Deploy:**
   - Zeabur will automatically detect Node.js
   - Build and deployment will start automatically
   - Monitor logs in the Zeabur dashboard

### Zeabur Deploy Checklist

- [ ] GitHub repository connected to Zeabur
- [ ] All environment variables set (DISCORD_TOKEN, OPENROUTER_API_KEY, OPENROUTER_MODEL, RATE_LIMIT_PER_MINUTE, CACHE_TTL_SECONDS)
- [ ] Discord bot has MESSAGE CONTENT INTENT enabled
- [ ] Bot shows online in Discord after deployment
- [ ] Check Zeabur logs for successful startup message

## Deploy to Fly.io

Fly.io provides fast global deployment with generous free tier.

### Prerequisites
1. [Install flyctl](https://fly.io/docs/hands-on/install-flyctl/)
2. Create [Fly.io account](https://fly.io/app/sign-up)
3. Discord bot token and OpenRouter API key ready

### Deployment Steps

1. **Login to Fly.io:**
   ```bash
   flyctl auth login
   ```

2. **Launch app:**
   ```bash
   flyctl launch
   ```
   - Accept defaults or customize app name/region
   - Decline database when prompted

3. **Set secrets:**
   ```bash
   flyctl secrets set DISCORD_TOKEN=your_discord_token_here
   flyctl secrets set OPENROUTER_API_KEY=your_openrouter_key_here
   ```

4. **Deploy:**
   ```bash
   flyctl deploy
   ```

5. **Check status:**
   ```bash
   flyctl status
   flyctl logs
   ```

### Fly Deploy Checklist

- [ ] `flyctl` CLI installed and authenticated
- [ ] `flyctl launch` completed successfully
- [ ] `DISCORD_TOKEN` secret set
- [ ] `OPENROUTER_API_KEY` secret set
- [ ] Bot shows online in Discord after `flyctl deploy`

## Security Features

- Strips Discord invite links from user input
- Removes PII patterns (emails, phone numbers)
- Blocks requests for illegal/harmful content
- Rate limiting with exponential backoff
- Input sanitization before sending to AI
- Comprehensive startup validation

## Project Structure

```
chhotabot/
├── index.js              # Main bot entry point
├── sanity.js             # Startup validation checks
├── openrouter.js         # OpenRouter API integration
├── commands/
│   └── help.js          # Help command
├── utils/
│   ├── moderation.js    # Content filtering & sanitization
│   └── contextStore.js  # Context management per channel
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Startup Sanity Checks

The bot performs comprehensive checks before starting:
- ✅ Node.js version (18.x or higher)
- ✅ Required environment variables exist
- ✅ Discord token format validation
- ✅ OpenRouter API key format validation
- ✅ Discord intents configuration
- ✅ OpenRouter API connectivity test

If any check fails, the bot logs the error and exits gracefully.

## Notes

- Free models on OpenRouter may have rate limits
- Context is stored in-memory (resets on bot restart)
- Very long responses (>16000 chars) are sent as `.txt` files
- Rate limit errors trigger exponential backoff
- Bot requires MESSAGE CONTENT INTENT (privileged) in Discord

## Extending

See `README_SNIPPETS.md` for code examples on:
- Adding slash commands
- Implementing response streaming
- Custom moderation rules

## Support

- [Discord Developer Portal](https://discord.com/developers/applications)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Railway Documentation](https://docs.railway.app/)

## License

MIT
