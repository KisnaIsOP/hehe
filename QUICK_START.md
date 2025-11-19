# ⚡ Quick Start Guide

Get ChhotaBot running in 10 minutes!

## Option A: Local Testing (Fastest)

### 1. Install Dependencies
```powershell
npm install
```

### 2. Create .env File
Copy `.env.example` to `.env`:
```powershell
copy .env.example .env
```

### 3. Add Your Tokens
Edit `.env` and add:
- `DISCORD_TOKEN` - Get from [Discord Developer Portal](https://discord.com/developers/applications)
- `OPENROUTER_API_KEY` - Get from [OpenRouter](https://openrouter.ai/keys)

### 4. Run the Bot
```powershell
npm start
```

You should see:
```
✅ All sanity checks passed! Starting bot...
✅ ChhotaBot is online!
```

### 5. Test in Discord
```
!help
!ai Hello!
```

---

## Option B: Railway Deployment (Production)

### Prerequisites Checklist
- [ ] GitHub account
- [ ] Railway account (sign up at [railway.app](https://railway.app))
- [ ] Discord bot token
- [ ] OpenRouter API key

### Quick Deploy Steps

#### 1️⃣ Run Setup Script
```powershell
.\deploy_setup.ps1
```
This will:
- Check git installation
- Initialize repository
- Create initial commit
- Guide you through GitHub setup

#### 2️⃣ Create GitHub Repository
1. Go to https://github.com/new
2. Name it `chhotabot-discord`
3. **Don't** initialize with README
4. Click "Create repository"

#### 3️⃣ Push Code
```powershell
git remote add origin https://github.com/YOUR_USERNAME/chhotabot-discord.git
git branch -M main
git push -u origin main
```

#### 4️⃣ Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Login with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose `chhotabot-discord`

#### 5️⃣ Add Environment Variables
In Railway dashboard → Variables tab:

| Variable | Where to Get |
|----------|-------------|
| `DISCORD_TOKEN` | [Discord Developer Portal](https://discord.com/developers/applications) → Your App → Bot → Token |
| `OPENROUTER_API_KEY` | [OpenRouter Keys](https://openrouter.ai/keys) → Create API Key |

**Optional variables:**
- `OPENROUTER_MODEL=google/gemma-3-4b-it:free`
- `RATE_LIMIT_PER_MINUTE=10`
- `CACHE_TTL_SECONDS=300`

#### 6️⃣ Watch Deployment
- Go to **Deployments** tab
- Watch the logs
- Wait for: `✅ ChhotaBot is online!`

#### 7️⃣ Test Your Bot
Go to Discord and try:
```
!help
!ai What is AI?
```

---

## Important: Discord Bot Setup

### Enable Message Content Intent ⚠️

**This is REQUIRED or bot won't work!**

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to **"Bot"** section
4. Scroll to **"Privileged Gateway Intents"**
5. ✅ Enable **"MESSAGE CONTENT INTENT"**
6. Click **"Save Changes"**

### Invite Bot to Server

1. In Discord Developer Portal → Your App
2. Go to **"OAuth2"** → **"URL Generator"**
3. Select **Scopes:**
   - ✅ `bot`
4. Select **Bot Permissions:**
   - ✅ Send Messages
   - ✅ Read Message History
   - ✅ Attach Files
5. Copy the generated URL
6. Open it in browser and invite bot to your server

---

## Troubleshooting

### Bot Not Responding?
✅ Check MESSAGE CONTENT INTENT is enabled (see above)  
✅ Check bot has permissions in channel  
✅ Check environment variables are correct  

### Deployment Failed?
✅ Check Railway logs for errors  
✅ Verify DISCORD_TOKEN format (should be 50+ chars)  
✅ Verify OPENROUTER_API_KEY starts with `sk-or-`  

### Need More Help?
📖 See full guide: `RAILWAY_DEPLOYMENT.md`

---

## Commands Reference

```
!help                           - Show help message
!ai <question>                  - Ask AI anything
!ai --mode=short <question>     - Get brief answer
@ChhotaBot <question>           - Mention bot to chat
```

---

## What's Next?

- 📖 Read `README.md` for full documentation
- 🚀 Check `RAILWAY_DEPLOYMENT.md` for detailed deployment guide
- 🔧 See `README_SNIPPETS.md` for extension examples
- 💡 Customize moderation rules in `utils/moderation.js`
- 🎨 Add slash commands (see snippets)

---

**Need help?** Check the logs - they tell you exactly what's wrong!

Happy coding! 🎉
