import { getAIProvider } from '@sparkles/ai';

export const aiService = {
  async clusterIdeas(ideas: string[]) {
    const provider = getAIProvider();
    return await provider.clusterIdeas(ideas);
  },
};
