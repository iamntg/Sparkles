import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { IdeaInput, PaperCard, ConfirmModal } from '@sparkles/ui';
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
                            <Button title={isPlaying ? "Playing..." : "Play"} onPress={handlePlayAudio} />
                            <Button title="Stop" onPress={handleStopAudio} />
                            <Button title="Save Idea" onPress={handleSave} disabled={isProcessingAudio} />
                        </>
                    ) : (
                        <>
                            <Button title="Save Idea" onPress={handleSave} disabled={(!text.trim()) || isRecording || isProcessingAudio} />
                            <Button 
                                title={isRecording ? "Stop Recording" : (isProcessingAudio ? "Processing..." : "🎤 Record")} 
                                onPress={handleToggleRecording} 
                                color={isRecording ? "red" : "#888"} 
                                disabled={isProcessingAudio}
                            />
                        </>
                    )}
                </View>
            </PaperCard>

            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Saved Ideas</Text>
                <Button title="Refresh" onPress={loadIdeas} />
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
    container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
    card: { paddingBottom: 8, marginTop: 40 },
    actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 10 },
    listTitle: { fontSize: 18, fontWeight: 'bold' },
    listContainer: { paddingBottom: 20 },
    listItem: { backgroundColor: '#fff', padding: 16, marginBottom: 12, borderRadius: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    listText: { color: '#333', fontSize: 16 }
});
