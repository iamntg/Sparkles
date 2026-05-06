import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IdeaInput, PaperCard, ConfirmModal, Theme } from '@sparkles/ui';
import { saveNewIdea, fetchAllIdeas } from '@/services/ideaService';
import { startRecording, stopRecording, playAudio, stopAudio } from '@/services/audioService';
import { transcribeAudio } from '@/services/transcriptionService';
import { Idea } from '@sparkles/core';
import { useRouter } from 'expo-router';

export default function InboxScreen() {
    const [text, setText] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [lastSavedId, setLastSavedId] = useState<string | null>(null);
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessingAudio, setIsProcessingAudio] = useState(false);
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const router = useRouter();

    const loadIdeas = async () => {
        const data = await fetchAllIdeas();
        setIdeas(data);
    };

    useEffect(() => {
        loadIdeas();
    }, []);

    const handleSave = async () => {
        if (!text.trim()) return;
        setIsProcessingAudio(true);
        const finalIdea = await saveNewIdea(text);

        setLastSavedId(finalIdea.id);
        setText('');
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

    return (
        <View style={styles.container}>
            <PaperCard style={styles.card}>
                {!isRecording && !isProcessingAudio && !audioUri && (
                    <IdeaInput
                        placeholder="What's on your mind?"
                        value={text}
                        onChangeText={setText}
                    />
                )}
                {isRecording && <Text style={{marginVertical: 20, alignSelf:'center', color: 'red'}}>Recording Audio...</Text>}
                {isProcessingAudio && <Text style={{marginVertical: 20, alignSelf:'center', color: '#888'}}>Transcribing...</Text>}
                
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
                        <Ionicons name="layers-outline" size={18} color="#fff" />
                        <Text style={styles.clusterButtonText}>Cluster</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.refreshIconButton} onPress={loadIdeas}>
                        <Ionicons name="refresh-outline" size={22} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={ideas}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.listItem}
                        onPress={() => router.push(`/develop/${item.id}`)}
                    >
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
    card: { padding: Theme.spacing.md, marginTop: 40, borderRadius: Theme.borderRadius.lg, backgroundColor: Theme.colors.surface },
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
    listItem: { 
        backgroundColor: Theme.colors.surface, 
        padding: 16, 
        marginBottom: 12, 
        borderRadius: Theme.borderRadius.md, 
        borderWidth: 1,
        borderColor: Theme.colors.border,
        ...Theme.shadows.soft
    },
    listText: { color: Theme.colors.textSecondary, fontSize: 16, lineHeight: 22 }
});
