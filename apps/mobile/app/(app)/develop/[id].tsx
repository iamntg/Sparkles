import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Idea, Link } from '@sparkles/core';
import { suggestLinks } from '@sparkles/ai';
import { Theme } from '@sparkles/ui';
import { fetchIdeaById, saveIdeaChanges, fetchAllIdeas, deleteIdea } from '@/services/ideaService';
import { addLink, fetchLinksForIdea, removeLinksByIdea } from '@/services/linkService';
import { playAudio, stopAudio } from '@/services/audioService';
import { CosmicBackground } from '@/components/CosmicBackground';

const DAY = 86400000;

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'JUST NOW';
    if (diff < DAY) {
        const hrs = Math.floor(diff / 3600000);
        if (hrs >= 1) return `${hrs} HR${hrs > 1 ? 'S' : ''} AGO`;
        return `${Math.max(1, Math.floor(diff / 60000))} MIN AGO`;
    }
    if (diff < 2 * DAY) return 'YESTERDAY';
    const days = Math.floor(diff / DAY);
    if (days < 7) return `${days} DAYS AGO`;
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase();
}

function shortText(t: string, n = 40) {
    const s = (t || '').replace(/\n/g, ' ').trim();
    return s.length > n ? s.slice(0, n - 1).trim() + '…' : s || 'Voice note';
}

export default function DevelopScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [idea, setIdea] = useState<Idea | null>(null);
    const [detailNum, setDetailNum] = useState('01');
    const [links, setLinks] = useState<Link[]>([]);
    const [linkedIdeas, setLinkedIdeas] = useState<Idea[]>([]);
    const [suggestions, setSuggestions] = useState<Idea[]>([]);

    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);

    // Link picker overlay
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerOptions, setPickerOptions] = useState<Idea[]>([]);
    const [selected, setSelected] = useState<string[]>([]);

    const load = useCallback(async () => {
        if (!id) return;
        const [data, all] = await Promise.all([fetchIdeaById(id), fetchAllIdeas()]);
        if (!data) return;
        setIdea(data);
        setDraft(data.rawText || data.text);

        // SPARK number = 1-based position by creation order
        const ordered = [...all].sort((a, b) => a.createdAt - b.createdAt);
        const pos = ordered.findIndex(i => i.id === data.id);
        setDetailNum(String(pos + 1).padStart(2, '0'));

        const ideaLinks = await fetchLinksForIdea(id);
        setLinks(ideaLinks);
        const linkedIds = ideaLinks.map(l => (l.fromIdeaId === id ? l.toIdeaId : l.fromIdeaId));
        setLinkedIdeas(all.filter(i => linkedIds.includes(i.id)));

        // "Might connect" — top scored suggestions not already linked
        const suggestedIds = suggestLinks(data, all);
        const sugg = suggestedIds
            .filter(sid => !linkedIds.includes(sid) && sid !== id)
            .map(sid => all.find(i => i.id === sid))
            .filter((i): i is Idea => !!i)
            .slice(0, 3);
        setSuggestions(sugg);
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load])
    );

    const linkCount = links.length;

    const brightness = (() => {
        if (!idea) return 0.3;
        const ageDays = (Date.now() - idea.createdAt) / DAY;
        const age = ageDays < 0.05 ? 1 : ageDays < 1 ? 0.8 : ageDays < 7 ? 0.55 : 0.4;
        const b = (0.3 + linkCount * 0.16) * (0.55 + age * 0.45);
        return Math.max(0.16, Math.min(1, b));
    })();
    const brightLabel = brightness >= 0.75 ? 'GLOWING' : brightness >= 0.5 ? 'STEADY' : brightness >= 0.3 ? 'DRIFTING' : 'FADING';

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
        } catch {
            Alert.alert('Error', 'Failed to play audio');
        }
    };

    const handleDevelop = async () => {
        if (!idea) return;
        if (!editing) {
            setEditing(true);
            return;
        }
        try {
            await saveIdeaChanges({ ...idea, rawText: draft });
            setEditing(false);
            await load();
        } catch {
            Alert.alert('Error', 'Failed to save changes');
        }
    };

    const handleDiscard = () => {
        if (!idea) return;
        const doDelete = async () => {
            await removeLinksByIdea(idea.id);
            await deleteIdea(idea.id);
            router.back();
        };
        if (Platform.OS === 'web') {
            if (window.confirm('Discard this spark? Linked sparks are kept.')) doDelete();
        } else {
            Alert.alert('Discard spark', 'This spark will be removed. Linked sparks are kept.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Discard', style: 'destructive', onPress: doDelete },
            ]);
        }
    };

    const linkSuggestion = async (sid: string) => {
        if (!idea) return;
        await addLink(idea.id, sid);
        await load();
    };

    const openPicker = async () => {
        if (!idea) return;
        const all = await fetchAllIdeas();
        const linkedIds = links.map(l => (l.fromIdeaId === idea.id ? l.toIdeaId : l.fromIdeaId));
        setPickerOptions(all.filter(i => i.id !== idea.id && !linkedIds.includes(i.id)));
        setSelected([]);
        setPickerOpen(true);
    };

    const toggleSelected = (sid: string) =>
        setSelected(prev => (prev.includes(sid) ? prev.filter(x => x !== sid) : [...prev, sid]));

    const saveLinks = async () => {
        if (!idea || selected.length === 0) {
            setPickerOpen(false);
            return;
        }
        await Promise.all(selected.map(sid => addLink(idea.id, sid)));
        setPickerOpen(false);
        await load();
    };

    if (!idea) {
        return <View style={styles.container}><CosmicBackground starCount={40} /></View>;
    }

    return (
        <View style={styles.container}>
            <CosmicBackground starCount={55} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 26, paddingBottom: 24, flexGrow: 1 }}
            >
                <Pressable onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="chevron-back" size={18} color="#cfcadd" />
                </Pressable>

                <View style={styles.body}>
                    <View style={styles.bigDot} />

                    <View style={styles.sparkMetaRow}>
                        <Text style={styles.sparkMeta}>SPARK {detailNum} · {timeAgo(idea.createdAt)}</Text>
                        {!!idea.audioLocalPath && (
                            <Pressable onPress={toggleAudio} style={styles.listenBtn} hitSlop={8}>
                                <Ionicons name={isPlaying ? 'stop' : 'play'} size={12} color={Theme.colors.amber} />
                                <Text style={styles.listenText}>{isPlaying ? 'STOP' : 'LISTEN'}</Text>
                            </Pressable>
                        )}
                    </View>

                    {editing ? (
                        <TextInput
                            value={draft}
                            onChangeText={setDraft}
                            multiline
                            autoFocus
                            style={styles.bigTextInput}
                            placeholder="What's on your mind?"
                            placeholderTextColor={Theme.colors.textFaint}
                        />
                    ) : (
                        <Text style={styles.bigText}>{idea.text || idea.rawText || 'Voice note'}</Text>
                    )}

                    {/* Brightness */}
                    <View style={styles.brightRow}>
                        <View style={styles.brightTrack}>
                            <LinearGradient
                                colors={[Theme.colors.gold, Theme.colors.amber]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.brightFill, { width: `${Math.round(brightness * 100)}%` }]}
                            />
                        </View>
                        <Text style={styles.brightLabel}>{brightLabel}</Text>
                    </View>
                    <Text style={styles.brightCaption}>It brightens each time you return — no pressure, just light.</Text>

                    {/* Linked sparks */}
                    {linkedIdeas.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>LINKED SPARKS · {linkCount}</Text>
                            <View style={styles.chipWrap}>
                                {linkedIdeas.map(li => (
                                    <Pressable key={li.id} style={styles.linkedChip} onPress={() => router.push(`/develop/${li.id}`)}>
                                        <View style={styles.lavDot} />
                                        <Text style={styles.linkedChipText} numberOfLines={1}>{shortText(li.text || li.title)}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Might connect */}
                    {!editing && suggestions.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionLabel, { color: Theme.colors.primary }]}>✦ MIGHT CONNECT</Text>
                            <View style={{ gap: 9 }}>
                                {suggestions.map(sg => (
                                    <View key={sg.id} style={styles.suggestRow}>
                                        <Pressable style={{ flex: 1, minWidth: 0 }} onPress={() => router.push(`/develop/${sg.id}`)}>
                                            <Text style={styles.suggestText} numberOfLines={1}>{shortText(sg.text || sg.title, 44)}</Text>
                                            <Text style={styles.suggestReason}>Shares language with this spark</Text>
                                        </Pressable>
                                        <Pressable style={styles.linkBtn} onPress={() => linkSuggestion(sg.id)}>
                                            <Ionicons name="link-outline" size={12} color={Theme.colors.background} />
                                            <Text style={styles.linkBtnText}>LINK</Text>
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* Bottom actions */}
                <View style={styles.actions}>
                    <Pressable style={[styles.action, styles.actionGold]} onPress={handleDevelop}>
                        <Ionicons name={editing ? 'checkmark' : 'create-outline'} size={20} color={Theme.colors.gold} />
                        <Text style={[styles.actionLabel, { color: Theme.colors.gold }]}>{editing ? 'SAVE' : 'DEVELOP'}</Text>
                    </Pressable>
                    <Pressable style={[styles.action, styles.actionLavender]} onPress={openPicker}>
                        <Ionicons name="link-outline" size={20} color={Theme.colors.primary} />
                        <Text style={[styles.actionLabel, { color: Theme.colors.primary }]}>LINK</Text>
                    </Pressable>
                    <Pressable style={[styles.action, styles.actionGhost]} onPress={handleDiscard}>
                        <Ionicons name="trash-outline" size={20} color="#d98a8a" />
                        <Text style={[styles.actionLabel, { color: '#d98a8a' }]}>DISCARD</Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Link picker overlay */}
            {pickerOpen && (
                <View style={[StyleSheet.absoluteFill, styles.pickerOverlay]}>
                    <CosmicBackground starCount={40} amberGlow={false} />
                    <View style={{ flex: 1, paddingTop: insets.top + 16 }}>
                        <View style={styles.pickerHeader}>
                            <Pressable onPress={() => setPickerOpen(false)} style={styles.iconBtn}>
                                <Ionicons name="close" size={16} color="#cfcadd" />
                            </Pressable>
                            <Text style={styles.pickerTitle}>LINK SPARKS</Text>
                            <View style={{ width: 38 }} />
                        </View>
                        <Text style={styles.pickerSub}>Connect this spark to others in your cosmos.</Text>

                        <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 12, paddingTop: 4 }}>
                            {pickerOptions.length === 0 && (
                                <Text style={styles.pickerEmpty}>No other sparks to link yet.</Text>
                            )}
                            {pickerOptions.map(opt => {
                                const on = selected.includes(opt.id);
                                return (
                                    <Pressable
                                        key={opt.id}
                                        onPress={() => toggleSelected(opt.id)}
                                        style={[styles.pickerRow, on && styles.pickerRowOn]}
                                    >
                                        <View style={styles.goldDot} />
                                        <View style={{ flex: 1, minWidth: 0 }}>
                                            <Text style={styles.pickerRowText} numberOfLines={1}>{shortText(opt.text || opt.title, 44)}</Text>
                                            <Text style={styles.pickerRowTime}>{timeAgo(opt.createdAt)}</Text>
                                        </View>
                                        <View style={[styles.check, on && styles.checkOn]}>
                                            {on && <Ionicons name="checkmark" size={13} color={Theme.colors.background} />}
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>

                        <View style={{ paddingHorizontal: 26, paddingBottom: insets.bottom + 24, paddingTop: 12 }}>
                            <Pressable onPress={saveLinks} style={styles.saveLinksBtn}>
                                <LinearGradient
                                    colors={[Theme.colors.primary, Theme.colors.primaryDeep]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.saveLinksGrad}
                                >
                                    <Text style={styles.saveLinksText}>
                                        {selected.length > 0 ? `LINK ${selected.length} SPARK${selected.length > 1 ? 'S' : ''}` : 'DONE'}
                                    </Text>
                                </LinearGradient>
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
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
    body: { flex: 1, justifyContent: 'center', paddingVertical: 24 },
    bigDot: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Theme.colors.gold,
        shadowColor: Theme.colors.gold,
        shadowOpacity: 0.6,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 0 },
        marginBottom: 24,
    },
    sparkMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    sparkMeta: { fontFamily: Theme.fonts.mono, fontSize: 10, letterSpacing: 2, color: Theme.colors.amber },
    listenBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    listenText: { fontFamily: Theme.fonts.mono, fontSize: 9, letterSpacing: 1, color: Theme.colors.amber },

    bigText: { fontFamily: Theme.fonts.semibold, fontSize: 27, lineHeight: 38, color: Theme.colors.text, letterSpacing: -0.3 },
    bigTextInput: { fontFamily: Theme.fonts.semibold, fontSize: 27, lineHeight: 38, color: Theme.colors.text, letterSpacing: -0.3, padding: 0, textAlignVertical: 'top' },

    brightRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24 },
    brightTrack: { flex: 1, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.07)', overflow: 'hidden' },
    brightFill: { height: 5, borderRadius: 3 },
    brightLabel: { fontFamily: Theme.fonts.mono, fontSize: 9, letterSpacing: 1, color: Theme.colors.label },
    brightCaption: { fontFamily: Theme.fonts.regular, fontSize: 11, color: '#6b6680', marginTop: 8 },

    section: { marginTop: 26 },
    sectionLabel: { fontFamily: Theme.fonts.mono, fontSize: 10, letterSpacing: 2, color: Theme.colors.label, marginBottom: 12 },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    linkedChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        maxWidth: '100%',
        paddingHorizontal: 13,
        paddingVertical: 9,
        borderRadius: 20,
        backgroundColor: 'rgba(176,130,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(176,130,255,0.22)',
    },
    lavDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: Theme.colors.primary,
        shadowColor: Theme.colors.primary,
        shadowOpacity: 0.6,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
    },
    linkedChipText: { fontFamily: Theme.fonts.regular, fontSize: 13, color: Theme.colors.textSecondary, maxWidth: 210 },

    suggestRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingLeft: 14,
        paddingRight: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(176,130,255,0.07)',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'rgba(176,130,255,0.3)',
    },
    suggestText: { fontFamily: Theme.fonts.medium, fontSize: 14, lineHeight: 19, color: Theme.colors.textSecondary },
    suggestReason: { fontFamily: Theme.fonts.regular, fontSize: 11, color: Theme.colors.label, marginTop: 4 },
    linkBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 13,
        paddingVertical: 9,
        borderRadius: 20,
        backgroundColor: Theme.colors.primary,
    },
    linkBtnText: { fontFamily: Theme.fonts.monoBold, fontSize: 10, letterSpacing: 1, color: Theme.colors.background },

    actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
    action: { flex: 1, alignItems: 'center', gap: 7, paddingVertical: 14, borderRadius: 16, borderWidth: 1 },
    actionGold: { backgroundColor: 'rgba(255,215,0,0.1)', borderColor: 'rgba(255,215,0,0.25)' },
    actionLavender: { backgroundColor: 'rgba(176,130,255,0.1)', borderColor: 'rgba(176,130,255,0.28)' },
    actionGhost: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' },
    actionLabel: { fontFamily: Theme.fonts.mono, fontSize: 9, letterSpacing: 1 },

    // Link picker
    pickerOverlay: { backgroundColor: Theme.colors.background, zIndex: 75 },
    pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 26 },
    pickerTitle: { fontFamily: Theme.fonts.mono, fontSize: 11, letterSpacing: 3, color: Theme.colors.primary },
    pickerSub: { fontFamily: Theme.fonts.regular, fontSize: 13, color: Theme.colors.textMuted, marginTop: 16, marginBottom: 8, paddingHorizontal: 26 },
    pickerEmpty: { fontFamily: Theme.fonts.regular, fontSize: 14, color: Theme.colors.textMuted, textAlign: 'center', paddingVertical: 40 },
    pickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        padding: 14,
        marginBottom: 9,
        borderRadius: 16,
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.borderSoft,
    },
    pickerRowOn: { backgroundColor: 'rgba(176,130,255,0.1)', borderColor: Theme.colors.primary },
    goldDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Theme.colors.gold },
    pickerRowText: { fontFamily: Theme.fonts.medium, fontSize: 14, color: Theme.colors.textSecondary },
    pickerRowTime: { fontFamily: Theme.fonts.mono, fontSize: 9, letterSpacing: 1.5, color: Theme.colors.textFaint, marginTop: 5 },
    check: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkOn: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
    saveLinksBtn: { borderRadius: 26, overflow: 'hidden', ...Theme.shadows.primary },
    saveLinksGrad: { paddingVertical: 16, alignItems: 'center', borderRadius: 26 },
    saveLinksText: { fontFamily: Theme.fonts.semibold, fontSize: 15, letterSpacing: 1, color: Theme.colors.background },
});
