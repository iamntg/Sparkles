import { Link } from '@sparkles/core';

const STORAGE_KEY = 'sparkles_links';

function getStorage(): Link[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Failed to read links from localStorage', e);
        return [];
    }
}

function setStorage(links: Link[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    } catch (e) {
        console.error('Failed to write links to localStorage', e);
    }
}

export async function createLink(link: Link): Promise<void> {
    const links = getStorage();
    links.push(link);
    setStorage(links);
}

export async function getLinksForIdea(ideaId: string): Promise<Link[]> {
    const links = getStorage();
    return links
        .filter(l => l.fromIdeaId === ideaId || l.toIdeaId === ideaId)
        .sort((a, b) => b.createdAt - a.createdAt);
}
