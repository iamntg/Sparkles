import { describe, it, expect } from 'vitest';
import { brightnessFor, brightnessLabel } from './brightness';
import { Idea, IdeaStatus } from './models';

const NOW = 1_700_000_000_000;
const DAY = 86400000;

function idea(over: Partial<Idea> = {}): Idea {
    return {
        id: 'i1',
        createdAt: NOW,
        updatedAt: NOW,
        sourceType: 'text',
        text: 'a spark',
        title: '',
        status: IdeaStatus.DRAFT,
        ...over,
    };
}

describe('brightnessFor', () => {
    it('brightens as a spark is revisited', () => {
        const cold = brightnessFor(idea({ visits: 0 }), 0, NOW);
        const warm = brightnessFor(idea({ visits: 2 }), 0, NOW);
        const hot = brightnessFor(idea({ visits: 4 }), 0, NOW);
        expect(warm).toBeGreaterThan(cold);
        expect(hot).toBeGreaterThan(warm);
    });

    it('brightens as a spark gains links', () => {
        const lone = brightnessFor(idea(), 0, NOW);
        const linked = brightnessFor(idea(), 3, NOW);
        expect(linked).toBeGreaterThan(lone);
    });

    it('dims with age', () => {
        const fresh = brightnessFor(idea({ createdAt: NOW, visits: 2 }), 1, NOW);
        const old = brightnessFor(idea({ createdAt: NOW - 30 * DAY, visits: 2 }), 1, NOW);
        expect(old).toBeLessThan(fresh);
    });

    it('treats a missing visit count as zero rather than NaN', () => {
        expect(brightnessFor(idea({ visits: undefined }), 0, NOW)).toBeCloseTo(
            brightnessFor(idea({ visits: 0 }), 0, NOW)
        );
    });

    it('never goes fully dark, and never exceeds full', () => {
        const faintest = brightnessFor(idea({ createdAt: NOW - 365 * DAY, visits: 0 }), 0, NOW);
        const brightest = brightnessFor(idea({ visits: 99 }), 99, NOW);
        expect(faintest).toBeGreaterThanOrEqual(0.16);
        expect(brightest).toBeLessThanOrEqual(1);
    });
});

describe('brightnessLabel', () => {
    it('names each band', () => {
        expect(brightnessLabel(0.9)).toBe('GLOWING');
        expect(brightnessLabel(0.6)).toBe('STEADY');
        expect(brightnessLabel(0.35)).toBe('DRIFTING');
        expect(brightnessLabel(0.2)).toBe('FADING');
    });
});
