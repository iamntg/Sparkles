import { getAIProvider, ReviewInput, ChatMessage } from '@sparkles/ai';

export const aiService = {
  async clusterIdeas(ideas: any[]) {
    const provider = getAIProvider();
    return await provider.clusterIdeas(ideas);
  },
  async generateDailyDigest(ideas: any[]) {
    const provider = getAIProvider();
    return await provider.generateDailyDigest(ideas);
  },
  async reviewIdea(idea: ReviewInput, includePlan: boolean) {
    const provider = getAIProvider();
    return await provider.reviewIdea(idea, includePlan);
  },
  async brainstorm(idea: ReviewInput, history: ChatMessage[]) {
    const provider = getAIProvider();
    return await provider.brainstorm(idea, history);
  },
};
