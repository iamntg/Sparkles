// Web mock for the core database singleton if it's imported directly anywhere
export async function getDb(): Promise<any> {
    console.log('[Web DB] Warning: getDb() called on web. Returning mock.');
    return {
        runAsync: async () => { },
        getFirstAsync: async () => null,
        getAllAsync: async () => [],
        execAsync: async () => { },
        closeAsync: async () => { }
    };
}

export async function closeDb() {
    console.log('[Web DB] Mock closeDb() called.');
}
