import { AIProvider } from './types';
import { OpenAIProvider } from './providers/openaiProvider';
import { ClaudeProvider } from './providers/claudeProvider';

export function getAIProvider(): AIProvider {
  const providerType = process.env.AI_PROVIDER || 'openai';

  switch (providerType.toLowerCase()) {
    case 'openai':
      return new OpenAIProvider();
    case 'claude':
      return new ClaudeProvider();
    default:
      console.warn(`Unsupported AI provider: ${providerType}. Falling back to OpenAI.`);
      return new OpenAIProvider();
  }
}
