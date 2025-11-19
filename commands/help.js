/**
 * Help Command
 * Returns formatted help message for users
 */

export default function helpCommand() {
  return `
🤖 **ChhotaBot Help**

I'm a friendly AI assistant powered by OpenRouter! Here's how to chat with me:

**Basic Usage:**
• \`!ai <question>\` - Ask me anything
• \`@ChhotaBot <question>\` - Mention me to chat
• \`!help\` - Show this help message

**Special Modes:**
• \`!ai --mode=short <question>\` - Get a brief, concise answer

**Examples:**
\`\`\`
!ai What is the capital of France?
!ai Explain quantum entanglement in simple terms
!ai --mode=short Tell me about black holes
\`\`\`

**Features:**
✨ I remember the last 6 messages in each channel for context
📝 Long responses are automatically split into multiple messages
📎 Very long responses (>16KB) are sent as text files
🛡️ Built-in content filtering and safety checks

**Tips:**
💡 Be specific in your questions for better answers
💡 I work best with clear, well-formed questions
💡 Rate limits apply - if I'm busy, wait a moment and try again

**Need more help?** Just ask me a question!
  `.trim();
}
