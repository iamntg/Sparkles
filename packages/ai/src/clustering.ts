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
export function suggestLinks(currentIdea: Idea, allIdeas: Idea[]): String[] {
    const clusters = clusterIdeas(allIdeas);
    const myCluster = clusters.find(c => c.ideaIds.includes(currentIdea.id));

    if (!myCluster) return [];

    // Return all other ideas in the same cluster
    return myCluster.ideaIds.filter(id => id !== currentIdea.id);
}
