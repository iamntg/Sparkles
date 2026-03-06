import { Link } from '@sparkles/core';
import { createLink, getLinksForIdea } from '@sparkles/db';

export async function addLink(fromIdeaId: string, toIdeaId: string, type: string = 'suggested'): Promise<Link> {
    const link: Link = {
        id: `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fromIdeaId,
        toIdeaId,
        type,
        confidence: 1.0,
        createdAt: Date.now(),
    };

    await createLink(link);
    return link;
}

export async function fetchLinksForIdea(ideaId: string): Promise<Link[]> {
    return getLinksForIdea(ideaId);
}
