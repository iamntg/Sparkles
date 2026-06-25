import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@sparkles/ui';
import { CosmicBackground } from '@/components/CosmicBackground';
import { googleAuthService } from '@/services/googleAuthService';
import { backupService } from '@/services/backupService';

function Toggle({ value, disabled, onToggle }: { value: boolean; disabled?: boolean; onToggle?: () => void }) {
    return (
        <Pressable onPress={disabled ? undefined : onToggle} style={{ opacity: disabled ? 0.5 : 1 }}>
            {value ? (
                <LinearGradient
                    colors={[Theme.colors.gold, Theme.colors.amber]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.track}
                >
                    <View style={[styles.knob, { alignSelf: 'flex-end' }]} />
                </LinearGradient>
            ) : (
                <View style={[styles.track, styles.trackOff]}>
                    <View style={[styles.knob, { alignSelf: 'flex-start' }]} />
                </View>
            )}
        </Pressable>
    );
}

type PrefKey = 'aiReview' | 'autoPlan' | 'digest';

const PREFERENCES: { key: PrefKey; label: string; desc: string }[] = [
    { key: 'aiReview', label: 'AI Review', desc: 'Let Sparkles refine and critique each spark' },
    { key: 'autoPlan', label: 'Auto Generate Plan', desc: 'Turn a spark into actionable steps automatically' },
    { key: 'digest', label: 'Weekly rediscovery', desc: 'Gently resurface one drifting spark each week' },
];

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const [authenticated, setAuthenticated] = useState(googleAuthService.isAuthenticated());
    const [busy, setBusy] = useState(false);
    const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({ aiReview: true, autoPlan: false, digest: true });
    const togglePref = (key: PrefKey) => setPrefs(p => ({ ...p, [key]: !p[key] }));

    useFocusEffect(
        useCallback(() => {
            setAuthenticated(googleAuthService.isAuthenticated());
        }, [])
    );

    const user = googleAuthService.getUser();
    const email = user?.email ?? '';
    const name = (user as any)?.name || (email ? email.split('@')[0] : 'Stargazer');
    const initial = (name || 'S').charAt(0).toUpperCase();

    const handleSignIn = async () => {
        setBusy(true);
        try {
            await googleAuthService.login();
            setAuthenticated(true);
        } catch (e: any) {
            if (e?.message !== 'Login cancelled') Alert.alert('Sign In Error', e?.message ?? 'Failed to sign in');
        } finally {
            setBusy(false);
        }
    };

    const handleSignOut = () => {
        const doLogout = async () => {
            await googleAuthService.logout();
            setAuthenticated(false);
        };
        if (Platform.OS === 'web') {
            if (window.confirm('Sign out of Google?')) doLogout();
        } else {
            Alert.alert('Sign Out', 'Sign out of Google?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: doLogout },
            ]);
        }
    };

    const ensureAuth = async () => {
        if (!googleAuthService.isAuthenticated()) {
            await googleAuthService.login();
            setAuthenticated(true);
        }
    };

    const handleBackup = async () => {
        setBusy(true);
        try {
            await ensureAuth();
            await backupService.backup();
            Alert.alert('Success', 'Backup uploaded to Google Drive!');
        } catch (e: any) {
            if (e?.message !== 'Login cancelled') Alert.alert('Backup Error', e?.message ?? 'Backup failed');
        } finally {
            setBusy(false);
        }
    };

    const handleRestore = async () => {
        setBusy(true);
        try {
            await ensureAuth();
            await backupService.restore();
            Alert.alert('Success', 'Data restored from Google Drive!');
        } catch (e: any) {
            if (e?.message !== 'Login cancelled') Alert.alert('Restore Error', e?.message ?? 'Restore failed');
        } finally {
            setBusy(false);
        }
    };

    return (
        <View style={styles.container}>
            <CosmicBackground starCount={45} amberGlow={false} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: insets.top + 48, paddingHorizontal: 24, paddingBottom: 150 }}
            >
                <Text style={styles.eyebrow}>THE VOID</Text>
                <Text style={styles.title}>Settings</Text>

                {/* Account card */}
                <Pressable onPress={authenticated ? handleSignOut : handleSignIn} style={styles.accountCard}>
                    <LinearGradient
                        colors={['#80409B', Theme.colors.amber]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.accountAvatar}
                    >
                        <Text style={styles.accountInitial}>{authenticated ? initial : '✦'}</Text>
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.accountName}>{authenticated ? name : 'Sign in to sync'}</Text>
                        <Text style={styles.accountEmail} numberOfLines={1}>
                            {authenticated ? email : 'Connect Google Drive'}
                        </Text>
                    </View>
                    {busy ? (
                        <ActivityIndicator color={Theme.colors.primary} />
                    ) : authenticated ? (
                        <View style={styles.syncedBadge}>
                            <Text style={styles.syncedText}>SYNCED</Text>
                        </View>
                    ) : (
                        <Ionicons name="logo-google" size={20} color={Theme.colors.textSecondary} />
                    )}
                </Pressable>

                {/* Preferences */}
                <Text style={styles.sectionLabel}>PREFERENCES</Text>
                {PREFERENCES.map((p, i) => (
                    <View key={p.key} style={[styles.row, i < PREFERENCES.length - 1 && { marginBottom: 10 }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.rowTitle}>{p.label}</Text>
                            <Text style={styles.rowDesc}>{p.desc}</Text>
                        </View>
                        <Toggle value={prefs[p.key]} onToggle={() => togglePref(p.key)} />
                    </View>
                ))}

                {/* Data */}
                <Text style={styles.sectionLabel}>DATA</Text>
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle}>Back up the cosmos</Text>
                        <Text style={styles.rowDesc}>
                            {authenticated ? 'Sync your sparks to Google Drive' : 'Sign in to enable backups'}
                        </Text>
                    </View>
                    <Pressable onPress={handleBackup} disabled={busy} style={[styles.pill, styles.pillGold]}>
                        <Text style={[styles.pillText, { color: Theme.colors.gold }]}>BACK UP</Text>
                    </Pressable>
                </View>
                <View style={[styles.row, { marginTop: 10 }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.rowTitle}>Restore from a backup</Text>
                        <Text style={styles.rowDesc}>Pull your sparks back from the cloud</Text>
                    </View>
                    <Pressable onPress={handleRestore} disabled={busy} style={[styles.pill, styles.pillLavender]}>
                        <Text style={[styles.pillText, { color: Theme.colors.primary }]}>RESTORE</Text>
                    </Pressable>
                </View>

                <Text style={styles.footer}>SPARKLES · v1.0 · MADE OF STARDUST</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    eyebrow: { fontFamily: Theme.fonts.mono, fontSize: 10, letterSpacing: 3, color: Theme.colors.amber, opacity: 0.85 },
    title: { fontFamily: Theme.fonts.bold, fontSize: 26, color: Theme.colors.text, marginTop: 4, letterSpacing: -0.4 },

    accountCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginTop: 22,
        padding: 18,
        borderRadius: 20,
        backgroundColor: 'rgba(128,64,155,0.16)',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    accountAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
    accountInitial: { color: '#fff', fontFamily: Theme.fonts.bold, fontSize: 19 },
    accountName: { fontFamily: Theme.fonts.semibold, fontSize: 16, color: Theme.colors.text },
    accountEmail: { fontFamily: Theme.fonts.mono, fontSize: 11, color: Theme.colors.label, marginTop: 3 },
    syncedBadge: { borderWidth: 1, borderColor: 'rgba(124,224,168,0.3)', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5 },
    syncedText: { fontFamily: Theme.fonts.mono, fontSize: 9, letterSpacing: 1, color: Theme.colors.success },

    sectionLabel: { fontFamily: Theme.fonts.mono, fontSize: 10, letterSpacing: 2, color: Theme.colors.textFaint, marginTop: 26, marginBottom: 10 },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 16,
        borderRadius: 16,
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.borderSoft,
    },
    rowTitle: { fontFamily: Theme.fonts.medium, fontSize: 14, color: Theme.colors.textSecondary },
    rowDesc: { fontFamily: Theme.fonts.regular, fontSize: 12, color: Theme.colors.textMuted, marginTop: 3 },

    pill: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
    pillGold: { borderColor: 'rgba(255,215,0,0.3)' },
    pillLavender: { borderColor: 'rgba(176,130,255,0.3)' },
    pillText: { fontFamily: Theme.fonts.mono, fontSize: 11, letterSpacing: 0.5 },

    track: { width: 46, height: 27, borderRadius: 14, padding: 3, justifyContent: 'center' },
    trackOff: { backgroundColor: 'rgba(255,255,255,0.13)' },
    knob: {
        width: 21,
        height: 21,
        borderRadius: 11,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    footer: { fontFamily: Theme.fonts.mono, fontSize: 10, letterSpacing: 2, color: '#4f4a63', textAlign: 'center', marginTop: 30 },
});
