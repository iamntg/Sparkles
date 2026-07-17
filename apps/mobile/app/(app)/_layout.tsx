import { Stack } from 'expo-router';
import { Theme } from '@sparkles/ui';

export default function AppGroupLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Theme.colors.background } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="add" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
            <Stack.Screen name="idea/[id]" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
        </Stack>
    );
}
