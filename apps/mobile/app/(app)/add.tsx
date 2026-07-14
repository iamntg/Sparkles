import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, Pressable, Alert,
    KeyboardAvoidingView, Platform, Animated, Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@sparkles/ui';
import { saveNewIdea } from '@/services/ideaService';
import { startRecording, stopRecording } from '@/services/audioService';
import { transcribeAudio } from '@/services/transcriptionService';
import { CosmicBackground } from '@/components/CosmicBackground';

const WAVE_BARS = 16;

function WaveForm() {
    const bars = useRef(Array.from({ length: WAVE_BARS }, () => new Animated.Value(0.3))).current;

    useEffect(() => {
        const loops = bars.map((bar, i) =>
            Animated.loop(
                Animated.sequence([
                    Animated.timing(bar, { toValue: 1, duration: 360 + (i % 5) * 90, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
                    Animated.timing(bar, { toValue: 0.28, duration: 360 + (i % 5) * 90, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
                ])
            )
        );
        loops.forEach((l, i) => setTimeout(() => l.start(), i * 60));
        return () => loops.forEach(l => l.stop());
    }, [bars]);

    return (
        <View style={styles.wave}>
            {bars.map((bar, i) => (
                <Animated.View
                    key={i}
                    style={[
                        styles.waveBar,
                        { height: bar.interpolate({ inputRange: [0, 1], outputRange: [8, 54] }) },
                    ]}
                />
            ))}
        </View>
    );
}

export default function AddIdeaScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [draft, setDraft] = useState('');
    const [mode, setMode] = useState<'compose' | 'recording'>('compose');
    const [isSaving, setIsSaving] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

    const leave = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(app)/(tabs)/constellation');
        }
    };

    const close = () => leave();

    const handleCapture = async () => {
        if (!draft.trim() || isSaving) return;
        setIsSaving(true);
        try {
            await saveNewIdea(draft.trim());
            leave();
        } catch {
            Alert.alert('Save Failed', 'Could not save your spark.');
            setIsSaving(false);
        }
    };

    const beginRecording = async () => {
        try {
            await startRecording();
            setSeconds(0);
            setMode('recording');
            timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
        } catch {
            Alert.alert('Recording Failed', 'Ensure microphone permissions are granted.');
        }
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const finishRecording = async () => {
        stopTimer();
        setMode('compose');
        setIsTranscribing(true);
        try {
            const uri = await stopRecording();
            let transcript = '';
            try {
                transcript = await transcribeAudio(uri);
            } catch {
                Alert.alert('Transcription Failed', 'Could not transcribe the audio.');
            }
            if (transcript) {
                setDraft(prev => (prev ? `${prev}\n\n${transcript}` : transcript));
            }
        } catch {
            Alert.alert('Recording Failed', 'Failed to stop recording cleanly.');
        } finally {
            setIsTranscribing(false);
        }
    };

    const cancelRecording = async () => {
        stopTimer();
        setMode('compose');
        try { await stopRecording(); } catch { /* discard */ }
    };

    const mmss = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    const canCapture = draft.trim().length > 0 && !isSaving;

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <CosmicBackground starCount={50} />

            <View style={[styles.frame, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
                {/* Header */}
                <View style={styles.header}>
                    {mode === 'compose' ? (
                        <Pressable onPress={close} style={styles.iconBtn}>
                            <Ionicons name="close" size={16} color="#cfcadd" />
                        </Pressable>
                    ) : (
                        <View style={{ width: 38 }} />
                    )}
                    <Text style={styles.eyebrow}>NEW SPARK</Text>
                    <View style={{ width: 38 }} />
                </View>

                {mode === 'compose' ? (
                    <View style={styles.composeBody}>
                        <TextInput
                            value={draft}
                            onChangeText={setDraft}
                            placeholder="What's on your mind?"
                            placeholderTextColor={Theme.colors.textFaint}
                            multiline
                            autoFocus
                            editable={!isSaving && !isTranscribing}
                            style={styles.composeInput}
                        />

                        <View style={styles.composeFooter}>
                            <Text style={styles.count}>
                                {isTranscribing ? 'TRANSCRIBING…' : `${draft.trim().length} CHARS`}
                            </Text>
                            <View style={styles.footerActions}>
                                <Pressable onPress={beginRecording} disabled={isSaving || isTranscribing} style={styles.micBtn}>
                                    <Ionicons name="mic" size={20} color={Theme.colors.amber} />
                                </Pressable>
                                <Pressable
                                    onPress={handleCapture}
                                    disabled={!canCapture}
                                    style={[styles.captureBtn, !canCapture && styles.captureBtnDisabled]}
                                >
                                    <Text style={[styles.captureText, !canCapture && styles.captureTextDisabled]}>
                                        {isSaving ? 'Saving…' : 'Capture'}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.recordBody}>
                        <View style={styles.recordCenter}>
                            <View style={styles.listeningRow}>
                                <View style={styles.recDot} />
                                <Text style={styles.listening}>LISTENING</Text>
                            </View>
                            <Text style={styles.timer}>{mmss}</Text>
                            <WaveForm />
                            <Text style={styles.recHint}>Tap stop when you're done — we'll transcribe it.</Text>
                        </View>

                        <View style={styles.recControls}>
                            <Pressable onPress={cancelRecording} style={styles.cancelBtn}>
                                <Ionicons name="close" size={18} color="#cfcadd" />
                            </Pressable>
                            <Pressable onPress={finishRecording} style={styles.stopBtn}>
                                <View style={styles.stopSquare} />
                            </Pressable>
                            <View style={{ width: 50 }} />
                        </View>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    frame: { flex: 1, paddingHorizontal: 26 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    iconBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    eyebrow: { fontFamily: Theme.fonts.mono, fontSize: 11, letterSpacing: 3, color: Theme.colors.amber },

    composeBody: { flex: 1 },
    composeInput: {
        flex: 1,
        marginTop: 38,
        fontFamily: Theme.fonts.medium,
        fontSize: 23,
        lineHeight: 34,
        color: Theme.colors.text,
        textAlignVertical: 'top',
        padding: 0,
    },
    composeFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 },
    count: { fontFamily: Theme.fonts.mono, fontSize: 11, letterSpacing: 1, color: Theme.colors.textFaint },
    footerActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    micBtn: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: 'rgba(255,178,62,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,178,62,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureBtn: {
        paddingHorizontal: 22,
        paddingVertical: 15,
        borderRadius: 26,
        backgroundColor: Theme.colors.amber,
        ...Theme.shadows.gold,
    },
    captureBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.08)', shadowOpacity: 0 },
    captureText: { fontFamily: Theme.fonts.semibold, fontSize: 15, color: Theme.colors.background },
    captureTextDisabled: { color: Theme.colors.textFaint },

    recordBody: { flex: 1 },
    recordCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    listeningRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
    recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.colors.error },
    listening: { fontFamily: Theme.fonts.mono, fontSize: 11, letterSpacing: 3, color: Theme.colors.amber },
    timer: { fontFamily: Theme.fonts.bold, fontSize: 40, color: Theme.colors.text, marginTop: 18, letterSpacing: 1 },
    wave: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 54, marginTop: 26 },
    waveBar: { width: 3, borderRadius: 2, backgroundColor: Theme.colors.amber },
    recHint: { fontFamily: Theme.fonts.regular, fontSize: 14, lineHeight: 21, color: '#cfcadd', marginTop: 30, paddingHorizontal: 24, textAlign: 'center' },

    recControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, paddingTop: 10 },
    cancelBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stopBtn: {
        width: 74,
        height: 74,
        borderRadius: 37,
        backgroundColor: Theme.colors.gold,
        alignItems: 'center',
        justifyContent: 'center',
        ...Theme.shadows.gold,
    },
    stopSquare: { width: 24, height: 24, borderRadius: 7, backgroundColor: Theme.colors.background },
});
