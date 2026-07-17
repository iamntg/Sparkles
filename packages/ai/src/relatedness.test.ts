import { describe, it, expect } from 'vitest';
import type { Idea, Link } from '@sparkles/core';
import { suggestLinks, rankRelated, relateIdeas, bestPairToLink, pairKey } from './relatedness';

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

function makeLink(from: string, to: string): Link {
    return { id: `${from}-${to}`, fromIdeaId: from, toIdeaId: to, type: 'manual', confidence: 1, createdAt: 0 };
}

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

describe('relateIdeas', () => {
    it('explains the connection with a word both sparks use', () => {
        const a = makeIdea({ id: 'a', text: 'a garden of glowing plants' });
        const b = makeIdea({ id: 'b', text: 'plants that survive winter' });

        const rel = relateIdeas(a, b);
        expect(rel.sharedWords).toContain('plants');
        expect(rel.reason).toBe('Both mention “plants”');
        expect(rel.score).toBeGreaterThan(0);
    });

    it('gives no reason when nothing connects the two', () => {
        const rel = relateIdeas(
            makeIdea({ id: 'a', text: 'sourdough bread' }),
            makeIdea({ id: 'b', text: 'orbital rockets' })
        );
        expect(rel.score).toBe(0);
        expect(rel.reason).toBe('');
    });
});

describe('rankRelated', () => {
    it('carries a reason alongside each suggestion', () => {
        const current = makeIdea({ id: 'current', text: 'orbital rockets and propulsion' });
        const other = makeIdea({ id: 'other', text: 'rockets are loud' });

        const [top] = rankRelated(current, [current, other]);
        expect(top.id).toBe('other');
        expect(top.reason).toBe('Both mention “rockets”');
    });
});

describe('pairKey', () => {
    it('is stable regardless of order', () => {
        expect(pairKey('b', 'a')).toBe(pairKey('a', 'b'));
    });
});

describe('bestPairToLink', () => {
    const a = makeIdea({ id: 'a', text: 'orbital rockets and propulsion systems' });
    const b = makeIdea({ id: 'b', text: 'propulsion for rockets, orbital tests' });
    const c = makeIdea({ id: 'c', text: 'baking sourdough bread' });

    it('picks the strongest unlinked pair and says why', () => {
        const pair = bestPairToLink([a, b, c], []);
        expect(pair).not.toBeNull();
        expect([pair!.a.id, pair!.b.id].sort()).toEqual(['a', 'b']);
        expect(pair!.reason).toContain('Both mention');
    });

    it('ignores pairs that are already linked', () => {
        expect(bestPairToLink([a, b, c], [makeLink('a', 'b')])).toBeNull();
    });

    it('ignores a link recorded in the opposite direction', () => {
        expect(bestPairToLink([a, b, c], [makeLink('b', 'a')])).toBeNull();
    });

    it('respects a dismissed pair', () => {
        const dismissed = new Set([pairKey('a', 'b')]);
        expect(bestPairToLink([a, b, c], [], dismissed)).toBeNull();
    });

    it('stays quiet when nothing clears the confidence bar', () => {
        const weak1 = makeIdea({ id: 'w1', text: 'rockets' });
        const weak2 = makeIdea({ id: 'w2', text: 'rockets' }); // one shared word = 2, under threshold
        expect(bestPairToLink([weak1, weak2], [])).toBeNull();
    });

    it('has nothing to offer in an empty or single-spark cosmos', () => {
        expect(bestPairToLink([], [])).toBeNull();
        expect(bestPairToLink([a], [])).toBeNull();
    });
});
