/**
 * Content Moderation and Sanitization
 * Filters harmful content and sanitizes user input
 */

/**
 * Sanitize user input by removing potentially harmful patterns
 * 
 * @param {string} input - Raw user input
 * @returns {string} - Sanitized input
 */
export function sanitizeInput(input) {
  let sanitized = input;
  
  // Remove Discord invite links
  sanitized = sanitized.replace(/discord\.gg\/[\w-]+/gi, '[INVITE_REMOVED]');
  sanitized = sanitized.replace(/discord\.com\/invite\/[\w-]+/gi, '[INVITE_REMOVED]');
  sanitized = sanitized.replace(/discordapp\.com\/invite\/[\w-]+/gi, '[INVITE_REMOVED]');
  
  // Remove email addresses (basic pattern)
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REMOVED]');
  
  // Remove phone numbers (common patterns)
  // US format: (123) 456-7890, 123-456-7890, 1234567890
  sanitized = sanitized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE_REMOVED]');
  sanitized = sanitized.replace(/\(\d{3}\)\s*\d{3}[-.]?\d{4}/g, '[PHONE_REMOVED]');
  
  // Remove credit card patterns (groups of 4 digits)
  sanitized = sanitized.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CC_REMOVED]');
  
  // Remove IP addresses
  sanitized = sanitized.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_REMOVED]');
  
  // Trim excessive whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Check if content violates moderation rules
 * 
 * @param {string} input - User input to check
 * @returns {Object} - {allowed: boolean, reason: string, alternative: string}
 */
export function checkModeration(input) {
  const lowerInput = input.toLowerCase();
  
  // Disallowed content patterns and keywords
  const rules = [
    {
      patterns: [
        /\b(hack|crack|exploit|breach|bypass)\s+(account|password|security)/i,
        /how\s+to\s+(hack|steal|break\s+into)/i,
        /\b(ddos|dos)\s+attack/i,
      ],
      reason: "I can't help with hacking or unauthorized access.",
      alternative: "Try learning about cybersecurity ethically through courses like CompTIA Security+ or ethical hacking certifications.",
    },
    {
      patterns: [
        /\b(bomb|explosive|weapon|gun)\s+(make|build|create|construct)/i,
        /how\s+to\s+(make|build)\s+(explosive|bomb|weapon)/i,
      ],
      reason: "I can't provide instructions for making weapons or explosives.",
      alternative: "If you're interested in chemistry or engineering, try educational resources like Khan Academy or university courses.",
    },
    {
      patterns: [
        /\b(child|minor|underage|kid|teen)\b.*\b(sexual|nude|porn|explicit)/i,
        /\b(sexual|nude|porn|explicit)\b.*\b(child|minor|underage|kid|teen)/i,
      ],
      reason: "This request involves illegal content. I cannot assist with this.",
      alternative: null,
    },
    {
      patterns: [
        /\b(dox|doxx|personal\s+info|address|phone\s+number)\b.*\b(find|locate|get|obtain)/i,
        /find\s+(someone's|their)\s+(address|phone|location)/i,
      ],
      reason: "I can't help with finding personal information about individuals.",
      alternative: "For legitimate people search, try public directories or social media platforms with proper authorization.",
    },
    {
      patterns: [
        /\b(suicide|kill\s+myself|end\s+my\s+life|self\s+harm)/i,
      ],
      reason: "I'm concerned about you. Please reach out for help.",
      alternative: "**Crisis Resources:** National Suicide Prevention Lifeline: 988 (US) or visit https://findahelpline.com for your country.",
    },
    {
      patterns: [
        /\b(fraud|scam|phish|forge|counterfeit)\s+(money|document|identity|credit\s+card)/i,
        /how\s+to\s+(scam|fraud|steal\s+money)/i,
      ],
      reason: "I can't assist with illegal activities like fraud or scams.",
      alternative: "If you're interested in cybersecurity, explore ethical hacking and fraud prevention instead.",
    },
  ];
  
  // Check each rule
  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      if (pattern.test(input)) {
        return {
          allowed: false,
          reason: rule.reason,
          alternative: rule.alternative,
        };
      }
    }
  }
  
  // Additional keyword checks (less strict)
  const suspiciousKeywords = [
    'illegal', 'unlawful', 'drug', 'narcotics', 'trafficking',
  ];
  
  const suspiciousCount = suspiciousKeywords.filter(keyword => 
    lowerInput.includes(keyword)
  ).length;
  
  // If multiple suspicious keywords, flag it
  if (suspiciousCount >= 2) {
    // Check context - might be legitimate question
    const legitimateContexts = [
      'legal', 'law', 'ethics', 'study', 'research', 'article', 'news',
    ];
    
    const hasLegitContext = legitimateContexts.some(ctx => 
      lowerInput.includes(ctx)
    );
    
    if (!hasLegitContext) {
      return {
        allowed: false,
        reason: "This request seems to involve potentially illegal or harmful topics.",
        alternative: "If you have a legitimate question about law, ethics, or research, please rephrase it more clearly.",
      };
    }
  }
  
  // Content appears safe
  return {
    allowed: true,
    reason: null,
    alternative: null,
  };
}

/**
 * Check if input is excessively long (potential spam/abuse)
 * 
 * @param {string} input - User input
 * @param {number} maxLength - Maximum allowed length (default: 2000)
 * @returns {boolean} - True if input is acceptable length
 */
export function checkInputLength(input, maxLength = 2000) {
  return input.length <= maxLength;
}

/**
 * Detect repeated characters (spam pattern)
 * 
 * @param {string} input - User input
 * @returns {boolean} - True if input contains excessive repetition
 */
export function detectSpam(input) {
  // Check for same character repeated many times
  const repeatedChar = /(.)\1{20,}/;
  if (repeatedChar.test(input)) {
    return true;
  }
  
  // Check for repeated patterns
  const repeatedWord = /\b(\w+)\s+\1\s+\1\s+\1/i;
  if (repeatedWord.test(input)) {
    return true;
  }
  
  return false;
}
