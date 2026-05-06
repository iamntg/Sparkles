import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { Theme } from '@sparkles/ui';

export default function AppLayout() {
    return (
        <Tabs screenOptions={{ 
            headerShown: false,
            tabBarActiveTintColor: Theme.colors.primary,
            tabBarInactiveTintColor: Theme.colors.gray,
            tabBarStyle: {
                backgroundColor: Theme.colors.surface,
                borderTopWidth: 0,
                elevation: 10,
                shadowColor: Theme.colors.shadow,
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
                height: Platform.OS === 'ios' ? 88 : 64,
                paddingBottom: Platform.OS === 'ios' ? 28 : 12,
                paddingTop: 12,
            },
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
            }
        }}>
            <Tabs.Screen 
                name="inbox" 
                options={{ 
                    title: 'Inbox',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="snow-outline" size={size} color={color} />
                    )
                }} 
            />
            <Tabs.Screen 
                name="constellation" 
                options={{ 
                    title: 'Sparkles',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="sparkles-outline" size={size + 4} color={color} />
                    )
                }} 
            />
            <Tabs.Screen 
                name="settings" 
                options={{ 
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings-outline" size={size} color={color} />
                    )
                }} 
            />
        </Tabs>
    );
}
