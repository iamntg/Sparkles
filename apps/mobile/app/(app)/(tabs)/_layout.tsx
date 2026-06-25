import { Tabs } from 'expo-router';
import { useRouter } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@sparkles/ui';

/** Subset of the props expo-router passes to a custom `tabBar` that we use. */
interface TabBarProps {
    state: { index: number; routes: { key: string; name: string }[] };
    navigation: {
        emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
        navigate: (name: string) => void;
    };
}

const TABS: { name: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { name: 'constellation', label: 'UNIVERSE', icon: 'planet-outline' },
    { name: 'inbox', label: 'IDEAS', icon: 'list-outline' },
    { name: 'settings', label: 'VOID', icon: 'options-outline' },
];

function FloatingNav({ state, navigation }: TabBarProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const bottom = Math.max(insets.bottom, 16) + 8;

    return (
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
            {/* Bottom scrim: fades scrolling content into the background so the
                glass nav floats over darkness, not raw text. */}
            <LinearGradient
                colors={['rgba(9,7,17,0)', 'rgba(9,7,17,0.75)', Theme.colors.background]}
                locations={[0, 0.55, 1]}
                style={[styles.scrim, { height: bottom + 150 }]}
                pointerEvents="none"
            />

            {/* Center capture FAB, floating above the bar */}
            <Pressable
                onPress={() => router.push('/add')}
                style={[styles.fab, { bottom: bottom + 78 }]}
                accessibilityRole="button"
                accessibilityLabel="Capture a new spark"
            >
                <View style={styles.fabInner}>
                    <View style={styles.plusH} />
                    <View style={styles.plusV} />
                </View>
            </Pressable>

            {/* Floating glass nav bar */}
            <View style={[styles.bar, { bottom }]}>
                {TABS.map((tab, index) => {
                    const route = state.routes.find(r => r.name === tab.name);
                    const isFocused = route ? state.index === state.routes.indexOf(route) : false;
                    const color = isFocused ? Theme.colors.amber : Theme.colors.textFaint;

                    const onPress = () => {
                        if (!route) return;
                        const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <Pressable key={tab.name} onPress={onPress} style={styles.tab}>
                            <Ionicons name={tab.icon} size={22} color={color} />
                            <Text style={[styles.tabLabel, { color }]}>{tab.label}</Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

export default function AppLayout() {
    return (
        <Tabs
            tabBar={(props) => <FloatingNav {...(props as unknown as TabBarProps)} />}
            screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}
        >
            <Tabs.Screen name="constellation" />
            <Tabs.Screen name="inbox" />
            <Tabs.Screen name="settings" />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    scrim: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    bar: {
        position: 'absolute',
        left: 24,
        right: 24,
        height: 64,
        borderRadius: Theme.borderRadius.pill,
        backgroundColor: Theme.colors.glass,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        ...Theme.shadows.medium,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
    },
    tabLabel: {
        fontFamily: Theme.fonts.mono,
        fontSize: 9,
        letterSpacing: 1,
    },
    fab: {
        position: 'absolute',
        alignSelf: 'center',
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: Theme.colors.gold,
        alignItems: 'center',
        justifyContent: 'center',
        ...Theme.shadows.gold,
    },
    fabInner: {
        width: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    plusH: {
        position: 'absolute',
        width: 22,
        height: 3,
        borderRadius: 2,
        backgroundColor: Theme.colors.background,
    },
    plusV: {
        position: 'absolute',
        width: 3,
        height: 22,
        borderRadius: 2,
        backgroundColor: Theme.colors.background,
    },
});
