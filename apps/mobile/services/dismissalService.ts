import AsyncStorage from '@react-native-async-storage/async-storage';

const DISMISSALS_KEY = 'sparkles_dismissals';

type Dismissals = {
    /** Pair keys the user declined to link, so the home screen stops offering them. */
    pairs: string[];
    /** Ideas already resurfaced and waved off, so the digest moves on to another. */
    digestIdeas: string[];
};

const EMPTY: Dismissals = { pairs: [], digestIdeas: [] };

async function read(): Promise<Dismissals> {
    try {
        const raw = await AsyncStorage.getItem(DISMISSALS_KEY);
        if (!raw) return { ...EMPTY };
        return { ...EMPTY, ...JSON.parse(raw) };
    } catch {
        return { ...EMPTY };
    }
}

async function write(d: Dismissals): Promise<void> {
    try {
        await AsyncStorage.setItem(DISMISSALS_KEY, JSON.stringify(d));
    } catch {
        // A dismissal that fails to persist just means we may ask once more.
    }
}

export async function loadDismissals(): Promise<{ pairs: Set<string>; digestIdeas: Set<string> }> {
    const d = await read();
    return { pairs: new Set(d.pairs), digestIdeas: new Set(d.digestIdeas) };
}

export async function dismissPair(key: string): Promise<void> {
    const d = await read();
    if (!d.pairs.includes(key)) d.pairs.push(key);
    await write(d);
}

export async function dismissDigestIdea(id: string): Promise<void> {
    const d = await read();
    if (!d.digestIdeas.includes(id)) d.digestIdeas.push(id);
    await write(d);
}
