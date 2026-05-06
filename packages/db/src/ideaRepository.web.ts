import { Idea, IdeaStatus } from '@sparkles/core';
import { getDb } from './db.web';

export async function createIdea(idea: Idea): Promise<void> {
    const db = await getDb();
    await db.put('ideas', idea);
}

export async function getIdea(id: string): Promise<Idea | null> {
    const db = await getDb();
    const idea = await db.get('ideas', id);
    return idea || null;
}

export async function getAllIdeas(): Promise<Idea[]> {
    const db = await getDb();
    const ideas = await db.getAll('ideas');
    return ideas
        .filter(i => i.deletedAt === null || i.deletedAt === undefined)
        .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function updateIdea(idea: Idea): Promise<void> {
    const db = await getDb();
    await db.put('ideas', idea);
}

export async function upsertIdea(idea: Idea): Promise<void> {
    const db = await getDb();
    await db.put('ideas', idea);
}

export async function deleteIdea(id: string): Promise<void> {
    const db = await getDb();
    const idea = await db.get('ideas', id);
    if (idea) {
        idea.deletedAt = Date.now();
        await db.put('ideas', idea);
    }
}
