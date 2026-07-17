import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatTurn } from '@sparkles/core';
import { Theme } from '@sparkles/ui';

/** The three-dot "thinking" indicator while the partner composes a reply. */
function TypingDots() {
    const dots = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;

    useEffect(() => {
        const animations = dots.map((dot, i) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(i * 160),
                    Animated.timing(dot, { toValue: 1, duration: 320, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    Animated.timing(dot, { toValue: 0.3, duration: 320, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    Animated.delay((2 - i) * 160),
                ])
            )
        );
        animations.forEach(a => a.start());
        return () => animations.forEach(a => a.stop());
    }, [dots]);

    return (
        <View style={styles.typingBubble}>
            {dots.map((dot, i) => (
                <Animated.View key={i} style={[styles.typingDot, { opacity: dot }]} />
            ))}
        </View>
    );
}

type Props = {
    turns: ChatTurn[];
    draft: string;
    busy: boolean;
    error: string | null;
    onChangeDraft: (t: string) => void;
    onSend: () => void;
};

export function BrainstormChat({ turns, draft, busy, error, onChangeDraft, onSend }: Props) {
    const canSend = draft.trim().length > 0 && !busy;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                <Text style={styles.star}>✦ </Text>BRAINSTORM
            </Text>

            {turns.length === 0 && !busy && (
                <Text style={styles.empty}>
                    Think out loud with Sparkles — ask a question or riff on this spark, and grow it right here.
                </Text>
            )}

            {(turns.length > 0 || busy) && (
                <View style={{ gap: 10, marginBottom: 14 }}>
                    {turns.map(turn => (
                        <View
                            key={turn.id}
                            style={[styles.bubbleRow, turn.role === 'user' ? styles.rowUser : styles.rowAssistant]}
                        >
                            <View style={[styles.bubble, turn.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}>
                                <Text style={turn.role === 'user' ? styles.textUser : styles.textAssistant}>{turn.text}</Text>
                            </View>
                        </View>
                    ))}
                    {busy && (
                        <View style={[styles.bubbleRow, styles.rowAssistant]}>
                            <TypingDots />
                        </View>
                    )}
                </View>
            )}

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.inputRow}>
                <TextInput
                    value={draft}
                    onChangeText={onChangeDraft}
                    style={styles.input}
                    placeholder="Riff on this idea…"
                    placeholderTextColor={Theme.colors.textFaint}
                    multiline
                />
                <Pressable
                    onPress={onSend}
                    disabled={!canSend}
                    style={[styles.sendBtn, !canSend && styles.sendBtnOff]}
                    accessibilityRole="button"
                    accessibilityLabel="Send message"
                >
                    <Ionicons name="arrow-up" size={16} color={canSend ? Theme.colors.background : Theme.colors.textFaint} />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 26 },
    label: { fontFamily: Theme.fonts.mono, fontSize: 10, letterSpacing: 2, color: Theme.colors.primary, marginBottom: 12 },
    star: { color: Theme.colors.gold },
    empty: { fontFamily: Theme.fonts.regular, fontSize: 13, lineHeight: 20, color: Theme.colors.textMuted, marginBottom: 14 },

    bubbleRow: { flexDirection: 'row' },
    rowUser: { justifyContent: 'flex-end' },
    rowAssistant: { justifyContent: 'flex-start' },
    bubble: { maxWidth: '86%', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 16 },
    bubbleUser: { backgroundColor: 'rgba(176,130,255,0.18)', borderWidth: 1, borderColor: 'rgba(176,130,255,0.3)' },
    bubbleAssistant: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    textUser: { fontFamily: Theme.fonts.regular, fontSize: 14, lineHeight: 21, color: Theme.colors.text },
    textAssistant: { fontFamily: Theme.fonts.regular, fontSize: 14, lineHeight: 21, color: Theme.colors.textSecondary },

    typingBubble: {
        flexDirection: 'row',
        gap: 5,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    typingDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Theme.colors.primary },

    error: { fontFamily: Theme.fonts.regular, fontSize: 12, color: '#d98a8a', marginBottom: 10 },

    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
        padding: 8,
        paddingLeft: 14,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.09)',
    },
    input: {
        flex: 1,
        maxHeight: 96,
        paddingVertical: 8,
        fontFamily: Theme.fonts.regular,
        fontSize: 14,
        lineHeight: 20,
        color: Theme.colors.text,
    },
    sendBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.colors.primary,
    },
    sendBtnOff: { backgroundColor: 'rgba(255,255,255,0.07)' },
});
