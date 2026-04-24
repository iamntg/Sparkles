import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Pressable, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Idea } from '@sparkles/core';
import { fetchIdeaById, saveIdeaChanges, fetchAllIdeas, deleteIdea } from '@/services/ideaService';
import { addLink, fetchLinksForIdea, removeLink, removeLinksByIdea } from '@/services/linkService';
import { playAudio, stopAudio } from '@/services/audioService';
import { IdeaInput, PaperCard, ConfirmModal, Theme } from '@sparkles/ui';
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
    const [isPlaying, setIsPlaying] = useState(false);

    const toggleAudio = async () => {
        if (!idea?.audioLocalPath) return;

        try {
            if (isPlaying) {
                await stopAudio();
                setIsPlaying(false);
            } else {
                await playAudio(idea.audioLocalPath);
                setIsPlaying(true);
            }
        } catch (err) {
            Alert.alert("Error", "Failed to play audio");
        }
    };


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
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.header}>Develop</Text>
                <TouchableOpacity onPress={handleDeleteMainIdea} disabled={isDeleting} style={styles.deleteButton}>
                    {isDeleting ? (
                        <ActivityIndicator size="small" color="#ef4444" />
                    ) : (
                        <Ionicons name="trash-outline" size={22} color="#ef4444" />
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.labelRow}>
                <Text style={styles.label}>Main Idea</Text>
                {idea.audioLocalPath && (
                    <TouchableOpacity onPress={toggleAudio} style={styles.audioAction}>
                        <Ionicons name={isPlaying ? "stop-circle" : "play-circle"} size={22} color="#9b59b6" />
                        <Text style={styles.audioText}>
                            {isPlaying ? "Stop" : "Listen"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

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
                <TouchableOpacity style={styles.actionButton} onPress={handleSuggestLinks}>
                    <Ionicons name="git-network-outline" size={20} color="#9b59b6" />
                    <Text style={styles.actionButtonText}>Suggest Links</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#f0f0f0' }]}
                    onPress={() => Alert.alert('Mock', 'Review Ideas mock')}
                >
                    <Ionicons name="checkmark-done-outline" size={20} color="#666" />
                    <Text style={[styles.actionButtonText, { color: '#666' }]}>Review</Text>
                </TouchableOpacity>
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
                <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                    <Text style={styles.cancelButtonText}>Discard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    contentContainer: { padding: Theme.spacing.md, paddingTop: Theme.spacing.md, paddingBottom: Theme.spacing.header },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.lg },
    backButton: { padding: Theme.spacing.xs, marginLeft: -Theme.spacing.sm },
    header: { fontSize: 24, fontWeight: 'bold', color: Theme.colors.text },
    deleteButton: { padding: Theme.spacing.xs },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.sm, marginTop: Theme.spacing.md },
    label: { fontSize: 13, fontWeight: '700', color: Theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
    audioAction: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Theme.borderRadius.lg, gap: 6 },
    audioText: { color: Theme.colors.primary, fontWeight: '600', fontSize: 13 },
    inputExpanded: { minHeight: 200, fontSize: 16, color: Theme.colors.text },
    inputLinked: { minHeight: 120, fontSize: 15, color: Theme.colors.textSecondary },
    linkedSection: { marginTop: Theme.spacing.xl },
    linkedCardWrapper: { marginBottom: Theme.spacing.lg },
    linkedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.sm },
    linkedTitle: { fontSize: 15, fontWeight: '600', color: Theme.colors.textSecondary },
    unlinkButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: Theme.colors.surface, 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: Theme.borderRadius.md, 
        borderWidth: 1, 
        borderColor: Theme.colors.errorLight 
    },
    unlinkText: { color: Theme.colors.error, fontSize: 12, marginLeft: Theme.spacing.xs, fontWeight: '600' },
    actions: { flexDirection: 'row', gap: Theme.spacing.sm, marginVertical: Theme.spacing.xl },
    actionButton: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: Theme.colors.surface, 
        paddingVertical: Theme.spacing.sm + 4, 
        borderRadius: Theme.borderRadius.md, 
        borderWidth: 1, 
        borderColor: Theme.colors.border,
        gap: 8,
        ...Theme.shadows.soft
    },
    actionButtonText: { color: Theme.colors.primary, fontWeight: '600', fontSize: 14 },
    bottomActions: { flexDirection: 'row', gap: Theme.spacing.sm, marginTop: Theme.spacing.lg },
    cancelButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: Theme.spacing.md },
    cancelButtonText: { color: Theme.colors.textMuted, fontWeight: '600', fontSize: 16 },
    saveButton: { 
        flex: 2, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: Theme.colors.primary, 
        paddingVertical: Theme.spacing.md, 
        borderRadius: Theme.borderRadius.lg, 
        gap: 8,
        ...Theme.shadows.primary
    },
    saveButtonText: { color: Theme.colors.surface, fontWeight: '700', fontSize: 16 },
    suggestionsList: { marginVertical: Theme.spacing.sm },
    suggestionItem: { padding: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Theme.colors.border, borderRadius: Theme.borderRadius.md, marginBottom: Theme.spacing.sm },
    selectedSuggestion: { backgroundColor: Theme.colors.primaryLight, borderColor: Theme.colors.primary, borderWidth: 1 },
    suggestionTitle: { fontSize: 16, color: Theme.colors.text },
    confirmText: { fontSize: 16, color: Theme.colors.textSecondary, textAlign: 'center', marginBottom: Theme.spacing.lg, lineHeight: 22 }
});

