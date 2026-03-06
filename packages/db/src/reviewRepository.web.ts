import { ReviewSession } from '@sparkles/core';

const STORAGE_KEY = 'sparkles_review_sessions';

function getStorage(): ReviewSession[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Failed to read review sessions from localStorage', e);
        return [];
    }
}

function setStorage(sessions: ReviewSession[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
        console.error('Failed to write review sessions to localStorage', e);
    }
}

export async function createReviewSession(session: ReviewSession): Promise<void> {
    const sessions = getStorage();
    sessions.push(session);
    setStorage(sessions);
}

export async function getLatestReviewSession(): Promise<ReviewSession | null> {
    const sessions = getStorage();
    if (sessions.length === 0) return null;
    return sessions.sort((a, b) => b.createdAt - a.createdAt)[0];
}
