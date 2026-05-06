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

export async function upsertLink(link: Link): Promise<void> {
    const links = getStorage();
    // Filter out ANY existing records with this ID (cleaning up potential duplicates)
    const filtered = links.filter(l => l.id !== link.id);
    filtered.push(link);
    setStorage(filtered);
}

export async function getLinksForIdea(ideaId: string): Promise<Link[]> {
    const links = getStorage();
    return links
        .filter(l => l.fromIdeaId === ideaId || l.toIdeaId === ideaId)
        .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAllLinks(): Promise<Link[]> {
    const links = getStorage();
    return links.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteLink(id: string): Promise<void> {
    const links = getStorage();
    const filtered = links.filter(l => l.id !== id);
    setStorage(filtered);
}

export async function deleteLinksByIdea(ideaId: string): Promise<void> {
    const links = getStorage();
    const filtered = links.filter(l => l.fromIdeaId !== ideaId && l.toIdeaId !== ideaId);
    setStorage(filtered);
}
