import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Idea } from '@sparkles/core';
import { fetchIdeaById, saveIdeaChanges } from '@/services/ideaService';
import { IdeaInput, PaperCard } from '@sparkles/ui';

export default function DevelopScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [idea, setIdea] = useState<Idea | null>(null);
    const [text, setText] = useState('');

    useEffect(() => {
        const load = async () => {
            if (typeof id === 'string') {
                const data = await fetchIdeaById(id);
                if (data) {
                    setIdea(data);
                    setText(data.text);
                }
            }
        };
        load();
    }, [id]);

    const handleSave = async () => {
        if (idea) {
            await saveIdeaChanges({ ...idea, text });
            router.back();
        }
    };

    if (!idea) return <View style={styles.container}><Text>Loading...</Text></View>;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Develop Idea</Text>
            <PaperCard>
                <IdeaInput
                    value={text}
                    onChangeText={setText}
                    style={styles.inputExpanded}
                />
            </PaperCard>

            <View style={styles.actions}>
                <Button title="Suggest Links" onPress={() => alert('Local clustering placeholder')} />
                <Button title="Review Ideas" onPress={() => alert('Review Ideas mock')} color="#059669" />
            </View>

            <View style={styles.bottomActions}>
                <Button title="Cancel" onPress={() => router.back()} color="#888" />
                <Button title="Save Changes" onPress={handleSave} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fcfcfc', paddingTop: 60 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    inputExpanded: { minHeight: 300 },
    actions: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
    bottomActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 'auto', marginBottom: 20 }
});
