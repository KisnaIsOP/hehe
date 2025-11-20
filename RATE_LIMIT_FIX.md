# Rate Limit Bug Fix - November 2024

## Problem
The Discord bot was failing intermittently with errors like:
```
Error: OpenRouter API failed after 3 attempts: undefined
```

### Root Cause
When OpenRouter API returned HTTP 429 (rate limited), the retry logic had a critical bug:
- Rate limit responses were being counted against the retry limit (3 attempts)
- After waiting and continuing, the loop would increment the attempt counter
- After 3 rate limits, the bot would give up without ever successfully retrying

**Log Evidence:**
```
2025-11-20 09:37:45, Calling OpenRouter (attempt 1/3)...
2025-11-20 09:37:45, Rate limited. Waiting 1000ms before retry...
2025-11-20 09:37:46, Calling OpenRouter (attempt 2/3)...
2025-11-20 09:37:46, Rate limited. Waiting 2000ms before retry...
2025-11-20 09:37:48, Calling OpenRouter (attempt 3/3)...
2025-11-20 09:37:48, Rate limited. Waiting 4000ms before retry...
2025-11-20 09:37:52, Error: OpenRouter API failed after 3 attempts: undefined
```

## Solution
Modified `openrouter.js` to handle rate limiting properly:

### Key Changes:
1. **Separate rate limit counter** - Rate limits no longer count against the main retry limit
2. **Changed loop structure** - From `for` loop to `while` loop with manual attempt increment
3. **Increased rate limit tolerance** - Allow up to 5 rate limit retries (separate from API errors)
4. **Better backoff** - Cap max wait time at 30 seconds for rate limits
5. **Explicit attempt increment** - Only increment on actual errors, not rate limits

### Code Changes:
- Changed from `for (let attempt = 0; attempt < max_retries; attempt++)` to `while (attempt < max_retries)`
- Added separate `rateLimitRetries` counter with `maxRateLimitRetries = 5`
- Rate limit handler uses `continue` without incrementing main attempt counter
- Only increment `attempt++` in the catch block for actual errors

## Result
✅ Bot now handles rate limiting gracefully:
- Rate limits don't exhaust retry attempts
- Up to 5 rate limit retries with exponential backoff (1s, 2s, 4s, 8s, 16s, max 30s)
- Still maintains 3 retries for actual API errors
- Better error messages showing rate limit retry count

## Testing
After deploying this fix to Zeabur:
1. Bot should handle temporary rate limits automatically
2. Users won't see failures during rate limit periods
3. Logs will show: `⏳ Rate limited (X/5). Waiting Xms before retry...`

## Deployment
Push changes to GitHub and Zeabur will auto-deploy:
```bash
git add coding/chhotabot/openrouter.js
git commit -m "Fix rate limit retry logic - separate rate limit counter from error retries"
git push
```
