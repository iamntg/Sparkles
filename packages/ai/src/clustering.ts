import { Idea, Cluster, ReviewSession } from '@sparkles/core';

export function clusterIdeas(ideas: Idea[]): Cluster[] {
    // Simple logic: group by first word of title
    const groups = new Map<string, string[]>();

    ideas.forEach(idea => {
        const firstWord = idea.title ? idea.title.split(' ')[0].toLowerCase() : 'untitled';
        if (!groups.has(firstWord)) {
            groups.set(firstWord, []);
        }
        groups.get(firstWord)!.push(idea.id);
    });

    return Array.from(groups.entries()).map(([word, ids]) => ({
        id: `cluster-${word}-${Date.now()}`,
        title: `Topics about ${word}`,
        ideaIds: ids
    }));
}

export function generateLocalReviewSession(ideas: Idea[]): ReviewSession {
    const clusters = clusterIdeas(ideas);

    return {
        id: `rs-${Date.now()}`,
        createdAt: Date.now(),
        scope: 'local-clustering',
        resultJson: JSON.stringify(clusters)
    };
}
// Words too common to signal a meaningful connection between two sparks.
const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'to', 'of', 'in', 'on', 'for', 'with',
    'is', 'are', 'was', 'were', 'be', 'it', 'this', 'that', 'i', 'you', 'we',
    'my', 'me', 'as', 'at', 'by', 'so', 'if', 'do', 'how', 'what', 'about'
]);

function significantWords(idea: Idea): Set<string> {
    const source = `${idea.title || ''} ${idea.text || ''}`.toLowerCase();
    const words = source.match(/[a-z0-9]{3,}/g) || [];
    return new Set(words.filter(w => !STOP_WORDS.has(w)));
}

/**
 * Suggest sparks worth linking to, scored by overlap of significant words in
 * their title/text. (Tag-based scoring was removed along with the #tag feature.)
 */
export function suggestLinks(currentIdea: Idea, allIdeas: Idea[]): string[] {
    const currentWords = significantWords(currentIdea);

    const scoredIdeas = allIdeas
        .filter(idea => idea.id !== currentIdea.id)
        .map(idea => {
            const ideaWords = significantWords(idea);
            let score = 0;
            currentWords.forEach(w => {
                if (ideaWords.has(w)) score += 2;
            });

            // Boost when titles share their leading word (loose topical match)
            const firstWordCurrent = currentIdea.title ? currentIdea.title.split(' ')[0].toLowerCase() : '';
            const firstWordIdea = idea.title ? idea.title.split(' ')[0].toLowerCase() : '';
            if (firstWordCurrent && firstWordCurrent === firstWordIdea) {
                score += 5;
            }

            return { id: idea.id, score };
        })
        .sort((a, b) => b.score - a.score);

    return scoredIdeas
        .filter(i => i.score > 0)
        .map(i => i.id);
}
