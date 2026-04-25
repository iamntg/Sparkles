import React, { useState } from 'react';
import { View, StyleSheet, Text, Switch, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader, Theme } from '@sparkles/ui';
import { googleAuthService } from '@/services/googleAuthService';
import { backupService } from '@/services/backupService';

export default function SettingsScreen() {
    const [aiReviewEnabled, setAiReviewEnabled] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [authenticated, setAuthenticated] = useState(googleAuthService.isAuthenticated());

    const ensureAuth = async () => {
        if (!googleAuthService.isAuthenticated()) {
            await googleAuthService.login();
            setAuthenticated(true);
        }
    };

    const handleBackup = async () => {
        setIsProcessing(true);
        try {
            await ensureAuth();
            await backupService.backup();
            Alert.alert('Success', 'Backup uploaded to Google Drive!');
        } catch (e: any) {
            Alert.alert('Backup Error', e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRestore = async () => {
        setIsProcessing(true);
        try {
            await ensureAuth();
            await backupService.restore();
            Alert.alert('Success', 'Data restored from Google Drive!');
        } catch (e: any) {
            Alert.alert('Restore Error', e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSignOut = async () => {
        const performLogout = async () => {
            await googleAuthService.logout();
            setAuthenticated(false);
            if (Platform.OS === 'web') {
                window.alert('You have been signed out from Google.');
            } else {
                Alert.alert('Signed Out', 'You have been signed out from Google.');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to sign out?')) {
                performLogout();
            }
        } else {
            Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: performLogout }
            ]);
        }
    };

    return (
        <View style={styles.container}>
            <SectionHeader title="Settings" />

            <View style={styles.section}>
                <View style={styles.row}>
                    <View style={styles.labelContainer}>
                        <Ionicons name="sparkles-outline" size={20} color={Theme.colors.primary} style={styles.icon} />
                        <Text style={styles.label}>AI Review</Text>
                    </View>
                    <Switch
                        disabled
                        value={aiReviewEnabled}
                        onValueChange={setAiReviewEnabled}
                        trackColor={{ false: "#ddd", true: Theme.colors.primary }}
                        thumbColor={Platform.OS === 'ios' ? undefined : Theme.colors.surface}
                    />
                </View>
                <Text style={styles.subLabel}>Automatically summarize and cluster your daily ideas.</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cloud Backup (Google Drive)</Text>

                {authenticated && (
                    <View style={styles.authInfoContainer}>
                        <Text style={styles.authInfo} numberOfLines={1}>Logged in as {googleAuthService.getUser()?.email}</Text>
                        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                            <Text style={styles.signOutText}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.button, isProcessing && styles.disabledButton]}
                    onPress={handleBackup}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color={Theme.colors.surface} />
                    ) : (
                        <>
                            <Ionicons name="cloud-upload-outline" size={20} color={Theme.colors.surface} />
                            <Text style={styles.buttonText}>Backup Now</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton, isProcessing && styles.disabledButton]}
                    onPress={handleRestore}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color={Theme.colors.primary} />
                    ) : (
                        <>
                            <Ionicons name="cloud-download-outline" size={20} color={Theme.colors.primary} />
                            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Restore from File</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: Theme.colors.background, paddingTop: Theme.spacing.header },
    section: { marginVertical: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, marginBottom: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    labelContainer: { flexDirection: 'row', alignItems: 'center' },
    icon: { marginRight: 12 },
    label: { fontSize: 17, color: Theme.colors.text, fontWeight: '500' },
    subLabel: { fontSize: 14, color: Theme.colors.textMuted, marginTop: 4, marginLeft: 32 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
    authInfoContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    authInfo: { fontSize: 14, color: Theme.colors.primary, fontWeight: '500', flex: 1 },
    signOutButton: { 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        backgroundColor: Theme.colors.errorLight, 
        borderRadius: Theme.borderRadius.sm,
        marginLeft: 8
    },
    signOutText: { fontSize: 13, color: Theme.colors.error, fontWeight: '700' },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.colors.primary,
        paddingVertical: 14,
        borderRadius: Theme.borderRadius.md,
        marginBottom: 12,
        gap: 10
    },
    disabledButton: { opacity: 0.6 },
    secondaryButton: { backgroundColor: Theme.colors.secondary },
    buttonText: { color: Theme.colors.surface, fontSize: 16, fontWeight: '600' },
    secondaryButtonText: { color: Theme.colors.primary }
});
