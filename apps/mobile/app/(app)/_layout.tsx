import { Stack } from 'expo-router';

export default function AppGroupLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="add" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="develop/[id]" options={{ presentation: 'modal' }} />
        </Stack>
    );
}
