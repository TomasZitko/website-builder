import { getChatResponse } from '../src/services/openai.service';

describe('OpenAI Service', () => {
  it('should respond to initial message', async () => {
    const messages = [
      { role: 'user' as const, content: 'I need a website for my bakery' }
    ];

    const result = await getChatResponse(messages);

    expect(result.response).toBeDefined();
    expect(result.tokensUsed).toBeGreaterThan(0);
    expect(result.conversationState.websiteType).toBe('bakery');
  });

  it('should extract conversation state correctly', async () => {
    const messages = [
      { role: 'user' as const, content: 'I need a website' },
      { role: 'assistant' as const, content: 'What is your website for?' },
      { role: 'user' as const, content: 'A modern bakery called Sweet Dreams' }
    ];

    const result = await getChatResponse(messages);

    expect(result.conversationState.websiteType).toBe('bakery');
    expect(result.conversationState.style).toBe('modern');
  });

  it('should detect when ready to generate', async () => {
    const messages = [
      { role: 'user' as const, content: 'bakery website' },
      { role: 'assistant' as const, content: 'READY_TO_GENERATE' }
    ];

    const result = await getChatResponse(messages);

    expect(result.conversationState.readyToGenerate).toBe(true);
  });
});
