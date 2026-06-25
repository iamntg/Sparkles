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

export async function saveIdeaChanges(idea: Idea): Promise<void> {
    idea.updatedAt = Date.now();
    const next = idea.rawText ?? idea.text;
    idea.text = next;
    idea.rawText = next;

    await updateIdea(idea);
}

export async function deleteIdea(id: string): Promise<void> {
    const { deleteIdea: dbDeleteIdea } = require('@sparkles/db');
    return dbDeleteIdea(id);
}

async function generateRandomString() {
    const bytes = await Crypto.getRandomBytesAsync(8);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
