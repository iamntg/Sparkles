import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { runMigrations } from '@sparkles/db';
import { googleAuthService } from '@/services/googleAuthService';

export default function RootLayout() {
    useEffect(() => {
        // Initialize services
        const init = async () => {
            await runMigrations().catch(console.error);
            await googleAuthService.init().catch(console.error);
        };
        init();
    }, []);

    return (
        <Stack>
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
    );
}
