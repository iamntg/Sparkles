import { getDb } from './db';
import { ReviewSession } from '@sparkles/core';

export async function createReviewSession(session: ReviewSession): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO review_sessions (id, createdAt, scope, resultJson) VALUES (?, ?, ?, ?)`,
    [session.id, session.createdAt, session.scope, session.resultJson]
  );
}

export async function getLatestReviewSession(): Promise<ReviewSession | null> {
  const db = await getDb();
  const result = await db.getFirstAsync<ReviewSession>(
    `SELECT * FROM review_sessions ORDER BY createdAt DESC LIMIT 1`
  );
  return result || null;
}
