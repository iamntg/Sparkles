import { Idea, ReviewSession } from '@sparkles/core';
import { createReviewSession, getReviewSessionById, getLatestReviewSession, getAllReviewSessions } from '@sparkles/db';
import { googleAuthService } from './googleAuthService';

export const digestService = {
  /**
   * Save a generated digest as a local review session.
   */
  async saveDigest(session: ReviewSession): Promise<void> {
    await createReviewSession(session);
  },

  /**
   * Fetch a digest by its primary ID (e.g. 'digest-YYYY-MM-DD').
   */
  async fetchDigestById(id: string): Promise<ReviewSession | null> {
    return await getReviewSessionById(id);
  },

  /**
   * Fetch the latest daily digest.
   */
  async fetchLatestDigest(): Promise<ReviewSession | null> {
    return await getLatestReviewSession();
  },

  /**
   * Fetch all daily digests.
   */
  async fetchAllDigests(): Promise<ReviewSession[]> {
    const sessions = await getAllReviewSessions();
    return sessions.filter(s => s.scope === 'daily-digest');
  },

  /**
   * Trigger backend synthesis for ideas collected today.
   */
  async generateDigestAPI(ideas: Idea[]): Promise<{ summary: string; clusters: any[] }> {
    const user = googleAuthService.getUser();
    if (!user?.id) {
      throw new Error('You need to be logged in to use the AI Daily Digest. Please log in first.');
    }

    if (ideas.length === 0) {
      throw new Error('No ideas to summarize. Capture some ideas first!');
    }

    const payload = ideas.map(idea => ({
      text: idea.text,
      title: idea.title,
      tags: idea.tags || [],
      rawText: idea.rawText || idea.text
    }));

    const apiUrl = process.env.EXPO_PUBLIC_AI_SERVICE_URL || 'http://localhost:3002';
    const response = await fetch(`${apiUrl}/digest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id
      },
      body: JSON.stringify({ ideas: payload })
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('You have reached your daily limit for AI Daily Digests. Please try again tomorrow.');
      }
      if (response.status === 401) {
        throw new Error('Unauthorized. Please ensure you are logged in.');
      }
      throw new Error('Failed to generate daily digest. Ensure the AI service is running.');
    }

    return await response.json();
  }
};
