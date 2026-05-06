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
export function suggestLinks(currentIdea: Idea, allIdeas: Idea[]): string[] {
    const currentTags = currentIdea.tags || [];
    
    const scoredIdeas = allIdeas
        .filter(idea => idea.id !== currentIdea.id)
        .map(idea => {
            let score = 0;
            const ideaTags = idea.tags || [];
            
            // 1. Tag match score (10 points per matching tag)
            const commonTags = currentTags.filter(tag => ideaTags.includes(tag));
            score += commonTags.length * 10;
            
            // 2. Cluster match (5 points)
            // Group by first word of title logic
            const firstWordCurrent = currentIdea.title ? currentIdea.title.split(' ')[0].toLowerCase() : 'untitled';
            const firstWordIdea = idea.title ? idea.title.split(' ')[0].toLowerCase() : 'untitled';
            if (firstWordCurrent === firstWordIdea && firstWordCurrent !== 'untitled') {
                score += 5;
            }
            
            return { id: idea.id, score };
        })
        .sort((a, b) => b.score - a.score);

    // Return only those with some relevance or just top matches? 
    // Let's return top 10 matches or all if score > 0
    return scoredIdeas
        .filter(i => i.score > 0)
        .map(i => i.id);
}
