import { ReviewSession } from '@sparkles/core';
import { getDb } from './db.web';

export async function createReviewSession(session: ReviewSession): Promise<void> {
    const db = await getDb();
    await db.put('review_sessions', session);
}

export async function getLatestReviewSession(): Promise<ReviewSession | null> {
    const db = await getDb();
    const sessions = await db.getAll('review_sessions');
    if (sessions.length === 0) return null;
    return sessions.sort((a, b) => b.createdAt - a.createdAt)[0];
}
