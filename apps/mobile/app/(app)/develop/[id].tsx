import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button, Text, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Idea } from '@sparkles/core';
import { fetchIdeaById, saveIdeaChanges, fetchAllIdeas, deleteIdea } from '@/services/ideaService';
import { addLink, fetchLinksForIdea, removeLink, removeLinksByIdea } from '@/services/linkService';
import { IdeaInput, PaperCard, ConfirmModal } from '@sparkles/ui';
import { suggestLinks } from '@sparkles/ai';
import { Link } from '@sparkles/core';
import { Ionicons } from '@expo/vector-icons';

export default function DevelopScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [idea, setIdea] = useState<Idea | null>(null);
    const [text, setText] = useState('');
    const [linkedIdeas, setLinkedIdeas] = useState<Idea[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [linkedTexts, setLinkedTexts] = useState<Record<string, string>>({});

    const [suggestedIdeas, setSuggestedIdeas] = useState<Idea[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState<Idea | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
    const [ideaToUnlink, setIdeaToUnlink] = useState<string | null>(null);


    const load = async () => {
        if (typeof id === 'string') {
            const data = await fetchIdeaById(id);
            if (data) {
                setIdea(data);
                setText(data.text);

                // Fetch links and linked ideas
                const ideaLinks = await fetchLinksForIdea(id);
                setLinks(ideaLinks);

                const relatedIds = ideaLinks.map(l => l.fromIdeaId === id ? l.toIdeaId : l.fromIdeaId);
                const related = await Promise.all(relatedIds.map(rid => fetchIdeaById(rid)));
                const validRelated = related.filter((r): r is Idea => r !== null);

                setLinkedIdeas(validRelated);
                const initialTexts: Record<string, string> = {};
                validRelated.forEach(ri => {
                    initialTexts[ri.id] = ri.text;
                });
                setLinkedTexts(initialTexts);
            }
        }
    };

    useEffect(() => {
        load();
    }, [id]);

    const handleSave = async () => {
        if (idea) {
            try {
                const savePromises = [];
                // Save main idea
                savePromises.push(saveIdeaChanges({ ...idea, text }));

                // Save linked ideas if they changed
                linkedIdeas.forEach(li => {
                    if (linkedTexts[li.id] !== li.text) {
                        savePromises.push(saveIdeaChanges({ ...li, text: linkedTexts[li.id] }));
                    }
                });

                await Promise.all(savePromises);
                router.back();
            } catch (err) {
                Alert.alert('Error', 'Failed to save changes');
            }
        }
    };

    const handleDeleteMainIdea = () => {
        if (!idea) return;
        setShowDeleteConfirm(true);
    };

    const executeDelete = async () => {
        if (!idea) return;
        setIsDeleting(true);
        try {
            await removeLinksByIdea(idea.id);
            await deleteIdea(idea.id);
            setShowDeleteConfirm(false);
            router.back();
        } catch (err) {
            Alert.alert("Error", "Failed to delete idea");
        } finally {
            setIsDeleting(false);
        }
    };


    const handleUnlink = (linkedIdeaId: string) => {
        setIdeaToUnlink(linkedIdeaId);
        setShowUnlinkConfirm(true);
    };

    const executeUnlink = async () => {
        if (!idea || !ideaToUnlink) return;

        const linkToRemove = links.find(l =>
            (l.fromIdeaId === idea.id && l.toIdeaId === ideaToUnlink) ||
            (l.fromIdeaId === ideaToUnlink && l.toIdeaId === idea.id)
        );

        if (!linkToRemove) return;

        try {
            await removeLink(linkToRemove.id);
            setShowUnlinkConfirm(false);
            setIdeaToUnlink(null);
            await load(); // Reload to update UI
        } catch (err) {
            Alert.alert("Error", "Failed to remove link");
        }
    };


    const handleSuggestLinks = async () => {
        if (!idea) return;

        const all = await fetchAllIdeas();
        const existingLinks = await fetchLinksForIdea(idea.id);
        const suggestionIds = suggestLinks(idea, all);

        const suggestions = all.filter(i =>
            suggestionIds.includes(i.id) &&
            i.id !== idea.id &&
            !existingLinks.some(l => l.fromIdeaId === i.id || l.toIdeaId === i.id)
        );

        if (suggestions.length === 0) {
            Alert.alert('Info', 'No new suggestions found based on local clustering.');
            return;
        }

        setSuggestedIdeas(suggestions);
        setShowSuggestions(true);
    };

    const handleConfirmLink = async () => {
        if (idea && selectedSuggestion) {
            await addLink(idea.id, selectedSuggestion.id);
            Alert.alert('Success', `Linked to: ${selectedSuggestion.title}`);
            setSelectedSuggestion(null);
            setShowSuggestions(false);
            load(); // Reload to show the new link
        }
    };

    const updateLinkedText = (id: string, newText: string) => {
        setLinkedTexts(prev => ({ ...prev, [id]: newText }));
    };

    if (!idea) return <View style={styles.container}><Text>Loading...</Text></View>;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.headerRow}>
                <Text style={styles.header}>Develop Idea</Text>
                <Pressable onPress={handleDeleteMainIdea} disabled={isDeleting}>
                    {isDeleting ? (
                        <ActivityIndicator size="small" color="#ef4444" />
                    ) : (
                        <Ionicons name="trash-outline" size={24} color="#ef4444" />
                    )}
                </Pressable>
            </View>

            <Text style={styles.label}>Main Idea</Text>
            <PaperCard>
                <IdeaInput
                    value={text}
                    onChangeText={setText}
                    style={styles.inputExpanded}
                />
            </PaperCard>

            {linkedIdeas.length > 0 && (
                <View style={styles.linkedSection}>
                    <Text style={styles.label}>Linked Ideas</Text>
                    {linkedIdeas.map(li => (
                        <View key={li.id} style={styles.linkedCardWrapper}>
                            <View style={styles.linkedHeader}>
                                <Text style={styles.linkedTitle}>{li.title}</Text>
                                <Pressable
                                    onPress={() => handleUnlink(li.id)}
                                    style={styles.unlinkButton}
                                    hitSlop={10}
                                >
                                    <Ionicons name="link-outline" size={16} color="#ef4444" />
                                    <Text style={styles.unlinkText}>Unlink</Text>
                                </Pressable>
                            </View>
                            <PaperCard>
                                <IdeaInput
                                    value={linkedTexts[li.id]}
                                    onChangeText={(val) => updateLinkedText(li.id, val)}
                                    style={styles.inputLinked}
                                />
                            </PaperCard>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.actions}>
                <Button title="Suggest Links" onPress={handleSuggestLinks} />
                <Button title="Review Ideas" onPress={() => Alert.alert('Mock', 'Review Ideas mock')} color="#059669" />
            </View>

            <ConfirmModal
                visible={showSuggestions}
                title="Suggested Links"
                onConfirm={() => {
                    if (selectedSuggestion) handleConfirmLink();
                    else Alert.alert('Warning', 'Please select an idea first');
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

            <ConfirmModal
                visible={showDeleteConfirm}
                title="Delete Idea"
                onConfirm={executeDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                confirmText="Delete"
                cancelText="Cancel"
            >
                <Text style={styles.confirmText}>
                    Are you sure you want to delete this idea and all its links? The linked cards will NOT be deleted.
                </Text>
            </ConfirmModal>

            <ConfirmModal
                visible={showUnlinkConfirm}
                title="Remove Link"
                onConfirm={executeUnlink}
                onCancel={() => {
                    setShowUnlinkConfirm(false);
                    setIdeaToUnlink(null);
                }}
                confirmText="Unlink"
                cancelText="Cancel"
            >
                <Text style={styles.confirmText}>
                    Are you sure you want to remove the link between these ideas? Both ideas will be kept.
                </Text>
            </ConfirmModal>


            <View style={styles.bottomActions}>
                <Button title="Cancel" onPress={() => router.back()} color="#888" />
                <Button title="Save Changes" onPress={handleSave} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fcfcfc' },
    contentContainer: { padding: 16, paddingTop: 60, paddingBottom: 40 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    header: { fontSize: 24, fontWeight: 'bold' },
    label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8, marginTop: 16, textTransform: 'uppercase' },
    inputExpanded: { minHeight: 200 },
    inputLinked: { minHeight: 120 },
    linkedSection: { marginTop: 20 },
    linkedCardWrapper: { marginBottom: 16 },
    linkedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    linkedTitle: { fontSize: 16, fontWeight: '500', color: '#333' },
    unlinkButton: { flexDirection: 'row', alignItems: 'center' },
    unlinkText: { color: '#ef4444', fontSize: 12, marginLeft: 4, fontWeight: '500' },
    actions: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 30 },
    bottomActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    suggestionsList: { marginVertical: 10 },
    suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee', borderRadius: 8 },
    selectedSuggestion: { backgroundColor: '#e0f2fe', borderColor: '#3b82f6', borderWidth: 1 },
    suggestionTitle: { fontSize: 16 },
    confirmText: { fontSize: 16, color: '#444', textAlign: 'center', marginBottom: 20 }
});

