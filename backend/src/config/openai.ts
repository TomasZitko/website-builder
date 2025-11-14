import OpenAI from 'openai';

// Using DeepSeek API (OpenAI-compatible)
export const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com'
});

// Using DeepSeek Chat model for conversation
export const OPENAI_MODEL = 'deepseek-chat';
