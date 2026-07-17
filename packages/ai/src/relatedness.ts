import { Idea, Link } from '@sparkles/core';

// Words too common to signal a meaningful connection between two sparks.
const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'to', 'of', 'in', 'on', 'for', 'with',
    'is', 'are', 'was', 'were', 'be', 'it', 'this', 'that', 'i', 'you', 'we',
    'my', 'me', 'as', 'at', 'by', 'so', 'if', 'do', 'how', 'what', 'about',
    'from', 'into', 'your', 'when', 'then', 'they', 'them', 'than', 'only',
    'over', 'also', 'just', 'like', 'would', 'could', 'there', 'their',
    'which', 'while', 'where', 'between',
]);

const SHARED_WORD_POINTS = 2;
const SAME_TITLE_TOPIC_POINTS = 5;

function significantWords(idea: Idea): string[] {
    const source = `${idea.title || ''} ${idea.text || ''}`.toLowerCase();
    const words = source.match(/[a-z0-9]{3,}/g) || [];
    return words.filter(w => !STOP_WORDS.has(w));
}

function leadingTitleWord(idea: Idea): string {
    return idea.title ? idea.title.split(' ')[0].toLowerCase() : '';
}

export type Relation = {
    score: number;
    /** Human-readable why, e.g. 'Both mention "rockets"'. Empty when unrelated. */
    reason: string;
    sharedWords: string[];
};

/**
 * How strongly two sparks pull toward each other: overlap of the words that
 * carry meaning, plus a nudge when their titles open on the same topic.
 */
export function relateIdeas(a: Idea, b: Idea): Relation {
    const bWords = new Set(significantWords(b));
    const sharedWords = Array.from(new Set(significantWords(a).filter(w => bWords.has(w))));

    let score = sharedWords.length * SHARED_WORD_POINTS;

    const aLead = leadingTitleWord(a);
    const bLead = leadingTitleWord(b);
    const sameTopic = !!aLead && aLead === bLead;
    if (sameTopic) score += SAME_TITLE_TOPIC_POINTS;

    let reason = '';
    if (sharedWords.length) reason = `Both mention “${sharedWords[0]}”`;
    else if (sameTopic) reason = `Both start on “${aLead}”`;

    return { score, reason, sharedWords };
}

export type RelatedIdea = { id: string; score: number; reason: string };

/** Every other spark that relates to `currentIdea` at all, strongest first. */
export function rankRelated(currentIdea: Idea, allIdeas: Idea[]): RelatedIdea[] {
    return allIdeas
        .filter(idea => idea.id !== currentIdea.id)
        .map(idea => {
            const { score, reason } = relateIdeas(currentIdea, idea);
            return { id: idea.id, score, reason };
        })
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score);
}

/**
 * Suggest sparks worth linking to, ranked by relatedness.
 * (Tag-based scoring was removed along with the #tag feature.)
 */
export function suggestLinks(currentIdea: Idea, allIdeas: Idea[]): string[] {
    return rankRelated(currentIdea, allIdeas).map(r => r.id);
}

/** Stable identity for an unordered pair, so a dismissal sticks either way round. */
export function pairKey(aId: string, bId: string): string {
    return aId < bId ? `${aId}::${bId}` : `${bId}::${aId}`;
}

export type SuggestedPair = { a: Idea; b: Idea; score: number; reason: string; key: string };

/** The design only offers a connection it is reasonably confident about. */
const PAIR_THRESHOLD = 4;

/**
 * The single most promising unlinked pair in the whole cosmos — what the home
 * screen offers as "a constellation forming". Returns null when nothing clears
 * the confidence bar, which is the common case for unrelated sparks.
 */
export function bestPairToLink(
    ideas: Idea[],
    links: Link[],
    dismissedKeys: ReadonlySet<string> = new Set()
): SuggestedPair | null {
    const linked = new Set(links.map(l => pairKey(l.fromIdeaId, l.toIdeaId)));

    let best: SuggestedPair | null = null;
    for (let i = 0; i < ideas.length; i++) {
        for (let j = i + 1; j < ideas.length; j++) {
            const a = ideas[i];
            const b = ideas[j];
            const key = pairKey(a.id, b.id);
            if (linked.has(key) || dismissedKeys.has(key)) continue;

            const { score, reason } = relateIdeas(a, b);
            if (!best || score > best.score) best = { a, b, score, reason, key };
        }
    }
    return best && best.score >= PAIR_THRESHOLD ? best : null;
}
