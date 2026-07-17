export interface ClusterItem {
  title: string;
  items: string[]; // List of idea strings
}

export interface ClusterResult {
  clusters: ClusterItem[];
}

export interface DailyDigestResult {
  summary: string;
  clusters: ClusterItem[];
}

// The review/chat shapes live in @sparkles/core so the mobile app can use them
// without pulling in the provider SDKs.
import { ReviewInput, IdeaReview, ChatMessage } from '@sparkles/core';

export type { ReviewInput, IdeaReview, ChatMessage, PlanStep } from '@sparkles/core';

export interface AIProvider {
  clusterIdeas(ideas: any[]): Promise<ClusterResult>;
  summarizeIdeas(ideas: string[]): Promise<string>;
  generateDailyDigest(ideas: any[]): Promise<DailyDigestResult>;
  /** Reflections and angles for a single spark, optionally with a plan. */
  reviewIdea(idea: ReviewInput, includePlan: boolean): Promise<IdeaReview>;
  /** One turn of thinking out loud about a spark. Returns plain prose. */
  brainstorm(idea: ReviewInput, history: ChatMessage[]): Promise<string>;
}
