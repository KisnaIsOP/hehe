# ChhotaBot - Railway Deployment Setup Script
# This script helps you prepare your bot for Railway deployment

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "  ChhotaBot Railway Deployment Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "`n📋 This script will help you:" -ForegroundColor Yellow
Write-Host "   1. Check prerequisites" -ForegroundColor White
Write-Host "   2. Initialize git repository" -ForegroundColor White
Write-Host "   3. Create initial commit" -ForegroundColor White
Write-Host "   4. Guide you through GitHub setup" -ForegroundColor White
Write-Host "   5. Prepare for Railway deployment" -ForegroundColor White

Write-Host "`n⚠️  Prerequisites needed:" -ForegroundColor Yellow
Write-Host "   • Git installed (we'll check)" -ForegroundColor White
Write-Host "   • GitHub account created" -ForegroundColor White
Write-Host "   • Discord bot token ready" -ForegroundColor White
Write-Host "   • OpenRouter API key ready" -ForegroundColor White

$continue = Read-Host "`nDo you want to continue? (y/n)"
if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Host "`n❌ Setup cancelled." -ForegroundColor Red
    exit
}

# Step 1: Check Git Installation
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 1: Checking Git Installation" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

try {
    $gitVersion = git --version
    Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host "   Please download and install Git from: https://git-scm.com/downloads" -ForegroundColor Yellow
    Write-Host "   After installing, restart PowerShell and run this script again." -ForegroundColor Yellow
    exit 1
}

# Step 2: Check if already a git repository
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 2: Initializing Git Repository" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if (Test-Path .git) {
    Write-Host "✅ Git repository already exists" -ForegroundColor Green
    $status = git status --short
    if ($status) {
        Write-Host "⚠️  You have uncommitted changes:" -ForegroundColor Yellow
        git status --short
    } else {
        Write-Host "✅ Working directory is clean" -ForegroundColor Green
    }
} else {
    Write-Host "📦 Initializing new git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}

# Step 3: Create .gitignore if needed
if (!(Test-Path .gitignore)) {
    Write-Host "⚠️  No .gitignore found - this shouldn't happen!" -ForegroundColor Yellow
    Write-Host "   The project should already have a .gitignore file" -ForegroundColor Yellow
}

# Step 4: Create initial commit (if needed)
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 3: Creating Initial Commit" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$commits = git rev-list --all --count 2>$null
if ($commits -and $commits -gt 0) {
    Write-Host "✅ Repository already has $commits commit(s)" -ForegroundColor Green
} else {
    Write-Host "📝 Adding all files to git..." -ForegroundColor Yellow
    git add .
    
    Write-Host "💾 Creating initial commit..." -ForegroundColor Yellow
    git commit -m "Initial commit - ChhotaBot Discord AI bot"
    
    Write-Host "✅ Initial commit created" -ForegroundColor Green
}

# Step 5: Check for remote
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 4: GitHub Repository Setup" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$remote = git remote get-url origin 2>$null
if ($remote) {
    Write-Host "✅ GitHub remote already configured: $remote" -ForegroundColor Green
    Write-Host "`n📤 To push to GitHub, run:" -ForegroundColor Yellow
    Write-Host "   git push -u origin main" -ForegroundColor White
} else {
    Write-Host "⚠️  No GitHub remote configured yet" -ForegroundColor Yellow
    Write-Host "`n📋 To set up GitHub:" -ForegroundColor Yellow
    Write-Host "   1. Go to https://github.com/new" -ForegroundColor White
    Write-Host "   2. Create a new repository (e.g., 'chhotabot-discord')" -ForegroundColor White
    Write-Host "   3. DO NOT initialize with README" -ForegroundColor White
    Write-Host "   4. Copy your repository URL" -ForegroundColor White
    
    Write-Host "`n" -NoNewline
    $setupNow = Read-Host "Have you created a GitHub repository? (y/n)"
    
    if ($setupNow -eq "y" -or $setupNow -eq "Y") {
        Write-Host "`n📝 Enter your GitHub repository URL" -ForegroundColor Yellow
        Write-Host "   Format: https://github.com/USERNAME/REPO.git" -ForegroundColor White
        $repoUrl = Read-Host "Repository URL"
        
        if ($repoUrl) {
            try {
                git remote add origin $repoUrl
                Write-Host "✅ Remote added successfully!" -ForegroundColor Green
                
                $branch = git branch --show-current
                if (!$branch) {
                    git branch -M main
                    Write-Host "✅ Renamed branch to 'main'" -ForegroundColor Green
                }
                
                Write-Host "`n📤 Pushing to GitHub..." -ForegroundColor Yellow
                git push -u origin main
                Write-Host "✅ Code pushed to GitHub!" -ForegroundColor Green
            } catch {
                Write-Host "❌ Failed to push to GitHub: $_" -ForegroundColor Red
                Write-Host "   You can manually push later with: git push -u origin main" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "`n📋 After creating your GitHub repository, run:" -ForegroundColor Yellow
        Write-Host "   git remote add origin https://github.com/USERNAME/REPO.git" -ForegroundColor White
        Write-Host "   git branch -M main" -ForegroundColor White
        Write-Host "   git push -u origin main" -ForegroundColor White
    }
}

# Step 6: Railway deployment info
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 5: Railway Deployment Next Steps" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n🚀 Your code is ready for Railway!" -ForegroundColor Green
Write-Host "`n📋 Next steps for Railway deployment:" -ForegroundColor Yellow

Write-Host "`n1️⃣  Get your Discord Bot Token:" -ForegroundColor Cyan
Write-Host "   • Go to https://discord.com/developers/applications" -ForegroundColor White
Write-Host "   • Select your application (or create new one)" -ForegroundColor White
Write-Host "   • Go to 'Bot' section" -ForegroundColor White
Write-Host "   • Enable 'MESSAGE CONTENT INTENT' (REQUIRED!)" -ForegroundColor Yellow
Write-Host "   • Copy the bot token" -ForegroundColor White

Write-Host "`n2️⃣  Get your OpenRouter API Key:" -ForegroundColor Cyan
Write-Host "   • Go to https://openrouter.ai" -ForegroundColor White
Write-Host "   • Sign up/Login" -ForegroundColor White
Write-Host "   • Go to https://openrouter.ai/keys" -ForegroundColor White
Write-Host "   • Create and copy your API key" -ForegroundColor White

Write-Host "`n3️⃣  Deploy to Railway:" -ForegroundColor Cyan
Write-Host "   • Go to https://railway.app" -ForegroundColor White
Write-Host "   • Login with GitHub" -ForegroundColor White
Write-Host "   • Click 'New Project' → 'Deploy from GitHub repo'" -ForegroundColor White
Write-Host "   • Select your chhotabot repository" -ForegroundColor White
Write-Host "   • Add environment variables:" -ForegroundColor White
Write-Host "     - DISCORD_TOKEN=<your_discord_token>" -ForegroundColor Gray
Write-Host "     - OPENROUTER_API_KEY=<your_openrouter_key>" -ForegroundColor Gray

Write-Host "`n📖 Full deployment guide: RAILWAY_DEPLOYMENT.md" -ForegroundColor Yellow

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
