# 🎯 START HERE - Deploy ChhotaBot to Railway

**Welcome!** This guide will get your Discord AI bot live in under 15 minutes.

## 🚀 Three Simple Steps

### 1️⃣ Run the Setup Script
Open PowerShell in this directory and run:
```powershell
.\deploy_setup.ps1
```
This automated script will:
- ✅ Check if Git is installed
- ✅ Initialize your repository
- ✅ Create your first commit
- ✅ Guide you through GitHub setup

### 2️⃣ Get Your API Keys
You need two things:

**Discord Bot Token:**
1. Go to https://discord.com/developers/applications
2. Create application → Go to "Bot" → Copy token
3. ⚠️ **IMPORTANT:** Enable "MESSAGE CONTENT INTENT"

**OpenRouter API Key:**
1. Go to https://openrouter.ai/keys
2. Sign up and create API key
3. Copy the key (starts with `sk-or-`)

### 3️⃣ Deploy to Railway
1. Go to https://railway.app (login with GitHub)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `chhotabot-discord` repository
4. Add environment variables:
   - `DISCORD_TOKEN` = your Discord token
   - `OPENROUTER_API_KEY` = your OpenRouter key
5. Wait for deployment (watch logs)
6. Test in Discord: `!help`

## ✅ That's It!

Your bot should now be online and responding in Discord!

---

## 📚 Need More Details?

Choose your learning style:

- **🎯 Quick & Simple:** Keep reading below
- **📖 Detailed Guide:** Open `RAILWAY_DEPLOYMENT.md`
- **✅ Step-by-Step Checklist:** Open `DEPLOYMENT_CHECKLIST.md`
- **⚡ Quick Reference:** Open `QUICK_START.md`
- **🔗 All Important Links:** Open `LINKS_AND_RESOURCES.md`

---

## 🎯 Quick Deploy Path

### Prerequisites (2 minutes)
- [ ] Create GitHub account (if you don't have one)
- [ ] Create Railway account at railway.app
- [ ] Have Discord bot token ready
- [ ] Have OpenRouter API key ready

### Deploy (5 minutes)
1. **Run:** `.\deploy_setup.ps1`
2. **Create GitHub repo** at https://github.com/new
3. **Push code:** Follow script instructions
4. **Deploy to Railway:** Select your repo
5. **Add variables:** DISCORD_TOKEN and OPENROUTER_API_KEY

### Test (1 minute)
- Type `!help` in Discord
- Type `!ai Hello!`
- Bot should respond!

---

## 🆘 Troubleshooting

### Bot doesn't respond?
1. ✅ Check MESSAGE CONTENT INTENT is enabled
2. ✅ Check bot has permissions in channel
3. ✅ Check Railway logs for errors

### Deployment failed?
1. ✅ Check environment variables are correct
2. ✅ Look at Railway deployment logs
3. ✅ Verify tokens are not placeholder values

### Need help?
- Check `DEPLOYMENT_CHECKLIST.md` for common issues
- Check Railway logs - they show exact errors
- Read `RAILWAY_DEPLOYMENT.md` for detailed troubleshooting

---

## 📖 Documentation Map

```
START_HERE.md (you are here)     ← Start with this
├── deploy_setup.ps1              ← Run this script first
├── QUICK_START.md                ← Fast reference guide
├── RAILWAY_DEPLOYMENT.md         ← Detailed deployment guide
├── DEPLOYMENT_CHECKLIST.md       ← Step-by-step checklist
├── LINKS_AND_RESOURCES.md        ← All important URLs
│
├── README.md                     ← Full bot documentation
├── README_SNIPPETS.md            ← Code examples for extensions
└── .env.example                  ← Environment variables template
```

---

## 🎉 What You're Deploying

**ChhotaBot** is a production-ready Discord AI chatbot with:

- 🤖 AI-powered responses (using OpenRouter)
- 💬 Remembers conversation context
- 🛡️ Built-in content moderation
- ⚡ Rate limiting & caching
- 📝 Auto-splits long messages
- ✅ Comprehensive error handling

**Commands:**
- `!ai <question>` - Ask anything
- `!ai --mode=short <question>` - Brief answer
- `@ChhotaBot <question>` - Mention to chat
- `!help` - Show help

---

## 🚦 Deployment Status Indicators

**When you see these in Railway logs, you're good:**
```
✅ All sanity checks passed! Starting bot...
✅ ChhotaBot is online!
📝 Logged in as ChhotaBot#1234
🌐 Serving X guilds
```

**If you see errors:**
- Read the error message carefully
- Check `DEPLOYMENT_CHECKLIST.md` troubleshooting section
- Verify environment variables are correct

---

## 💡 Pro Tips

1. **Message Content Intent** - This is the #1 reason bots don't work. Make sure it's enabled!
2. **Save Your Tokens** - Keep them in a secure place (password manager)
3. **Check Logs First** - Railway logs tell you exactly what's wrong
4. **Test Locally First** - Run `npm start` locally before deploying
5. **Use the Script** - `deploy_setup.ps1` automates most of the work

---

## 🎯 Next Steps After Deployment

Once your bot is live:

1. ✅ Test all commands
2. 📊 Monitor Railway dashboard for resource usage
3. 🔧 Customize bot behavior (edit `utils/moderation.js`)
4. 🎨 Add slash commands (see `README_SNIPPETS.md`)
5. 📈 Consider upgrading Railway plan for 24/7 uptime

---

## ⚡ Emergency Quick Deploy

**If you just want to deploy NOW:**

```powershell
# 1. Setup git
git init
git add .
git commit -m "Deploy ChhotaBot"

# 2. Create GitHub repo at github.com/new
# 3. Connect and push:
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main

# 4. Deploy to Railway:
# - Go to railway.app
# - New Project → GitHub repo
# - Add DISCORD_TOKEN and OPENROUTER_API_KEY variables
# - Done!
```

---

**Ready to deploy? Run `.\deploy_setup.ps1` to get started! 🚀**

Questions? Check the other documentation files for detailed answers.

Good luck! 🎉
