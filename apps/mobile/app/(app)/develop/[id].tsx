import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button, Text, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Idea } from '@sparkles/core';
import { fetchIdeaById, saveIdeaChanges, fetchAllIdeas } from '@/services/ideaService';
import { addLink, fetchLinksForIdea } from '@/services/linkService';
import { IdeaInput, PaperCard, ConfirmModal } from '@sparkles/ui';
import { suggestLinks } from '@sparkles/ai';
import { Link } from '@sparkles/core';

export default function DevelopScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [idea, setIdea] = useState<Idea | null>(null);
    const [text, setText] = useState('');
    const [suggestedIdeas, setSuggestedIdeas] = useState<Idea[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState<Idea | null>(null);

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

    const handleSuggestLinks = async () => {
        if (!idea) return;

        const all = await fetchAllIdeas();
        const existingLinks = await fetchLinksForIdea(idea.id);
        const suggestionIds = suggestLinks(idea, all);

        const suggestions = all.filter(i =>
            suggestionIds.includes(i.id) &&
            !existingLinks.some(l => l.fromIdeaId === i.id || l.toIdeaId === i.id)
        );

        if (suggestions.length === 0) {
            alert('No new suggestions found based on local clustering.');
            return;
        }

        setSuggestedIdeas(suggestions);
        setShowSuggestions(true);
    };

    const handleConfirmLink = async () => {
        if (idea && selectedSuggestion) {
            await addLink(idea.id, selectedSuggestion.id);
            alert(`Linked to: ${selectedSuggestion.title}`);
            setSelectedSuggestion(null);
            setShowSuggestions(false);
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
                <Button title="Suggest Links" onPress={handleSuggestLinks} />
                <Button title="Review Ideas" onPress={() => alert('Review Ideas mock')} color="#059669" />
            </View>

            <ConfirmModal
                visible={showSuggestions}
                title="Suggested Links"
                onConfirm={() => {
                    if (selectedSuggestion) handleConfirmLink();
                    else alert('Please select an idea first');
                }}
                onCancel={() => setShowSuggestions(false)}
                confirmText="Link Selected"
            >
                <View style={styles.suggestionsList}>
                    {suggestedIdeas.map(item => (
                        <Pressable
                            key={item.id}
                            style={[
                                styles.suggestionItem,
                                selectedSuggestion?.id === item.id && styles.selectedSuggestion
                            ]}
                            onPress={() => setSelectedSuggestion(item)}
                        >
                            <Text style={styles.suggestionTitle}>{item.title}</Text>
                        </Pressable>
                    ))}
                </View>
            </ConfirmModal>

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
    bottomActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 'auto', marginBottom: 20 },
    suggestionsList: { marginVertical: 10 },
    suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee', borderRadius: 8 },
    selectedSuggestion: { backgroundColor: '#e0f2fe', borderColor: '#3b82f6', borderWidth: 1 },
    suggestionTitle: { fontSize: 16 }
});
