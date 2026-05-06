import React, { useState } from 'react';
import { View, StyleSheet, Text, Switch, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader, Theme } from '@sparkles/ui';
import { googleAuthService } from '@/services/googleAuthService';
import { backupService } from '@/services/backupService';

export default function SettingsScreen() {
    const [aiReviewEnabled, setAiReviewEnabled] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const ensureAuth = async () => {
        if (!googleAuthService.isAuthenticated()) {
            await googleAuthService.login();
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

                {googleAuthService.isAuthenticated() && (
                    <Text style={styles.authInfo}>Logged in as {googleAuthService.getUser()?.email}</Text>
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
    authInfo: { fontSize: 14, color: Theme.colors.primary, marginBottom: 12, fontWeight: '500' },
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
