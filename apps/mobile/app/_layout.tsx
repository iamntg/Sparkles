import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { runMigrations } from '@sparkles/db';

export default function RootLayout() {
    useEffect(() => {
        // Run DB migrations on app start
        runMigrations().catch(console.error);
    }, []);

    return (
        <Stack>
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
    );
}
