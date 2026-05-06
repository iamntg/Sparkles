import { Link } from '@sparkles/core';
import { getDb } from './db.web';

export async function createLink(link: Link): Promise<void> {
    const db = await getDb();
    await db.put('links', link);
}

export async function upsertLink(link: Link): Promise<void> {
    const db = await getDb();
    await db.put('links', link);
}

export async function getLinksForIdea(ideaId: string): Promise<Link[]> {
    const db = await getDb();
    const links = await db.getAll('links');
    return links
        .filter(l => l.fromIdeaId === ideaId || l.toIdeaId === ideaId)
        .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAllLinks(): Promise<Link[]> {
    const db = await getDb();
    const links = await db.getAll('links');
    return links.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteLink(id: string): Promise<void> {
    const db = await getDb();
    await db.delete('links', id);
}

export async function deleteLinksByIdea(ideaId: string): Promise<void> {
    const db = await getDb();
    const links = await db.getAll('links');
    for (const link of links) {
        if (link.fromIdeaId === ideaId || link.toIdeaId === ideaId) {
            await db.delete('links', link.id);
        }
    }
}
