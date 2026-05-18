import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, TextInput, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IdeaInput, Theme } from '@sparkles/ui';
import { saveNewIdea, searchTags } from '@/services/ideaService';
import { startRecording, stopRecording, playAudio, stopAudio } from '@/services/audioService';
import { transcribeAudio } from '@/services/transcriptionService';

interface AddIdeaFormProps {
    onSaveSuccess: (ideaId: string) => void;
    containerStyle?: StyleProp<ViewStyle>;
}

export default function AddIdeaForm({ onSaveSuccess, containerStyle }: AddIdeaFormProps) {
    const [text, setText] = useState('');
    const [title, setTitle] = useState('');
    const [tagSuggestions, setTagSuggestions] = useState<any[]>([]);
    const [showTagSuggestions, setShowTagSuggestions] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessingAudio, setIsProcessingAudio] = useState(false);
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

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
        try {
            const finalIdea = await saveNewIdea(text, { title: title.trim() || undefined });

            setText('');
            setTitle('');
            setAudioUri(null);
            onSaveSuccess(finalIdea.id);
        } catch (err) {
            Alert.alert('Save Failed', 'Failed to save your idea.');
        } finally {
            setIsProcessingAudio(false);
        }
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

                setAudioUri(null);
                onSaveSuccess(finalIdea.id);
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

    return (
        <View style={[styles.card, containerStyle]}>
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
        </View>
    );
}

const styles = StyleSheet.create({
    card: { padding: Theme.spacing.md, borderRadius: Theme.borderRadius.lg, backgroundColor: Theme.colors.surface },
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
    iconButton: { padding: 4 }
});
