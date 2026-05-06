import React, { useState } from 'react';
import { View, StyleSheet, Text, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeader, Theme } from '@sparkles/ui';
import { createVaultBackup, restoreVaultBackup } from '@/services/vaultService';
import { getAllIdeas } from '@sparkles/db';

export default function SettingsScreen() {
    const [aiReviewEnabled, setAiReviewEnabled] = useState(false);

    const handleBackup = async () => {
        try {
            const ideas = await getAllIdeas();
            const vaultData = JSON.stringify({ ideas });
            const path = await createVaultBackup(vaultData, "mock_passphrase_for_now");
            Alert.alert('Backup Created', `Your ideas have been secured at:\n${path}`);
        } catch (e: any) {
            Alert.alert('Backup Error', e.message);
        }
    };

    const handleRestore = async () => {
        Alert.alert('Coming Soon', 'Restore from file is not fully implemented in this preview.');
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
                <Text style={styles.sectionTitle}>Vault</Text>
                <TouchableOpacity style={styles.button} onPress={handleBackup}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={Theme.colors.surface} />
                    <Text style={styles.buttonText}>Backup Now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleRestore}>
                    <Ionicons name="download-outline" size={20} color={Theme.colors.primary} />
                    <Text style={[styles.buttonText, styles.secondaryButtonText]}>Restore from File</Text>
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
    secondaryButton: { backgroundColor: Theme.colors.secondary },
    buttonText: { color: Theme.colors.surface, fontSize: 16, fontWeight: '600' },
    secondaryButtonText: { color: Theme.colors.primary }
});
