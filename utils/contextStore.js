/**
 * Context Store
 * Manages conversation history per channel with expiry and caching
 */

const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS) || 300; // 5 minutes default
const MAX_CONTEXT_MESSAGES = 6; // Last 6 messages per channel

/**
 * ContextStore class for managing conversation context
 */
export class ContextStore {
  constructor() {
    // channelId -> [{role, content, timestamp}]
    this.contexts = new Map();
    
    // cacheKey -> {content, timestamp}
    this.cache = new Map();
    
    // Start cleanup interval (every 5 minutes)
    this.startCleanup();
  }
  
  /**
   * Get conversation context for a channel
   * 
   * @param {string} channelId - Discord channel ID
   * @returns {Array} - Array of message objects {role, content}
   */
  getContext(channelId) {
    const context = this.contexts.get(channelId) || [];
    
    // Filter out expired messages (older than 30 minutes)
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    const validContext = context.filter(msg => 
      (now - msg.timestamp) < maxAge
    );
    
    // Keep only last MAX_CONTEXT_MESSAGES
    const recent = validContext.slice(-MAX_CONTEXT_MESSAGES);
    
    // Update stored context
    if (recent.length !== context.length) {
      this.contexts.set(channelId, recent);
    }
    
    // Return formatted messages (without timestamps)
    return recent.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }
  
  /**
   * Add a message to channel context
   * 
   * @param {string} channelId - Discord channel ID
   * @param {string} role - 'user' or 'assistant'
   * @param {string} content - Message content
   */
  addMessage(channelId, role, content) {
    const context = this.contexts.get(channelId) || [];
    
    context.push({
      role: role,
      content: content,
      timestamp: Date.now(),
    });
    
    // Keep only last MAX_CONTEXT_MESSAGES + buffer
    if (context.length > MAX_CONTEXT_MESSAGES + 2) {
      context.splice(0, context.length - MAX_CONTEXT_MESSAGES);
    }
    
    this.contexts.set(channelId, context);
  }
  
  /**
   * Clear context for a channel
   * 
   * @param {string} channelId - Discord channel ID
   */
  clearContext(channelId) {
    this.contexts.delete(channelId);
  }
  
  /**
   * Get cached response for a query
   * 
   * @param {string} cacheKey - Unique key for the query
   * @returns {string|null} - Cached response or null
   */
  getCache(cacheKey) {
    const cached = this.cache.get(cacheKey);
    
    if (!cached) {
      return null;
    }
    
    // Check if expired
    const now = Date.now();
    const age = (now - cached.timestamp) / 1000; // seconds
    
    if (age > CACHE_TTL) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return cached.content;
  }
  
  /**
   * Set cached response for a query
   * 
   * @param {string} cacheKey - Unique key for the query
   * @param {string} content - Response content to cache
   */
  setCache(cacheKey, content) {
    this.cache.set(cacheKey, {
      content: content,
      timestamp: Date.now(),
    });
  }
  
  /**
   * Clear all cached responses
   */
  clearCache() {
    this.cache.clear();
  }
  
  /**
   * Start periodic cleanup of expired entries
   */
  startCleanup() {
    // Run cleanup every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }
  
  /**
   * Clean up expired cache entries and old contexts
   */
  cleanup() {
    const now = Date.now();
    let cacheCleared = 0;
    let contextsCleared = 0;
    
    // Clean expired cache entries
    for (const [key, value] of this.cache.entries()) {
      const age = (now - value.timestamp) / 1000;
      if (age > CACHE_TTL) {
        this.cache.delete(key);
        cacheCleared++;
      }
    }
    
    // Clean old contexts (older than 1 hour with no activity)
    const contextMaxAge = 60 * 60 * 1000; // 1 hour
    for (const [channelId, context] of this.contexts.entries()) {
      if (context.length === 0) {
        this.contexts.delete(channelId);
        contextsCleared++;
        continue;
      }
      
      const lastMessage = context[context.length - 1];
      if ((now - lastMessage.timestamp) > contextMaxAge) {
        this.contexts.delete(channelId);
        contextsCleared++;
      }
    }
    
    if (cacheCleared > 0 || contextsCleared > 0) {
      console.log(`🧹 Cleanup: Cleared ${cacheCleared} cache entries, ${contextsCleared} old contexts`);
    }
  }
  
  /**
   * Get statistics about current store state
   * 
   * @returns {Object} - Stats object
   */
  getStats() {
    return {
      activeContexts: this.contexts.size,
      cachedQueries: this.cache.size,
      totalMessages: Array.from(this.contexts.values()).reduce(
        (sum, ctx) => sum + ctx.length, 0
      ),
    };
  }
}
