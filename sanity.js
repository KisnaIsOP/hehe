/**
 * Sanity Checks - Run before bot startup
 * Validates environment, dependencies, and API connectivity
 */

import dotenv from 'dotenv';
dotenv.config();

/**
 * Check Node.js version
 */
function checkNodeVersion() {
  const requiredMajor = 18;
  const currentVersion = process.version;
  const majorVersion = parseInt(currentVersion.slice(1).split('.')[0]);
  
  if (majorVersion < requiredMajor) {
    console.error(`❌ Node.js ${requiredMajor}.x or higher is required. Current: ${currentVersion}`);
    return false;
  }
  
  console.log(`✅ Node.js version: ${currentVersion}`);
  return true;
}

/**
 * Check required environment variables
 */
function checkEnvironmentVariables() {
  const required = [
    'DISCORD_TOKEN',
    'OPENROUTER_API_KEY',
  ];
  
  const optional = [
    'OPENROUTER_MODEL',
    'RATE_LIMIT_PER_MINUTE',
    'CACHE_TTL_SECONDS',
  ];
  
  let allPresent = true;
  
  console.log('\n🔍 Checking environment variables...');
  
  // Check required vars
  for (const varName of required) {
    const value = process.env[varName];
    
    if (!value || value.trim() === '' || value === 'your_discord_bot_token_here' || value === 'your_openrouter_api_key_here') {
      console.error(`❌ Missing or invalid: ${varName}`);
      allPresent = false;
    } else {
      // Show partial value for security
      const masked = value.length > 8 
        ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
        : '****';
      console.log(`✅ ${varName}: ${masked}`);
    }
  }
  
  // Check optional vars (warnings only)
  for (const varName of optional) {
    const value = process.env[varName];
    if (!value) {
      console.warn(`⚠️  ${varName} not set (using default)`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  }
  
  if (!allPresent) {
    console.error('\n❌ Missing required environment variables!');
    console.error('💡 Create a .env file based on .env.example');
    return false;
  }
  
  return true;
}

/**
 * Validate Discord token format
 */
function validateDiscordToken() {
  const token = process.env.DISCORD_TOKEN;
  
  if (!token) {
    return false;
  }
  
  // Discord tokens are typically 59-70+ characters, contain dots and alphanumeric
  // Basic format check (not exhaustive)
  if (token.length < 50) {
    console.error('❌ DISCORD_TOKEN appears too short. Check your token.');
    return false;
  }
  
  // Should contain at least one dot (separating parts)
  if (!token.includes('.')) {
    console.error('❌ DISCORD_TOKEN format looks invalid.');
    return false;
  }
  
  console.log('✅ Discord token format looks valid');
  return true;
}

/**
 * Validate OpenRouter API key format
 */
function validateOpenRouterKey() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return false;
  }
  
  // OpenRouter keys typically start with "sk-or-" and are 50+ chars
  if (!apiKey.startsWith('sk-or-') && !apiKey.startsWith('sk-')) {
    console.warn('⚠️  OPENROUTER_API_KEY format unexpected. Expected to start with "sk-or-" or "sk-"');
    console.warn('   (Continuing anyway - key might still work)');
  }
  
  if (apiKey.length < 30) {
    console.error('❌ OPENROUTER_API_KEY appears too short.');
    return false;
  }
  
  console.log('✅ OpenRouter API key format looks valid');
  return true;
}

/**
 * Check internet connectivity to OpenRouter
 */
async function checkOpenRouterConnectivity() {
  try {
    console.log('\n🌐 Testing OpenRouter connectivity...');
    
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (response.status === 401) {
      console.error('❌ OpenRouter API key is invalid (401 Unauthorized)');
      return false;
    }
    
    if (!response.ok) {
      console.warn(`⚠️  OpenRouter returned status ${response.status}`);
      console.warn('   (Continuing anyway - might be temporary)');
      return true; // Don't fail startup for non-auth errors
    }
    
    console.log('✅ OpenRouter API connection successful');
    return true;
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ OpenRouter connection timeout. Check your internet connection.');
    } else {
      console.error(`❌ Cannot reach OpenRouter: ${error.message}`);
    }
    return false;
  }
}

/**
 * Verify Discord.js intents configuration
 */
function checkDiscordIntents() {
  console.log('\n🔐 Verifying Discord intents...');
  
  // Required intents for the bot
  const requiredIntents = [
    'Guilds',
    'GuildMessages',
    'MessageContent',
  ];
  
  console.log('✅ Required intents for this bot:');
  requiredIntents.forEach(intent => {
    console.log(`   - ${intent}`);
  });
  
  console.log('\n💡 Make sure these are enabled in Discord Developer Portal:');
  console.log('   1. Go to https://discord.com/developers/applications');
  console.log('   2. Select your application');
  console.log('   3. Go to "Bot" section');
  console.log('   4. Enable "MESSAGE CONTENT INTENT" (privileged)');
  
  return true;
}

/**
 * Run all sanity checks
 * @returns {Promise<boolean>} - True if all checks pass
 */
export async function runSanityChecks() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Running pre-flight sanity checks...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const checks = [
    { name: 'Node.js version', fn: checkNodeVersion },
    { name: 'Environment variables', fn: checkEnvironmentVariables },
    { name: 'Discord token format', fn: validateDiscordToken },
    { name: 'OpenRouter key format', fn: validateOpenRouterKey },
    { name: 'Discord intents', fn: checkDiscordIntents },
    { name: 'OpenRouter connectivity', fn: checkOpenRouterConnectivity },
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    try {
      const result = await check.fn();
      if (!result) {
        allPassed = false;
      }
    } catch (error) {
      console.error(`❌ ${check.name} check failed:`, error.message);
      allPassed = false;
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (allPassed) {
    console.log('✅ All sanity checks passed! Starting bot...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return true;
  } else {
    console.error('❌ Some sanity checks failed!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.error('🛑 Bot startup aborted. Fix the errors above and try again.\n');
    return false;
  }
}
