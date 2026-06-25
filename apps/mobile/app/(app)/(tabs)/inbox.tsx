import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '@sparkles/ui';
import { Idea, Link } from '@sparkles/core';
import { fetchAllIdeas } from '@/services/ideaService';
import { fetchAllLinks } from '@/services/linkService';
import { CosmicBackground } from '@/components/CosmicBackground';

type Filter = 'all' | 'linked' | 'recent';
const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'linked', label: 'Linked' },
    { key: 'recent', label: 'Recent' },
];

const DAY = 86400000;

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'JUST NOW';
    if (diff < DAY) {
        const hrs = Math.floor(diff / 3600000);
        if (hrs >= 1) return `${hrs} HR${hrs > 1 ? 'S' : ''} AGO`;
        const mins = Math.floor(diff / 60000);
        return `${mins} MIN AGO`;
    }
    if (diff < 2 * DAY) return 'YESTERDAY';
    const days = Math.floor(diff / DAY);
    if (days < 7) return `${days} DAYS AGO`;
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase();
}

export default function InboxScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<Filter>('all');

    const loadData = useCallback(async () => {
        const [ideaData, linkData] = await Promise.all([fetchAllIdeas(), fetchAllLinks()]);
        setIdeas(ideaData);
        setLinks(linkData);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const linkCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        links.forEach(l => {
            counts[l.fromIdeaId] = (counts[l.fromIdeaId] || 0) + 1;
            counts[l.toIdeaId] = (counts[l.toIdeaId] || 0) + 1;
        });
        return counts;
    }, [links]);

    const q = search.trim().toLowerCase();
    const filtered = useMemo(() => {
        return ideas.filter(it => {
            if (q) {
                const hay = `${it.title || ''} ${it.text || ''}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            if (filter === 'linked') return (linkCounts[it.id] || 0) > 0;
            if (filter === 'recent') return Date.now() - it.createdAt < DAY;
            return true;
        });
    }, [ideas, q, filter, linkCounts]);

    const isEmpty = ideas.length === 0;
    const noResults = !isEmpty && filtered.length === 0;

    const renderHeader = () => (
        <View>
            <Text style={styles.eyebrow}>THE STREAM</Text>
            <Text style={styles.title}>Ideas</Text>

            {isEmpty ? (
                <View style={styles.emptyStream}>
                    <View style={styles.emptyRing}>
                        <View style={styles.emptyStar} />
                    </View>
                    <Text style={styles.emptyTitle}>The stream is quiet</Text>
                    <Text style={styles.emptySub}>
                        Your captured sparks will gather here,{'\n'}newest first. Catch one to begin.
                    </Text>
                </View>
            ) : (
                <>
                    <Text style={styles.subtitle}>Every spark, newest first.</Text>

                    {/* Search */}
                    <View style={styles.searchBar}>
                        <Ionicons name="search-outline" size={16} color={Theme.colors.textMuted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search your sparks"
                            placeholderTextColor={Theme.colors.textFaint}
                            value={search}
                            onChangeText={setSearch}
                        />
                        {search.length > 0 && (
                            <Pressable onPress={() => setSearch('')} hitSlop={8}>
                                <Ionicons name="close" size={16} color={Theme.colors.textMuted} />
                            </Pressable>
                        )}
                    </View>

                    {/* Filter chips */}
                    <View style={styles.chipRow}>
                        {FILTERS.map(f => {
                            const active = filter === f.key;
                            return (
                                <Pressable
                                    key={f.key}
                                    onPress={() => setFilter(f.key)}
                                    style={[styles.chip, active && styles.chipActive]}
                                >
                                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </>
            )}

            {noResults && (
                <View style={styles.noResults}>
                    <Text style={styles.noResultsTitle}>No sparks match</Text>
                    <Text style={styles.noResultsSub}>Try a different word or filter.</Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <CosmicBackground starCount={50} amberGlow={false} />
            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{
                    paddingTop: insets.top + 48,
                    paddingHorizontal: 24,
                    paddingBottom: 150,
                }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => {
                    const count = linkCounts[item.id] || 0;
                    const body = item.text || item.title || 'Empty spark';
                    return (
                        <Pressable style={styles.item} onPress={() => router.push(`/develop/${item.id}`)}>
                            <View style={styles.itemDot} />
                            <View style={styles.itemBody}>
                                <Text style={styles.itemText} numberOfLines={2}>{body}</Text>
                                <View style={styles.itemMeta}>
                                    <Text style={styles.itemTime}>{timeAgo(item.createdAt)}</Text>
                                    {count > 0 && (
                                        <View style={styles.itemLinks}>
                                            <Ionicons name="link-outline" size={11} color={Theme.colors.primary} />
                                            <Text style={styles.itemLinksText}>{count}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <Text style={styles.itemNum}>{String(index + 1).padStart(2, '0')}</Text>
                        </Pressable>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    eyebrow: {
        fontFamily: Theme.fonts.mono,
        fontSize: 10,
        letterSpacing: 3,
        color: Theme.colors.amber,
        opacity: 0.85,
    },
    title: { fontFamily: Theme.fonts.bold, fontSize: 26, color: Theme.colors.text, marginTop: 4, letterSpacing: -0.4 },
    subtitle: { fontFamily: Theme.fonts.regular, fontSize: 13, color: Theme.colors.textMuted, marginTop: 6, marginBottom: 16 },

    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: Theme.borderRadius.lg,
        backgroundColor: Theme.colors.surfaceRaised,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        marginBottom: 13,
    },
    searchInput: { flex: 1, fontFamily: Theme.fonts.regular, color: Theme.colors.textSecondary, fontSize: 14, padding: 0 },

    chipRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: Theme.borderRadius.full,
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    chipActive: { backgroundColor: Theme.colors.primaryLight, borderColor: Theme.colors.primary },
    chipText: { fontFamily: Theme.fonts.medium, fontSize: 13, color: Theme.colors.textMuted },
    chipTextActive: { fontFamily: Theme.fonts.semibold, color: Theme.colors.primary },

    item: {
        flexDirection: 'row',
        gap: 14,
        alignItems: 'flex-start',
        padding: 16,
        marginBottom: 12,
        borderRadius: 18,
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.borderSoft,
    },
    itemDot: {
        marginTop: 3,
        width: 11,
        height: 11,
        borderRadius: 6,
        backgroundColor: Theme.colors.gold,
        shadowColor: Theme.colors.gold,
        shadowOpacity: 0.5,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 0 },
    },
    itemBody: { flex: 1, minWidth: 0 },
    itemText: { fontFamily: Theme.fonts.medium, fontSize: 15, lineHeight: 21, color: Theme.colors.textSecondary },
    itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
    itemTime: { fontFamily: Theme.fonts.mono, fontSize: 10, letterSpacing: 1.5, color: Theme.colors.textFaint },
    itemLinks: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    itemLinksText: { fontFamily: Theme.fonts.mono, fontSize: 9, letterSpacing: 1, color: Theme.colors.primary },
    itemNum: { fontFamily: Theme.fonts.mono, fontSize: 10, color: '#4f4a63', marginTop: 2 },

    emptyStream: { alignItems: 'center', paddingVertical: 70 },
    emptyRing: {
        width: 46,
        height: 46,
        borderRadius: 23,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: 'rgba(255,215,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 22,
    },
    emptyStar: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Theme.colors.gold,
        shadowColor: Theme.colors.gold,
        shadowOpacity: 0.8,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
    },
    emptyTitle: { fontFamily: Theme.fonts.bold, fontSize: 18, color: Theme.colors.text },
    emptySub: { fontFamily: Theme.fonts.regular, fontSize: 13, lineHeight: 20, color: Theme.colors.textMuted, marginTop: 8, textAlign: 'center' },

    noResults: { alignItems: 'center', paddingVertical: 50 },
    noResultsTitle: { fontFamily: Theme.fonts.semibold, fontSize: 15, color: Theme.colors.label },
    noResultsSub: { fontFamily: Theme.fonts.regular, fontSize: 13, color: Theme.colors.textMuted, marginTop: 6 },
});
