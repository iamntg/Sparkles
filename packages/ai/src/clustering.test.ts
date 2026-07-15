import { describe, it, expect } from 'vitest';
import type { Idea } from '@sparkles/core';
import { clusterIdeas, suggestLinks, generateLocalReviewSession } from './clustering';

// Minimal Idea factory — only the fields the functions under test read.
function makeIdea(over: Partial<Idea>): Idea {
    return {
        id: 'id',
        createdAt: 0,
        updatedAt: 0,
        sourceType: 'text',
        text: '',
        title: '',
        status: 'draft' as Idea['status'],
        ...over,
    };
}

describe('clusterIdeas', () => {
    it('groups ideas by the first word of their title, case-insensitively', () => {
        const clusters = clusterIdeas([
            makeIdea({ id: 'a', title: 'Space travel' }),
            makeIdea({ id: 'b', title: 'space station' }),
            makeIdea({ id: 'c', title: 'Ocean depths' }),
        ]);

        const space = clusters.find(c => c.title === 'Topics about space');
        const ocean = clusters.find(c => c.title === 'Topics about ocean');

        expect(clusters).toHaveLength(2);
        expect(space?.ideaIds).toEqual(['a', 'b']);
        expect(ocean?.ideaIds).toEqual(['c']);
    });

    it('buckets ideas with no title under "untitled"', () => {
        const clusters = clusterIdeas([makeIdea({ id: 'a', title: '' })]);
        expect(clusters).toHaveLength(1);
        expect(clusters[0].title).toBe('Topics about untitled');
        expect(clusters[0].ideaIds).toEqual(['a']);
    });

    it('returns nothing for an empty list', () => {
        expect(clusterIdeas([])).toEqual([]);
    });
});

describe('suggestLinks', () => {
    it('suggests ideas that share significant words, ranked by overlap', () => {
        const current = makeIdea({ id: 'current', text: 'orbital rockets and propulsion' });
        const strong = makeIdea({ id: 'strong', text: 'propulsion systems for rockets' });
        const weak = makeIdea({ id: 'weak', text: 'rockets are loud' });
        const unrelated = makeIdea({ id: 'unrelated', text: 'baking sourdough bread' });

        const result = suggestLinks(current, [current, strong, weak, unrelated]);

        expect(result).toEqual(['strong', 'weak']); // ordered by score, unrelated dropped
        expect(result).not.toContain('current'); // never suggests itself
        expect(result).not.toContain('unrelated'); // zero overlap is filtered out
    });

    it('ignores common stop words when scoring', () => {
        const current = makeIdea({ id: 'current', text: 'the and of it' });
        const other = makeIdea({ id: 'other', text: 'the and of it' });

        expect(suggestLinks(current, [current, other])).toEqual([]);
    });

    it('boosts ideas whose title shares its leading word', () => {
        const current = makeIdea({ id: 'current', title: 'Space exploration' });
        const sameTopic = makeIdea({ id: 'same', title: 'Space station' });

        expect(suggestLinks(current, [current, sameTopic])).toContain('same');
    });
});

describe('generateLocalReviewSession', () => {
    it('wraps the clustering result in a local-clustering session', () => {
        const session = generateLocalReviewSession([
            makeIdea({ id: 'a', title: 'Space one' }),
            makeIdea({ id: 'b', title: 'Space two' }),
        ]);

        expect(session.scope).toBe('local-clustering');
        expect(session.id).toMatch(/^rs-/);
        expect(typeof session.createdAt).toBe('number');

        const clusters = JSON.parse(session.resultJson);
        expect(clusters).toHaveLength(1);
        expect(clusters[0].ideaIds).toEqual(['a', 'b']);
    });

    it('produces an empty result set for no ideas', () => {
        const session = generateLocalReviewSession([]);
        expect(JSON.parse(session.resultJson)).toEqual([]);
    });
});
