import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Pressable, Animated, Easing } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StarNode, StarLink, Theme } from '@sparkles/ui';
import { Idea, Link } from '@sparkles/core';
import { fetchAllIdeas } from '@/services/ideaService';
import { fetchAllLinks } from '@/services/linkService';
import { googleAuthService } from '@/services/googleAuthService';
import { CosmicBackground } from '@/components/CosmicBackground';

const FIELD_TOP_OFFSET = 150;   // below the header
const FIELD_BOTTOM_OFFSET = 220; // above caption + nav + fab
const PAD_X = 58;

interface Point { x: number; y: number; }
interface Bounds { x0: number; x1: number; y0: number; y1: number; }

/**
 * Clustered layout: group ideas by the connected components of the link graph
 * (linked sparks belong to one cluster) and lay each component out in its own
 * cell of a soft grid. Members of a cluster ring around their cell centre so
 * they read as belonging together; unconnected sparks each take a lone cell and
 * so drift farther apart — exactly the constellation behaviour the design calls
 * for. Positions are deterministic so the arrangement is stable across renders.
 */
function clusteredCoords(ideas: Idea[], links: Link[], bounds: Bounds): Map<string, Point> {
    const ids = ideas.map(i => i.id);
    const index = new Map(ids.map((id, i) => [id, i]));

    // Union-find over the link graph.
    const parent = ids.map((_, i) => i);
    const find = (a: number): number => (parent[a] === a ? a : (parent[a] = find(parent[a])));
    const union = (a: number, b: number) => { parent[find(a)] = find(b); };
    links.forEach(l => {
        const a = index.get(l.fromIdeaId);
        const b = index.get(l.toIdeaId);
        if (a != null && b != null) union(a, b);
    });

    const groupsMap = new Map<number, string[]>();
    ids.forEach((id, i) => {
        const root = find(i);
        const group = groupsMap.get(root);
        if (group) group.push(id);
        else groupsMap.set(root, [id]);
    });
    // Larger clusters first so their cell order is stable.
    const groups = Array.from(groupsMap.values()).sort((a, b) => b.length - a.length);

    const result = new Map<string, Point>();
    const n = groups.length || 1;
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const cellW = (bounds.x1 - bounds.x0) / cols;
    const cellH = (bounds.y1 - bounds.y0) / rows;

    groups.forEach((group, gi) => {
        const col = gi % cols;
        const row = Math.floor(gi / cols);
        const cx = bounds.x0 + cellW * (col + 0.5);
        const cy = bounds.y0 + cellH * (row + 0.5);
        const size = group.length;

        if (size === 1) {
            result.set(group[0], { x: cx, y: cy });
            return;
        }
        const ringR = Math.min(cellW, cellH) * (size <= 4 ? 0.26 : 0.34);
        group.forEach((id, i) => {
            const ang = (i / size) * Math.PI * 2 - Math.PI / 2;
            result.set(id, { x: cx + Math.cos(ang) * ringR, y: cy + Math.sin(ang) * ringR });
        });
    });
    return result;
}

export default function ConstellationScreen() {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [authenticated, setAuthenticated] = useState(googleAuthService.isAuthenticated());

    // Arrange: false = scattered (stored positions), true = clustered by links.
    const [arranged, setArranged] = useState(false);
    const arrange = useRef(new Animated.Value(0)).current;   // 0 scatter -> 1 cluster (native)
    const linkFade = useRef(new Animated.Value(1)).current;  // links cross-fade during reflow

    const loadData = useCallback(async () => {
        const [ideaData, linkData] = await Promise.all([fetchAllIdeas(), fetchAllLinks()]);
        setIdeas(ideaData);
        setLinks(linkData);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
            setAuthenticated(googleAuthService.isAuthenticated());
        }, [loadData])
    );

    const user = googleAuthService.getUser();
    const email = user?.email ?? '';
    const name = (user as any)?.name || (email ? email.split('@')[0] : '');
    const avatarLabel = authenticated && name ? name.charAt(0).toUpperCase() : '✦';

    const fieldTop = insets.top + FIELD_TOP_OFFSET;
    const fieldHeight = Math.max(160, height - fieldTop - FIELD_BOTTOM_OFFSET);

    const linkCountFor = (id: string) =>
        links.filter(l => l.fromIdeaId === id || l.toIdeaId === id).length;

    // Brightness grows with connections and recency; never fully dark.
    const brightnessFor = (idea: Idea) => {
        const linkCount = linkCountFor(idea.id);
        const ageDays = (Date.now() - idea.createdAt) / 86400000;
        const age = ageDays < 0.05 ? 1 : ageDays < 1 ? 0.8 : ageDays < 7 ? 0.55 : 0.4;
        const b = (0.3 + linkCount * 0.16) * (0.55 + age * 0.45);
        return Math.max(0.16, Math.min(1, b));
    };

    const coordsFor = (idea: Idea): Point => {
        const nx = ((idea.constellationX || 0) % 1000) / 1000;
        const ny = ((idea.constellationY || 0) % 1000) / 1000;
        return {
            x: PAD_X + nx * (width - 2 * PAD_X),
            y: fieldTop + ny * fieldHeight,
        };
    };

    // Two coordinate maps the stars animate between.
    const scatterMap = useMemo(
        () => new Map(ideas.map(i => [i.id, coordsFor(i)])),
        [ideas, width, fieldTop, fieldHeight],
    );
    const clusterMap = useMemo(
        () => clusteredCoords(ideas, links, { x0: PAD_X, x1: width - PAD_X, y0: fieldTop, y1: fieldTop + fieldHeight }),
        [ideas, links, width, fieldTop, fieldHeight],
    );

    // Links render at the committed mode's coordinates and cross-fade so they're
    // never seen stretched to the wrong endpoints mid-reflow.
    const linkCoordMap = arranged ? clusterMap : scatterMap;

    const toggleArrange = () => {
        const next = !arranged;
        setArranged(next);
        linkFade.setValue(0);
        Animated.timing(arrange, {
            toValue: next ? 1 : 0,
            duration: 850,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start();
        Animated.timing(linkFade, {
            toValue: 1,
            duration: 450,
            delay: 480,
            useNativeDriver: true,
        }).start();
    };

    const isEmpty = ideas.length === 0;
    const showArrange = ideas.length >= 2;

    return (
        <View style={styles.container}>
            <CosmicBackground starCount={70} starfield />

            {/* Header */}
            <View style={[styles.header, { top: insets.top + 48 }]}>
                <View>
                    <Text style={styles.eyebrow}>THE UNIVERSE</Text>
                    <Text style={styles.title}>Your cosmos</Text>
                </View>
                <Pressable
                    onPress={() => router.push('/settings')}
                    accessibilityRole="button"
                    accessibilityLabel="Open Void settings"
                    hitSlop={8}
                >
                    <LinearGradient
                        colors={['#80409B', Theme.colors.amber]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.avatar}
                    >
                        <Text style={styles.avatarText}>{avatarLabel}</Text>
                    </LinearGradient>
                </Pressable>
            </View>

            {/* Arrange toggle: scatter <-> cluster by connection */}
            {showArrange && (
                <Pressable
                    onPress={toggleArrange}
                    style={[styles.arrange, { top: insets.top + 100 }]}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: arranged }}
                    accessibilityLabel={arranged ? 'Sparks clustered by connection' : 'Sparks scattered'}
                    hitSlop={6}
                >
                    <Ionicons name="git-network-outline" size={13} color={Theme.colors.primary} />
                    <Text style={styles.arrangeLabel}>{arranged ? 'CLUSTERED' : 'SCATTERED'}</Text>
                    <View style={[styles.arrangeTrack, arranged && styles.arrangeTrackOn]}>
                        <Animated.View
                            style={[
                                styles.arrangeKnob,
                                { transform: [{ translateX: arrange.interpolate({ inputRange: [0, 1], outputRange: [0, 14] }) }] },
                            ]}
                        />
                    </View>
                </Pressable>
            )}

            {/* Links */}
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: linkFade }]} pointerEvents="none">
                {links.map(link => {
                    const a = linkCoordMap.get(link.fromIdeaId);
                    const b = linkCoordMap.get(link.toIdeaId);
                    if (!a || !b) return null;
                    return (
                        <StarLink
                            key={`link_${link.id}`}
                            x1={a.x}
                            y1={a.y}
                            x2={b.x}
                            y2={b.y}
                            confidence={link.confidence}
                            color={Theme.colors.primary}
                            width={1.4}
                        />
                    );
                })}
            </Animated.View>

            {/* Sparks */}
            {ideas.map((idea, i) => {
                const s = scatterMap.get(idea.id);
                const c = clusterMap.get(idea.id);
                if (!s || !c) return null;
                const label = idea.title || (idea.text ? idea.text.split('\n')[0].slice(0, 24) : 'Voice note');
                return (
                    <Animated.View
                        key={`star_${idea.id}`}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            transform: [
                                { translateX: arrange.interpolate({ inputRange: [0, 1], outputRange: [s.x, c.x] }) },
                                { translateY: arrange.interpolate({ inputRange: [0, 1], outputRange: [s.y, c.y] }) },
                            ],
                        }}
                    >
                        <StarNode
                            x={0}
                            y={0}
                            title={label}
                            brightness={brightnessFor(idea)}
                            index={i}
                            onPress={() => router.push(`/develop/${idea.id}`)}
                        />
                    </Animated.View>
                );
            })}

            {/* Caption */}
            {!isEmpty && (
                <View style={[styles.caption, { bottom: FIELD_BOTTOM_OFFSET - 44 + insets.bottom }]}>
                    <Text style={styles.captionCount}>
                        {ideas.length} {ideas.length === 1 ? 'SPARK' : 'SPARKS'} ORBITING
                    </Text>
                    <Text style={styles.captionSub}>
                        {arranged ? 'Connected sparks cluster together' : 'Linked sparks drift together'}
                    </Text>
                </View>
            )}

            {/* Empty state */}
            {isEmpty && (
                <View style={styles.empty}>
                    <View style={styles.emptyRing}>
                        <View style={styles.emptyStar} />
                    </View>
                    <Text style={styles.emptyTitle}>Your universe is empty</Text>
                    <Text style={styles.emptySub}>
                        Every thought you catch becomes a star.{'\n'}Tap the{' '}
                        <Text style={styles.emptyStarGlyph}>✦</Text> below to light the first one.
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    header: {
        position: 'absolute',
        left: 0,
        right: 0,
        paddingHorizontal: 26,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 20,
    },
    eyebrow: {
        fontFamily: Theme.fonts.mono,
        fontSize: 10,
        letterSpacing: 3,
        color: Theme.colors.amber,
        opacity: 0.85,
    },
    title: {
        fontFamily: Theme.fonts.bold,
        fontSize: 21,
        color: Theme.colors.text,
        marginTop: 3,
        letterSpacing: -0.3,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        ...Theme.shadows.primary,
    },
    avatarText: { color: '#fff', fontFamily: Theme.fonts.bold, fontSize: 14 },

    arrange: {
        position: 'absolute',
        right: 20,
        zIndex: 22,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingLeft: 12,
        paddingRight: 8,
        paddingVertical: 7,
        borderRadius: 18,
        backgroundColor: Theme.colors.glass,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.09)',
        ...Theme.shadows.soft,
    },
    arrangeLabel: { fontFamily: Theme.fonts.mono, fontSize: 9, letterSpacing: 1.5, color: '#cfcadd' },
    arrangeTrack: {
        width: 32,
        height: 18,
        borderRadius: 9,
        padding: 3,
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.13)',
    },
    arrangeTrackOn: { backgroundColor: 'rgba(201,166,255,0.4)' },
    arrangeKnob: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#fff',
    },

    caption: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    captionCount: {
        fontFamily: Theme.fonts.mono,
        fontSize: 11,
        letterSpacing: 2,
        color: Theme.colors.label,
    },
    captionSub: { fontFamily: Theme.fonts.regular, fontSize: 12, color: Theme.colors.textFaint, marginTop: 5 },
    empty: {
        position: 'absolute',
        top: '40%',
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 44,
        zIndex: 20,
    },
    emptyRing: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: 'rgba(255,215,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 26,
    },
    emptyStar: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Theme.colors.gold,
        shadowColor: Theme.colors.gold,
        shadowOpacity: 0.8,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
    },
    emptyTitle: { fontFamily: Theme.fonts.bold, fontSize: 20, color: Theme.colors.text, letterSpacing: -0.3 },
    emptySub: {
        fontFamily: Theme.fonts.regular,
        fontSize: 13,
        lineHeight: 20,
        color: Theme.colors.textMuted,
        marginTop: 8,
        textAlign: 'center',
    },
    emptyStarGlyph: { color: Theme.colors.gold, fontFamily: Theme.fonts.semibold },
});
