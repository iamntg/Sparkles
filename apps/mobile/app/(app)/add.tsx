import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, KeyboardAvoidingView, Platform, Alert, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { TextInput } from 'react-native';
import { saveNewIdea } from '@/services/ideaService';
import { startRecording, stopRecording, playAudio, stopAudio } from '@/services/audioService';
import { transcribeAudio } from '@/services/transcriptionService';

import { CosmicInput } from '@/components/AddIdea/CosmicInput';
import { CosmicCaptureButton } from '@/components/AddIdea/CosmicCaptureButton';
import { CosmicAudioButton } from '@/components/AddIdea/CosmicAudioButton';

const { width, height } = Dimensions.get('window');

export default function AddIdeaScreen() {
    const router = useRouter();
    const [text, setText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessingAudio, setIsProcessingAudio] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Audio specific state
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const [title, setTitle] = useState('');

    const handleClose = () => {
        router.back();
    };

    const handleSave = async () => {
        if (!text.trim() && !audioUri) return;
        setIsSaving(true);
        try {
            // If we have an audioUri but it wasn't saved immediately (in case logic changes), we handle it. 
            // In the previous flow, audio was transcribed and saved ON STOP. 
            // Let's preserve that or adapt it.

            let finalIdea;
            if (audioUri && !text.trim()) {
                // Should not happen if transcribed on stop
                finalIdea = await saveNewIdea("Audio note", {
                    title: title.trim() || undefined,
                    sourceType: 'audio',
                    audioLocalPath: audioUri,
                    transcriptStatus: 'DONE'
                });
            } else {
                finalIdea = await saveNewIdea(text, { title: title.trim() || undefined });
            }

            router.back();
            // In a real app we might pass params back or emit an event to refresh the previous screen
        } catch (err) {
            Alert.alert('Save Failed', 'Failed to save your idea.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleRecording = async () => {
        if (isRecording) {
            setIsRecording(false);
            try {
                const uri = await stopRecording();
                setAudioUri(uri);

                setIsProcessingAudio(true);
                let transcribedText = '';
                let status = 'DONE';
                try {
                    transcribedText = await transcribeAudio(uri);
                } catch (e) {
                    status = 'FAILED';
                    Alert.alert('Transcription Failed', 'Could not transcribe the audio. Saving with failed status.');
                }

                // Append transcribed text
                setText(prev => (prev ? `${prev}\n\n${transcribedText}` : transcribedText));

                // We won't automatically save and close, giving user a chance to edit text.
                setIsProcessingAudio(false);
            } catch (err) {
                Alert.alert('Recording Failed', 'Failed to stop recording cleanly.');
                setAudioUri(null);
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
            if (isPlaying) {
                await stopAudio();
                setIsPlaying(false);
            } else {
                await playAudio(audioUri);
                setIsPlaying(true);
            }
        } catch (err) {
            Alert.alert('Playback Failed');
        }
    };

    const isBusy = isSaving || isProcessingAudio;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Background Gradients */}
            <View style={styles.backgroundContainer} pointerEvents="none">
                <View style={styles.topRightGradient} />
                <View style={styles.bottomLeftGradient} />
            </View>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton} disabled={isBusy}>
                    <Ionicons name="close" size={28} color="#cbd5e1" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.content}>
                    <TextInput
                        style={[styles.titleInput, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                        placeholder="Title (optional)"
                        placeholderTextColor="rgba(203, 195, 215, 0.5)"
                        value={title}
                        onChangeText={setTitle}
                        editable={!isBusy}
                    />

                    <View style={styles.separator} />

                    <CosmicInput
                        value={text}
                        onChangeText={setText}
                        placeholder="What's on your mind? Add #tags"
                        editable={!isBusy}
                    />

                    {/* Action Button */}
                    <CosmicCaptureButton
                        onPress={handleSave}
                        isLoading={isBusy}
                        disabled={(!text.trim() && !audioUri) || isRecording}
                        label={isProcessingAudio ? "Transcribing..." : "Capture Idea"}
                    />

                    {/* Audio Controls */}
                    <View style={styles.audioContainer}>
                        <CosmicAudioButton
                            isRecording={isRecording}
                            onPress={handleToggleRecording}
                            disabled={isBusy}
                        />
                        {audioUri && !isRecording && (
                            <TouchableOpacity
                                style={styles.playButton}
                                onPress={handlePlayAudio}
                            >
                                <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#a78bfa" />
                            </TouchableOpacity>
                        )}
                    </View>

                </View>
            </ScrollView>

            {/* Floating Stardust Elements */}
            <View style={styles.star1} pointerEvents="none" />
            <View style={styles.star2} pointerEvents="none" />
            <View style={styles.star3} pointerEvents="none" />

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A', // slate-900 base
    },
    backgroundContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    topRightGradient: {
        position: 'absolute',
        top: -height * 0.2,
        right: -width * 0.2,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: 'rgba(139, 92, 246, 0.15)', // violet-500
        transform: [{ scale: 1.5 }],
    },
    bottomLeftGradient: {
        position: 'absolute',
        bottom: -height * 0.2,
        left: -width * 0.2,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: 'rgba(79, 70, 229, 0.1)', // indigo-600
        transform: [{ scale: 1.5 }],
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 24,
        height: Platform.OS === 'ios' ? 110 : 90,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 50,
    },
    closeButton: {
        padding: 8,
        borderRadius: 9999,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40, // offset for absolute header
    },
    titleInput: {
        width: '100%',
        maxWidth: 768,
        fontSize: 24,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 16,
    },
    separator: {
        width: 120,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        marginBottom: 24,
    },
    audioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        marginTop: 40,
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(167, 139, 250, 0.3)',
    },
    star1: {
        position: 'absolute',
        top: '25%',
        left: '25%',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    star2: {
        position: 'absolute',
        top: '33%',
        right: '25%',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(167, 139, 250, 0.3)',
    },
    star3: {
        position: 'absolute',
        bottom: '33%',
        left: '33%',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    }
});
