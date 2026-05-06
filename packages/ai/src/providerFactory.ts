import { AIProvider } from './types';
import { OpenAIProvider } from './providers/openaiProvider';

export function getAIProvider(): AIProvider {
  const providerType = process.env.AI_PROVIDER || 'openai';

  switch (providerType.toLowerCase()) {
    case 'openai':
      return new OpenAIProvider();
    // Case for other providers (e.g., 'claude') can be added here
    default:
      console.warn(`Unsupported AI provider: ${providerType}. Falling back to OpenAI.`);
      return new OpenAIProvider();
  }
}
