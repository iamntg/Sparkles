import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'sparkles_settings';

export type Settings = {
    /** Offer AI reflections and angles on a spark. */
    aiReview: boolean;
    /** Include a suggested plan in an AI review without being asked. */
    autoPlan: boolean;
    /** Gently resurface one drifting spark on the home screen. */
    digest: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
    aiReview: true,
    autoPlan: false,
    digest: true,
};

/**
 * Reads persisted preferences, falling back to defaults for anything missing —
 * so a setting added in a later release doesn't come back undefined.
 */
export async function loadSettings(): Promise<Settings> {
    try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (!raw) return { ...DEFAULT_SETTINGS };
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}

export async function saveSettings(settings: Settings): Promise<void> {
    try {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
        // A preference that fails to persist shouldn't break the screen.
    }
}
