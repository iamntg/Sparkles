import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { runMigrations } from '@sparkles/db';
import { Theme } from '@sparkles/ui';
import { googleAuthService } from '@/services/googleAuthService';

// On web, RN inputs render as <input>/<textarea> and pick up the browser's
// default focus outline. Strip it once, globally.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const id = 'sparkles-no-outline';
    if (!document.getElementById(id)) {
        const style = document.createElement('style');
        style.id = id;
        style.textContent = 'input,textarea,[contenteditable]{outline:none!important;box-shadow:none!important;}';
        document.head.appendChild(style);
    }
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
        SpaceMono_400Regular,
        SpaceMono_700Bold,
    });

    useEffect(() => {
        // Initialize services
        const init = async () => {
            await runMigrations().catch(console.error);
            await googleAuthService.init().catch(console.error);
        };
        init();
    }, []);

    if (!fontsLoaded) {
        return <View style={{ flex: 1, backgroundColor: Theme.colors.background }} />;
    }

    return (
        <SafeAreaProvider>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Theme.colors.background } }}>
                <Stack.Screen name="(app)" options={{ headerShown: false }} />
            </Stack>
        </SafeAreaProvider>
    );
}
