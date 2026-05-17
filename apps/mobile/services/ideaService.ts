import { Idea, IdeaStatus, parseIdeaInput } from '@sparkles/core';
import { createIdea as dbCreateIdea, getAllIdeas, getIdea, updateIdea, incrementTagsUsage, searchTags as dbSearchTags, Tag } from '@sparkles/db';
import * as Crypto from 'expo-crypto';

export async function saveNewIdea(text: string, opts?: { title?: string; sourceType?: string; audioLocalPath?: string; transcriptStatus?: string }): Promise<Idea> {
    const id = `idea_${Date.now()}_${await generateRandomString()}`;
    const parsed = parseIdeaInput(text);
    
    const idea: Idea = {
        id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        sourceType: opts?.sourceType || 'text',
        text: parsed.parsedText,
        rawText: parsed.rawText,
        tags: parsed.tags,
        title: opts?.title || '',
        status: IdeaStatus.DRAFT,
        constellationX: Math.random() * 1000,
        constellationY: Math.random() * 1000,
        constellationSeed: Math.random(),
        ...(opts?.audioLocalPath && { audioLocalPath: opts.audioLocalPath }),
        ...(opts?.transcriptStatus && { transcriptStatus: opts.transcriptStatus })
    };

    await dbCreateIdea(idea);
    if (parsed.tags.length > 0) {
        await incrementTagsUsage(parsed.tags).catch(e => console.error("Failed to increment tags", e));
    }
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
    const parsed = parseIdeaInput(idea.rawText || idea.text);
    idea.text = parsed.parsedText;
    idea.rawText = parsed.rawText;
    idea.tags = parsed.tags;
    
    await updateIdea(idea);
    if (parsed.tags.length > 0) {
        await incrementTagsUsage(parsed.tags).catch(e => console.error("Failed to increment tags", e));
    }
}

export async function searchTags(prefix: string): Promise<Tag[]> {
    return dbSearchTags(prefix);
}

export async function deleteIdea(id: string): Promise<void> {
    const { deleteIdea: dbDeleteIdea } = require('@sparkles/db');
    return dbDeleteIdea(id);
}

async function generateRandomString() {
    const bytes = await Crypto.getRandomBytesAsync(8);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
