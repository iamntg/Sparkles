import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IdeaInput, PaperCard, ConfirmModal, Theme } from '@sparkles/ui';
import { saveNewIdea, fetchAllIdeas, searchTags } from '@/services/ideaService';
import { startRecording, stopRecording, playAudio, stopAudio } from '@/services/audioService';
import { transcribeAudio } from '@/services/transcriptionService';
import { Idea } from '@sparkles/core';
import { useRouter, useFocusEffect } from 'expo-router';

export default function InboxScreen() {
    const [text, setText] = useState('');
    const [title, setTitle] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [tagSuggestions, setTagSuggestions] = useState<any[]>([]);
    const [showTagSuggestions, setShowTagSuggestions] = useState(false);
    const [lastSavedId, setLastSavedId] = useState<string | null>(null);
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessingAudio, setIsProcessingAudio] = useState(false);
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const loadIdeas = useCallback(async () => {
        const data = await fetchAllIdeas();
        setIdeas(data);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadIdeas();
        }, [loadIdeas])
    );

    useEffect(() => {
        const match = text.match(/#([a-zA-Z0-9_]*)$/);
        if (match) {
            searchTags(match[1]).then(tags => {
                setTagSuggestions(tags);
                setShowTagSuggestions(tags.length > 0);
            });
        } else {
            setShowTagSuggestions(false);
        }
    }, [text]);

    const handleSelectTag = (tagName: string) => {
        const newText = text.replace(/#([a-zA-Z0-9_]*)$/, `#${tagName} `);
        setText(newText);
        setShowTagSuggestions(false);
    };

    const handleSave = async () => {
        if (!text.trim()) return;
        setIsProcessingAudio(true);
        const finalIdea = await saveNewIdea(text, { title: title.trim() || undefined });

        setLastSavedId(finalIdea.id);
        setText('');
        setTitle('');
        setAudioUri(null);
        setShowModal(true);
        loadIdeas();
        setIsProcessingAudio(false);
    };

    const handleToggleRecording = async () => {
        if (isRecording) {
            setIsRecording(false);
            try {
                const uri = await stopRecording();
                setAudioUri(uri);

                // Immediately transcribe and save
                setIsProcessingAudio(true);
                let transcribedText = '';
                let status = 'DONE';
                try {
                    transcribedText = await transcribeAudio(uri);
                } catch (e) {
                    status = 'FAILED';
                    Alert.alert('Transcription Failed', 'Could not transcribe the audio. Saving with failed status.');
                }

                const finalIdea = await saveNewIdea(transcribedText, {
                    sourceType: 'audio',
                    audioLocalPath: uri,
                    transcriptStatus: status
                });

                setLastSavedId(finalIdea.id);
                setAudioUri(null);
                setShowModal(true);
                loadIdeas();
            } catch (err) {
                Alert.alert('Recording Failed', 'Failed to stop recording cleanly.');
                setAudioUri(null);
            } finally {
                setIsProcessingAudio(false);
            }
        } else {
            try {
                await startRecording();
                setIsRecording(true);
                setAudioUri(null);
            } catch (err) {
                Alert.alert('Recording Failed', 'Ensure microphone permissions are granted.');
            }
        }
    };

    const handlePlayAudio = async () => {
        if (!audioUri) return;
        try {
            await playAudio(audioUri);
            setIsPlaying(true);
        } catch (err) {
            Alert.alert('Playback Failed');
        }
    };

    const handleStopAudio = async () => {
        try {
            await stopAudio();
            setIsPlaying(false);
        } catch (err) {
            Alert.alert('Playback Failed');
        }
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

    const filteredIdeas = ideas.filter(idea => 
        (idea.title && idea.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (idea.text && idea.text.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <View style={styles.container}>
            <PaperCard style={styles.card}>
                {!isRecording && !isProcessingAudio && !audioUri && (
                    <View style={{ zIndex: 10 }}>
                        <TextInput
                            placeholder="Add a title (optional)"
                            value={title}
                            onChangeText={setTitle}
                            style={styles.titleInput}
                            placeholderTextColor={Theme.colors.textMuted}
                        />
                        <IdeaInput
                            placeholder="What's on your mind? Add #tags"
                            value={text}
                            onChangeText={setText}
                        />
                        {showTagSuggestions && (
                            <View style={styles.tagSuggestionsBox}>
                                {tagSuggestions.map(tag => (
                                    <TouchableOpacity key={tag.id} style={styles.tagSuggestionItem} onPress={() => handleSelectTag(tag.name)}>
                                        <Text style={styles.tagSuggestionText}>#{tag.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                )}
                {isRecording && <Text style={{ marginVertical: 20, alignSelf: 'center', color: 'red' }}>Recording Audio...</Text>}
                {isProcessingAudio && <Text style={{ marginVertical: 20, alignSelf: 'center', color: '#888' }}>Transcribing...</Text>}

                <View style={styles.actions}>
                    {audioUri && !isProcessingAudio ? (
                        <>
                            <TouchableOpacity style={styles.iconButton} onPress={handlePlayAudio}>
                                <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={32} color="#9b59b6" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton} onPress={handleStopAudio}>
                                <Ionicons name="stop-circle" size={32} color="#e74c3c" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.primaryButton]}
                                onPress={handleSave}
                                disabled={isProcessingAudio}
                            >
                                <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                                <Text style={styles.buttonText}>Save Idea</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.primaryButton, (!text.trim() || isRecording || isProcessingAudio) && styles.disabledButton]}
                                onPress={handleSave}
                                disabled={(!text.trim()) || isRecording || isProcessingAudio}
                            >
                                <Ionicons name="send-outline" size={18} color="#fff" />
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, isRecording ? styles.recordingButton : styles.secondaryButton]}
                                onPress={handleToggleRecording}
                                disabled={isProcessingAudio}
                            >
                                <Ionicons
                                    name={isRecording ? "stop-circle" : "mic-outline"}
                                    size={20}
                                    color={isRecording ? "#fff" : "#9b59b6"}
                                />
                                <Text style={[styles.buttonText, { color: isRecording ? "#fff" : "#9b59b6" }]}>
                                    {isRecording ? "Stop" : "Record"}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </PaperCard>

            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Inbox</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.clusterButton}
                        onPress={() => router.push('/clusters')}
                    >
                        <View style={{ position: 'relative', width: 22, height: 18, justifyContent: 'center' }}>
                            <Ionicons name="layers-outline" size={16} color="#fff" />
                            <Ionicons name="sparkles-outline" size={12} color="#fff" style={{ position: 'absolute', top: -2, right: -4 }} />
                        </View>
                        <Text style={styles.clusterButtonText}>AI Cluster</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.refreshIconButton} onPress={loadIdeas}>
                        <Ionicons name="refresh-outline" size={22} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.searchBarContainer}>
                <Ionicons name="search-outline" size={18} color={Theme.colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search ideas..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={Theme.colors.textMuted}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color={Theme.colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={filteredIdeas}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.listItem}
                        onPress={() => router.push(`/develop/${item.id}`)}
                    >
                        <View style={styles.listItemHeader}>
                            {item.title ? (
                                <Text style={styles.listTitleText} numberOfLines={1}>{item.title}</Text>
                            ) : null}
                            <Text style={styles.listDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                        </View>
                        <Text style={styles.listText} numberOfLines={2}>{item.text || 'Empty Idea'}</Text>
                    </TouchableOpacity>
                )}
            />

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
    container: { flex: 1, padding: Theme.spacing.md, backgroundColor: Theme.colors.background },
    card: { padding: Theme.spacing.md, marginTop: 40, borderRadius: Theme.borderRadius.lg, backgroundColor: Theme.colors.surface, zIndex: 10 },
    titleInput: {
        fontSize: 16,
        fontWeight: '600',
        color: Theme.colors.text,
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border
    },
    tagSuggestionsBox: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        ...Theme.shadows.soft,
        zIndex: 20,
        maxHeight: 150
    },
    tagSuggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border
    },
    tagSuggestionText: {
        fontSize: 15,
        color: Theme.colors.primary,
        fontWeight: '500'
    },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 10 },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: Theme.borderRadius.xl,
        gap: 6
    },
    primaryButton: { backgroundColor: Theme.colors.primary },
    secondaryButton: { backgroundColor: Theme.colors.secondary },
    recordingButton: { backgroundColor: Theme.colors.error },
    disabledButton: { backgroundColor: '#ddd' },
    buttonText: { color: Theme.colors.surface, fontWeight: '600', fontSize: 14 },
    iconButton: { padding: 4 },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, marginBottom: 16 },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    listTitle: { fontSize: 22, fontWeight: 'bold', color: Theme.colors.text },
    clusterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: Theme.borderRadius.lg + 6,
        gap: 6
    },
    clusterButtonText: { color: Theme.colors.surface, fontWeight: '600', fontSize: 13 },
    refreshIconButton: { padding: 4 },
    listContainer: { paddingBottom: 40 },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: Theme.borderRadius.md,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        ...Theme.shadows.soft
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Theme.colors.text,
        paddingVertical: 0
    },
    listItem: {
        backgroundColor: Theme.colors.surface,
        padding: 16,
        marginBottom: 12,
        borderRadius: Theme.borderRadius.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        ...Theme.shadows.soft
    },
    listItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6
    },
    listTitleText: {
        fontSize: 14,
        fontWeight: '700',
        color: Theme.colors.primary,
        flex: 1,
        marginRight: 8
    },
    listDate: {
        fontSize: 12,
        color: Theme.colors.textMuted
    },
    listText: { color: Theme.colors.textSecondary, fontSize: 16, lineHeight: 22 }
});
