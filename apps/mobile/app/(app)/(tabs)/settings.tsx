import React, { useState } from 'react';
import { View, StyleSheet, Button, Text, Switch } from 'react-native';
import { SectionHeader } from '@sparkles/ui';
import { createVaultBackup, restoreVaultBackup } from '@/services/vaultService';
import { getAllIdeas } from '@sparkles/db';

export default function SettingsScreen() {
    const [aiReviewEnabled, setAiReviewEnabled] = useState(false);

    const handleBackup = async () => {
        try {
            const ideas = await getAllIdeas();
            const vaultData = JSON.stringify({ ideas });
            const path = await createVaultBackup(vaultData, "mock_passphrase_for_now");
            alert(`Backup created at: ${path}`);
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        }
    };

    const handleRestore = async () => {
        // In a real app we'd use expo-document-picker to pick a file
        alert('Restore from file not fully implemented in UI mock');
    };

    return (
        <View style={styles.container}>
            <SectionHeader title="Settings" />

            <View style={styles.section}>
                <Text style={styles.label}>Enable AI Review (Future)</Text>
                <Switch value={aiReviewEnabled} onValueChange={setAiReviewEnabled} />
            </View>

            <View style={styles.section}>
                <SectionHeader title="Vault" />
                <View style={styles.buttonRow}>
                    <Button title="Backup Now" onPress={handleBackup} />
                </View>
                <View style={styles.buttonRow}>
                    <Button title="Restore from File" onPress={handleRestore} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5', paddingTop: 60 },
    section: { marginVertical: 12 },
    label: { fontSize: 16, color: '#333', marginBottom: 8 },
    buttonRow: { marginVertical: 8 }
});
