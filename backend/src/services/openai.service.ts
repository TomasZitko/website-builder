import { openai, OPENAI_MODEL } from '../config/openai';
import { SYSTEM_PROMPT } from './prompts/systemPrompt';
import { CONVERSATIONAL_SYSTEM_PROMPT_2025 } from './prompts/conversationalEnhanced';
import { extractConversationState, ConversationState } from './conversationTracker';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function getChatResponse(
  messages: Message[]
): Promise<{
  response: string;
  conversationState: ConversationState;
  tokensUsed: number;
}> {
  try {
    // Prepend enhanced 2025 conversational system prompt
    const fullMessages = [
      { role: 'system', content: CONVERSATIONAL_SYSTEM_PROMPT_2025 },
      ...messages
    ];

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 SENDING TO DEEPSEEK:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Total messages:', fullMessages.length);
    console.log('📝 Conversation history:');
    fullMessages.forEach((msg, i) => {
      console.log(`  ${i}. [${msg.role}]: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: fullMessages as any,
      temperature: 0.7,
      max_tokens: 800  // ✅ Increased from 200 to give AI more "thinking space"
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not process that.';
    const tokensUsed = completion.usage?.total_tokens || 0;

    console.log('✅ RECEIVED FROM DEEPSEEK:', response);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Extract conversation state
    const conversationState = extractConversationState([
      ...messages,
      { role: 'assistant', content: response }
    ]);

    return {
      response,
      conversationState,
      tokensUsed
    };
  } catch (error: any) {
    console.error('DeepSeek API Error:', error);
    throw new Error(`DeepSeek Error: ${error.message}`);
  }
}

export async function generateWebsitePrompt(
  conversationState: ConversationState
): Promise<string> {
  const { websiteType, businessName, pages, style } = conversationState;

  return `Create a ${style || 'modern'} website for ${businessName || 'a business'}, which is a ${websiteType || 'general website'}.

Include these pages: ${pages?.join(', ') || 'home'}.

Requirements:
- Fully responsive (mobile-first)
- Modern, clean design
- Use CSS Grid and Flexbox
- Include smooth animations
- Professional typography
- Accessible (ARIA labels, semantic HTML)
- No external dependencies (pure HTML/CSS/JS)

Return ONLY valid HTML, CSS, and JavaScript code.`;
}
