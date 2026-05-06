import React, { useState } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import { IdeaInput, PaperCard, ConfirmModal } from '@sparkles/ui';
import { saveNewIdea } from '@/services/ideaService';
import { useRouter } from 'expo-router';

export default function InboxScreen() {
    const [text, setText] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [lastSavedId, setLastSavedId] = useState<string | null>(null);
    const router = useRouter();

    const handleSave = async () => {
        if (!text.trim()) return;
        const idea = await saveNewIdea(text);
        setLastSavedId(idea.id);
        setText('');
        setShowModal(true);
    };

    const handleDevelopFurther = () => {
        setShowModal(false);
        if (lastSavedId) {
            router.push(`/develop/${lastSavedId}`);
        }
    };

    const handleComeBackLater = () => {
        setShowModal(false);
    };

    return (
        <View style={styles.container}>
            <PaperCard style={styles.card}>
                <IdeaInput
                    placeholder="What's on your mind?"
                    value={text}
                    onChangeText={setText}
                />
                <View style={styles.actions}>
                    <Button title="Save Idea" onPress={handleSave} />
                    {/* Mock Audio record button */}
                    <Button title="🎤 Record" onPress={() => { }} color="#888" />
                </View>
            </PaperCard>

            <ConfirmModal
                visible={showModal}
                title="Idea Saved!"
                confirmText="Develop further"
                cancelText="Come back later"
                onConfirm={handleDevelopFurther}
                onCancel={handleComeBackLater}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5', justifyContent: 'center' },
    card: { paddingBottom: 8 },
    actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }
});
