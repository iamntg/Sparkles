import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Idea, IdeaReview } from '@sparkles/core';
import { Theme } from '@sparkles/ui';
import { CosmicBackground } from '@/components/CosmicBackground';

function shortText(t: string, n = 44) {
    const s = (t || '').replace(/\n/g, ' ').trim();
    return s.length > n ? s.slice(0, n - 1).trim() + '…' : s || 'Voice note';
}

type Props = {
    idea: Idea;
    review: IdeaReview | null;
    loading: boolean;
    error: string | null;
    /** Related sparks already in the cosmos — computed on device, not by the AI. */
    echoes: Idea[];
    autoPlan: boolean;
    onClose: () => void;
    onRetry: () => void;
    onGeneratePlan: () => void;
    onOpenEcho: (id: string) => void;
};

export function AiReviewOverlay({
    idea,
    review,
    loading,
    error,
    echoes,
    autoPlan,
    onClose,
    onRetry,
    onGeneratePlan,
    onOpenEcho,
}: Props) {
    const insets = useSafeAreaInsets();
    const [planOpen, setPlanOpen] = useState(false);

    const hasPlan = !!review?.plan?.length;
    const planTitle = planOpen ? 'A gentle plan' : hasPlan ? 'A gentle plan' : autoPlan ? 'Generate a plan' : 'Develop into a plan';

    const togglePlan = () => {
        if (!hasPlan) {
            onGeneratePlan();
            setPlanOpen(true);
            return;
        }
        setPlanOpen(v => !v);
    };

    return (
        <View style={[StyleSheet.absoluteFill, styles.overlay]}>
            <CosmicBackground starCount={40} amberGlow={false} />

            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Pressable onPress={onClose} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Close AI review">
                    <Ionicons name="close" size={16} color="#cfcadd" />
                </Pressable>
                <Text style={styles.title}>✦ AI REVIEW</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 26, paddingTop: 20, paddingBottom: insets.bottom + 32 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.sparkCard}>
                    <Text style={styles.sectionLabel}>YOUR SPARK</Text>
                    <Text style={styles.sparkText}>{idea.text || idea.rawText || 'Voice note'}</Text>
                </View>

                {loading && (
                    <View style={styles.centered}>
                        <ActivityIndicator color={Theme.colors.primary} />
                        <Text style={styles.loadingText}>Reading your spark…</Text>
                    </View>
                )}

                {!loading && error && (
                    <View style={styles.centered}>
                        <Text style={styles.errorText}>{error}</Text>
                        <Pressable onPress={onRetry} style={styles.retryBtn}>
                            <Text style={styles.retryText}>TRY AGAIN</Text>
                        </Pressable>
                    </View>
                )}

                {!loading && !error && review && (
                    <>
                        <View style={styles.section}>
                            <View style={styles.labelRow}>
                                <View style={[styles.labelDot, { backgroundColor: Theme.colors.primary }]} />
                                <Text style={[styles.sectionLabel, { color: Theme.colors.primary, marginBottom: 0 }]}>A REFLECTION</Text>
                            </View>
                            <Text style={styles.reflection}>{review.reflection}</Text>
                        </View>

                        <View style={styles.section}>
                            <View style={styles.labelRow}>
                                <View style={[styles.labelDot, { backgroundColor: Theme.colors.gold }]} />
                                <Text style={[styles.sectionLabel, { color: Theme.colors.gold, marginBottom: 0 }]}>ANGLES TO EXPLORE</Text>
                            </View>
                            <View style={{ gap: 11, marginTop: 13 }}>
                                {review.angles.map((angle, i) => (
                                    <View key={i} style={styles.angleRow}>
                                        <View style={styles.angleDot} />
                                        <Text style={styles.angleText}>{angle}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {echoes.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.labelRow}>
                                    <View style={[styles.labelDot, { backgroundColor: '#7CE0A8' }]} />
                                    <Text style={[styles.sectionLabel, { color: '#7CE0A8', marginBottom: 0 }]}>ECHOES IN YOUR COSMOS</Text>
                                </View>
                                <View style={{ gap: 9, marginTop: 13 }}>
                                    {echoes.map(e => (
                                        <Pressable key={e.id} style={styles.echoRow} onPress={() => onOpenEcho(e.id)}>
                                            <View style={styles.echoDot} />
                                            <Text style={styles.echoText} numberOfLines={1}>{shortText(e.text || e.title)}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        )}

                        <Pressable onPress={togglePlan} style={styles.planCard}>
                            <View style={styles.planHeader}>
                                <Ionicons name="sparkles-outline" size={19} color={Theme.colors.gold} />
                                <Text style={styles.planTitle}>{planTitle}</Text>
                                <Ionicons
                                    name={planOpen && hasPlan ? 'chevron-up' : 'chevron-down'}
                                    size={16}
                                    color={Theme.colors.textMuted}
                                />
                            </View>
                            {planOpen && hasPlan && (
                                <View style={{ gap: 12, marginTop: 16 }}>
                                    {review.plan!.map(step => (
                                        <View key={step.n} style={styles.planStep}>
                                            <View style={styles.planNum}>
                                                <Text style={styles.planNumText}>{step.n}</Text>
                                            </View>
                                            <Text style={styles.planStepText}>{step.text}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </Pressable>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: { backgroundColor: Theme.colors.background, zIndex: 80 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 26,
    },
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
    title: { fontFamily: Theme.fonts.mono, fontSize: 11, letterSpacing: 3, color: Theme.colors.primary },

    sparkCard: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.035)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
    },
    sparkText: { fontFamily: Theme.fonts.medium, fontSize: 15, lineHeight: 22, color: Theme.colors.text },

    section: { marginTop: 26 },
    sectionLabel: { fontFamily: Theme.fonts.mono, fontSize: 10, letterSpacing: 2, color: Theme.colors.label, marginBottom: 10 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    labelDot: { width: 6, height: 6, borderRadius: 3 },

    reflection: { fontFamily: Theme.fonts.regular, fontSize: 15, lineHeight: 24, color: Theme.colors.textSecondary, marginTop: 13 },

    angleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
    angleDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
        marginTop: 8,
        backgroundColor: Theme.colors.gold,
    },
    angleText: { flex: 1, fontFamily: Theme.fonts.regular, fontSize: 14, lineHeight: 21, color: Theme.colors.textSecondary },

    echoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 11,
        paddingVertical: 13,
        paddingHorizontal: 14,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.035)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    echoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Theme.colors.gold },
    echoText: { flex: 1, fontFamily: Theme.fonts.regular, fontSize: 13, color: Theme.colors.text },

    planCard: {
        marginTop: 28,
        padding: 16,
        borderRadius: 18,
        backgroundColor: 'rgba(255,215,0,0.09)',
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.22)',
    },
    planHeader: { flexDirection: 'row', alignItems: 'center', gap: 11 },
    planTitle: { flex: 1, fontFamily: Theme.fonts.semibold, fontSize: 15, color: Theme.colors.text },
    planStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    planNum: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,215,0,0.18)',
    },
    planNumText: { fontFamily: Theme.fonts.monoBold, fontSize: 10, color: Theme.colors.gold },
    planStepText: { flex: 1, fontFamily: Theme.fonts.regular, fontSize: 14, lineHeight: 21, color: Theme.colors.textSecondary },

    centered: { alignItems: 'center', paddingVertical: 48, gap: 14 },
    loadingText: { fontFamily: Theme.fonts.regular, fontSize: 13, color: Theme.colors.textMuted },
    errorText: { fontFamily: Theme.fonts.regular, fontSize: 14, color: '#d98a8a', textAlign: 'center' },
    retryBtn: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(176,130,255,0.4)',
    },
    retryText: { fontFamily: Theme.fonts.mono, fontSize: 10, letterSpacing: 1.5, color: Theme.colors.primary },
});
