# ✅ Railway Deployment Checklist

Use this checklist to ensure you have everything ready for deployment.

## Pre-Deployment Checklist

### 📋 Account Setup
- [ ] GitHub account created
- [ ] Railway account created (login with GitHub at railway.app)
- [ ] Discord Developer account (discord.com/developers/applications)
- [ ] OpenRouter account (openrouter.ai)

### 🔑 API Keys & Tokens
- [ ] Discord Bot Token obtained
  - Go to Discord Developer Portal → Your App → Bot
  - Click "Reset Token" and copy it
  - **Save it securely** (you'll need it for Railway)
  
- [ ] MESSAGE CONTENT INTENT enabled ⚠️ **CRITICAL**
  - In Discord Developer Portal → Bot section
  - Scroll to "Privileged Gateway Intents"
  - Enable "MESSAGE CONTENT INTENT"
  - Save changes
  
- [ ] OpenRouter API Key obtained
  - Go to openrouter.ai/keys
  - Create new API key
  - Copy the key (starts with `sk-or-`)
  
- [ ] Bot invited to Discord server
  - Use OAuth2 URL Generator
  - Select: bot scope + Send Messages, Read Message History, Attach Files
  - Open URL and invite to server

### 💻 Local Setup
- [ ] Git installed on your computer
- [ ] Node.js 18+ installed (check with `node --version`)
- [ ] Code editor ready (VS Code, etc.)

## Deployment Steps

### Step 1: Prepare Repository
- [ ] Open PowerShell/Terminal in `coding/chhotabot` directory
- [ ] Run `.\deploy_setup.ps1` (automated setup script)
  - OR manually do the following:
- [ ] Run `git init` (if not already done)
- [ ] Run `git add .`
- [ ] Run `git commit -m "Initial commit - ChhotaBot"`

### Step 2: GitHub Setup
- [ ] Create new GitHub repository
  - Name: `chhotabot-discord` (or your choice)
  - **Do NOT** initialize with README
- [ ] Copy repository URL (ends with `.git`)
- [ ] Add remote: `git remote add origin <YOUR_REPO_URL>`
- [ ] Push code: `git push -u origin main`
- [ ] Verify code is visible on GitHub

### Step 3: Railway Deployment
- [ ] Go to railway.app and login with GitHub
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose your `chhotabot-discord` repository
- [ ] Wait for Railway to detect Node.js project

### Step 4: Configure Environment Variables
In Railway → Your Service → Variables tab:

**Required Variables:**
- [ ] `DISCORD_TOKEN` = `<your_discord_bot_token>`
- [ ] `OPENROUTER_API_KEY` = `<your_openrouter_api_key>`

**Optional Variables (with defaults):**
- [ ] `OPENROUTER_MODEL` = `google/gemma-3-4b-it:free`
- [ ] `RATE_LIMIT_PER_MINUTE` = `10`
- [ ] `CACHE_TTL_SECONDS` = `300`

### Step 5: Verify Deployment
- [ ] Go to Deployments tab in Railway
- [ ] Click on latest deployment
- [ ] Check logs for these messages:
  ```
  ✅ All sanity checks passed! Starting bot...
  ✅ ChhotaBot is online!
  📝 Logged in as ChhotaBot#1234
  ```
- [ ] If errors appear, check environment variables

### Step 6: Test in Discord
- [ ] Open Discord server where bot was invited
- [ ] Type `!help` → Bot should respond
- [ ] Type `!ai Hello!` → Bot should reply
- [ ] Type `!ai --mode=short What is AI?` → Bot should give brief answer
- [ ] Try mentioning bot: `@ChhotaBot Hi there!`

## Post-Deployment

### ✅ Success Indicators
- [ ] Bot shows as "Online" in Discord server
- [ ] Bot responds to `!help` command
- [ ] Bot responds to `!ai` commands
- [ ] No errors in Railway deployment logs

### 🎯 Optimization (Optional)
- [ ] Monitor Railway logs for any issues
- [ ] Test rate limiting (send many requests quickly)
- [ ] Test long responses (ask for detailed explanation)
- [ ] Adjust `RATE_LIMIT_PER_MINUTE` if needed
- [ ] Consider upgrading Railway plan for 24/7 uptime

### 📊 Monitoring
- [ ] Check Railway dashboard for resource usage
- [ ] Monitor Discord for bot responsiveness
- [ ] Check logs periodically for errors
- [ ] Set up alerting (Railway can notify on failures)

## Common Issues & Solutions

### ❌ Bot Not Online in Discord
**Solution:** 
- Check DISCORD_TOKEN is correct
- Verify MESSAGE CONTENT INTENT is enabled
- Check Railway logs for connection errors
- Restart deployment in Railway

### ❌ Bot Doesn't Respond to Commands
**Solution:**
- Verify MESSAGE CONTENT INTENT is enabled ⚠️
- Check bot has Send Messages permission in channel
- Look for errors in Railway logs
- Try re-inviting bot with correct permissions

### ❌ "Invalid API Key" Error
**Solution:**
- Check OPENROUTER_API_KEY is correct
- Verify it starts with `sk-or-` or `sk-`
- Try generating new key on OpenRouter
- Re-add variable in Railway (redeploys automatically)

### ❌ Deployment Build Failed
**Solution:**
- Check Railway build logs for specific error
- Verify package.json has correct dependencies
- Try clicking "Redeploy" in Railway
- Check Node.js version matches requirements (18+)

### ❌ Bot Keeps Restarting
**Solution:**
- Check logs for crash reason
- Verify all environment variables are set
- Check for syntax errors in code
- Ensure Railway has enough resources (upgrade if needed)

## Emergency Rollback

If something goes wrong:
1. Go to Railway → Deployments
2. Find a working previous deployment
3. Click "Redeploy" on that deployment
4. Or push a fix to GitHub (auto-deploys)

## Useful Links

- **Railway Dashboard:** https://railway.app/dashboard
- **Discord Developer Portal:** https://discord.com/developers/applications
- **OpenRouter Keys:** https://openrouter.ai/keys
- **GitHub Repository:** https://github.com/YOUR_USERNAME/chhotabot-discord

## Support Resources

- 📖 Full Guide: `RAILWAY_DEPLOYMENT.md`
- ⚡ Quick Start: `QUICK_START.md`
- 📚 Main Docs: `README.md`
- 🔧 Code Examples: `README_SNIPPETS.md`

---

## Quick Command Reference

### Git Commands
```powershell
git status                     # Check current status
git add .                      # Stage all changes
git commit -m "message"        # Commit changes
git push                       # Push to GitHub (triggers Railway deploy)
```

### Testing Locally
```powershell
npm install                    # Install dependencies
copy .env.example .env         # Create environment file
# Edit .env with your tokens
npm start                      # Run bot locally
```

### Discord Commands
```
!help                          # Show help
!ai <question>                 # Ask AI
!ai --mode=short <question>    # Brief answer
@ChhotaBot <question>          # Mention bot
```

---

**✨ Once all boxes are checked, your bot is live! Congratulations! 🎉**

Need help? Check the logs first - they usually tell you exactly what's wrong!
