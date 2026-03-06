import { Idea, IdeaStatus } from '@sparkles/core';

const STORAGE_KEY = 'sparkles_ideas';

function getStorage(): Idea[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Failed to read from localStorage', e);
        return [];
    }
}

function setStorage(ideas: Idea[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
    } catch (e) {
        console.error('Failed to write to localStorage', e);
    }
}

export async function createIdea(idea: Idea): Promise<void> {
    const ideas = getStorage();
    ideas.push(idea);
    setStorage(ideas);
}

export async function getIdea(id: string): Promise<Idea | null> {
    const ideas = getStorage();
    return ideas.find(i => i.id === id) || null;
}

export async function getAllIdeas(): Promise<Idea[]> {
    const ideas = getStorage();
    return ideas
        .filter(i => i.deletedAt === null || i.deletedAt === undefined)
        .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function updateIdea(idea: Idea): Promise<void> {
    const ideas = getStorage();
    const index = ideas.findIndex(i => i.id === idea.id);
    if (index !== -1) {
        ideas[index] = idea;
        setStorage(ideas);
    } else {
        ideas.push(idea);
        setStorage(ideas);
    }
}

export async function deleteIdea(id: string): Promise<void> {
    const ideas = getStorage();
    const index = ideas.findIndex(i => i.id === id);
    if (index !== -1) {
        ideas[index].deletedAt = Date.now();
        setStorage(ideas);
    }
}
