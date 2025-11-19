# 🚀 Railway Deployment Guide for ChhotaBot

This guide will walk you through deploying ChhotaBot to Railway step-by-step.

## Prerequisites

Before you begin, make sure you have:

1. ✅ A [GitHub account](https://github.com)
2. ✅ A [Railway account](https://railway.app) (sign up with GitHub - it's free!)
3. ✅ Your Discord Bot Token from [Discord Developer Portal](https://discord.com/developers/applications)
4. ✅ Your OpenRouter API Key from [OpenRouter](https://openrouter.ai)

## Step 1: Prepare Your Discord Bot

### 1.1 Create/Configure Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"** (or select existing one)
3. Give it a name (e.g., "ChhotaBot")
4. Go to **"Bot"** section in the left sidebar
5. Click **"Reset Token"** to get your bot token (save this - you'll need it later!)
6. **IMPORTANT:** Scroll down to **"Privileged Gateway Intents"**
   - ✅ Enable **"MESSAGE CONTENT INTENT"** (required!)
7. Go to **"OAuth2"** → **"URL Generator"**
   - Select scopes: `bot`
   - Select permissions: 
     - Send Messages
     - Read Message History
     - Attach Files
   - Copy the generated URL and invite bot to your server

### 1.2 Get OpenRouter API Key

1. Go to [OpenRouter](https://openrouter.ai)
2. Sign up/Login
3. Go to [API Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Copy the key (starts with `sk-or-...`)

## Step 2: Push Code to GitHub

### 2.1 Initialize Git Repository (if not already done)

Open PowerShell/Terminal in the `coding/chhotabot` directory:

```powershell
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - ChhotaBot Discord bot"
```

### 2.2 Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository (e.g., "chhotabot-discord")
3. **DO NOT** initialize with README (we already have code)
4. Click **"Create repository"**

### 2.3 Push to GitHub

Copy the commands from GitHub (they look like this):

```powershell
git remote add origin https://github.com/YOUR_USERNAME/chhotabot-discord.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

## Step 3: Deploy to Railway

### 3.1 Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Click **"Login"** and sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Authorize Railway to access your GitHub repositories (if asked)
6. Select your **chhotabot-discord** repository
7. Railway will automatically detect Node.js and start building!

### 3.2 Configure Environment Variables

**IMPORTANT:** Your bot needs these variables to work!

1. In your Railway project, click on your service
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** and add each of these:

| Variable Name | Value | Example |
|--------------|-------|---------|
| `DISCORD_TOKEN` | Your bot token from Step 1.1 | `YOUR_DISCORD_BOT_TOKEN_HERE` |
| `OPENROUTER_API_KEY` | Your API key from Step 1.2 | `sk-or-v1-abc123...` |
| `OPENROUTER_MODEL` | (Optional) AI model to use | `google/gemma-3-4b-it:free` |
| `RATE_LIMIT_PER_MINUTE` | (Optional) Rate limit | `10` |
| `CACHE_TTL_SECONDS` | (Optional) Cache duration | `300` |

**How to add variables:**
- Click **"+ New Variable"**
- Enter the **Variable Name** exactly as shown above
- Paste your actual **Value** (the token/key)
- Click **"Add"**
- Repeat for all required variables

### 3.3 Deploy!

After adding the environment variables:

1. Railway will automatically redeploy with the new variables
2. Click on **"Deployments"** tab to watch the progress
3. You'll see logs showing:
   - Installing dependencies
   - Building the project
   - Starting the bot

### 3.4 Verify Deployment

Look for these messages in the deployment logs:

```
✅ All sanity checks passed! Starting bot...
✅ ChhotaBot is online!
📝 Logged in as ChhotaBot#1234
🌐 Serving X guilds
```

If you see these messages, **congratulations! 🎉** Your bot is live!

## Step 4: Test Your Bot

1. Go to your Discord server where you invited the bot
2. Try these commands:
   ```
   !help
   !ai Hello! Can you hear me?
   !ai --mode=short What is AI?
   ```
3. The bot should respond to your messages!

## Troubleshooting

### Bot Not Responding?

**Check 1: MESSAGE CONTENT INTENT**
- Go to Discord Developer Portal → Your App → Bot
- Make sure **"MESSAGE CONTENT INTENT"** is enabled
- Save changes and restart your Railway deployment

**Check 2: Bot Invited Correctly**
- Make sure you used the OAuth2 URL with correct permissions
- Bot needs "Send Messages" and "Read Message History" permissions

**Check 3: Environment Variables**
- In Railway, go to Variables tab
- Verify all required variables are set
- Check for typos in variable names (they're case-sensitive!)
- If you change variables, Railway will auto-redeploy

### Deployment Failed?

**Check Railway Logs:**
1. Go to your Railway project
2. Click on **"Deployments"** tab
3. Click on the failed deployment
4. Read the error logs - they'll tell you what's wrong

**Common Issues:**
- ❌ **"Invalid token"**: Check your `DISCORD_TOKEN` is correct
- ❌ **"401 Unauthorized"**: Check your `OPENROUTER_API_KEY` is correct
- ❌ **"Module not found"**: Railway might need to rebuild - click "Redeploy"
- ❌ **"Missing environment variables"**: Add all required variables from Step 3.2

### Bot Goes Offline?

**Railway Free Tier Limitations:**
- Free tier may sleep after 500+ hours of usage per month
- Consider upgrading to Railway Pro ($5/month) for 24/7 uptime
- Or use Railway's Hobby plan for better reliability

## Railway Features

### View Logs
- Go to your service → **"Deployments"** → Click latest deployment
- Real-time logs help you debug issues

### Restart Bot
- Go to your service → **"Settings"**
- Click **"Restart"** to restart the bot

### Auto-Deploy on Git Push
- Every time you push to GitHub, Railway automatically redeploys!
- Make changes locally → `git push` → Railway updates automatically

### Monitor Usage
- Railway dashboard shows CPU, memory, and network usage
- Free tier includes generous limits for hobby projects

## Updating Your Bot

To add new features or fix bugs:

```powershell
# Make your changes to the code
# Then commit and push:

git add .
git commit -m "Add new feature"
git push
```

Railway will automatically detect the push and redeploy! 🚀

## Getting Help

- **Railway Docs**: https://docs.railway.app
- **Discord.js Guide**: https://discordjs.guide
- **OpenRouter Docs**: https://openrouter.ai/docs

## Next Steps

Want to enhance your bot? Consider:

- 🎨 Adding slash commands (see `README_SNIPPETS.md`)
- 💾 Implementing persistent storage (PostgreSQL/Redis)
- 📊 Adding analytics and usage tracking
- 🎭 Creating custom moderation rules
- 🌐 Supporting multiple languages

---

**Need help?** Check the Railway logs first - they usually tell you exactly what's wrong!

**Happy deploying! 🚀**
