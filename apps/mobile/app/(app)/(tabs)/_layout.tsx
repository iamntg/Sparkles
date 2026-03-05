import { Tabs } from 'expo-router';

export default function AppLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="inbox" options={{ title: 'Inbox' }} />
            <Tabs.Screen name="constellation" options={{ title: 'Constellation' }} />
            <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
        </Tabs>
    );
}
