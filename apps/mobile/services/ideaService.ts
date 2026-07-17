import { Idea, IdeaStatus } from '@sparkles/core';
import { createIdea as dbCreateIdea, getAllIdeas, getIdea, updateIdea } from '@sparkles/db';
import * as Crypto from 'expo-crypto';

export async function saveNewIdea(text: string, opts?: { title?: string; sourceType?: string; audioLocalPath?: string; transcriptStatus?: string }): Promise<Idea> {
    const id = `idea_${Date.now()}_${await generateRandomString()}`;
    const trimmed = text || '';

    const idea: Idea = {
        id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        sourceType: opts?.sourceType || 'text',
        text: trimmed,
        rawText: trimmed,
        title: opts?.title || '',
        status: IdeaStatus.DRAFT,
        visits: 0,
        constellationX: Math.random() * 1000,
        constellationY: Math.random() * 1000,
        constellationSeed: Math.random(),
        ...(opts?.audioLocalPath && { audioLocalPath: opts.audioLocalPath }),
        ...(opts?.transcriptStatus && { transcriptStatus: opts.transcriptStatus })
    };

    await dbCreateIdea(idea);
    return idea;
}

export async function fetchAllIdeas(): Promise<Idea[]> {
    return getAllIdeas();
}

export async function fetchIdeaById(id: string): Promise<Idea | null> {
    return getIdea(id);
}

/**
 * Save the longer-form detail written in Develop. The spark's own text is left
 * alone — Develop grows a thought, it doesn't rewrite it.
 */
export async function saveIdeaDescription(id: string, description: string): Promise<Idea | null> {
    const idea = await getIdea(id);
    if (!idea) return null;
    const next: Idea = {
        ...idea,
        description: description.trim() || undefined,
        status: description.trim() ? IdeaStatus.DEVELOPED : idea.status,
        updatedAt: Date.now(),
    };
    await updateIdea(next);
    return next;
}

/**
 * Count a visit to a spark. Brightness reads this, so returning to an idea is
 * what makes it glow. Deliberately does not touch updatedAt: reading a spark
 * shouldn't reorder the Stream.
 */
export async function recordVisit(id: string): Promise<void> {
    const idea = await getIdea(id);
    if (!idea) return;
    await updateIdea({ ...idea, visits: (idea.visits || 0) + 1 });
}

export async function deleteIdea(id: string): Promise<void> {
    const { deleteIdea: dbDeleteIdea } = require('@sparkles/db');
    return dbDeleteIdea(id);
}

async function generateRandomString() {
    const bytes = await Crypto.getRandomBytesAsync(8);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
