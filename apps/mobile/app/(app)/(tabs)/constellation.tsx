import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StarNode, StarLink, Theme } from '@sparkles/ui';
import { Idea, Link } from '@sparkles/core';
import { fetchAllIdeas } from '@/services/ideaService';
import { fetchAllLinks } from '@/services/linkService';
import { googleAuthService } from '@/services/googleAuthService';
import { CosmicBackground } from '@/components/CosmicBackground';

const FIELD_TOP_OFFSET = 150;   // below the header
const FIELD_BOTTOM_OFFSET = 220; // above caption + nav + fab
const PAD_X = 58;

export default function ConstellationScreen() {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [authenticated, setAuthenticated] = useState(googleAuthService.isAuthenticated());

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
        const links = linkCountFor(idea.id);
        const ageDays = (Date.now() - idea.createdAt) / 86400000;
        const age = ageDays < 0.05 ? 1 : ageDays < 1 ? 0.8 : ageDays < 7 ? 0.55 : 0.4;
        const b = (0.3 + links * 0.16) * (0.55 + age * 0.45);
        return Math.max(0.16, Math.min(1, b));
    };

    const coordsFor = (idea: Idea) => {
        const nx = ((idea.constellationX || 0) % 1000) / 1000;
        const ny = ((idea.constellationY || 0) % 1000) / 1000;
        return {
            x: PAD_X + nx * (width - 2 * PAD_X),
            y: fieldTop + ny * fieldHeight,
        };
    };

    const coordMap = new Map(ideas.map(i => [i.id, coordsFor(i)]));
    const isEmpty = ideas.length === 0;

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

            {/* Links */}
            {links.map(link => {
                const a = coordMap.get(link.fromIdeaId);
                const b = coordMap.get(link.toIdeaId);
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

            {/* Sparks */}
            {ideas.map((idea, i) => {
                const { x, y } = coordsFor(idea);
                const label = idea.title || (idea.text ? idea.text.split('\n')[0].slice(0, 24) : 'Voice note');
                return (
                    <StarNode
                        key={`star_${idea.id}`}
                        x={x}
                        y={y}
                        title={label}
                        brightness={brightnessFor(idea)}
                        index={i}
                        onPress={() => router.push(`/develop/${idea.id}`)}
                    />
                );
            })}

            {/* Caption */}
            {!isEmpty && (
                <View style={[styles.caption, { bottom: FIELD_BOTTOM_OFFSET - 44 + insets.bottom }]}>
                    <Text style={styles.captionCount}>
                        {ideas.length} {ideas.length === 1 ? 'SPARK' : 'SPARKS'} ORBITING
                    </Text>
                    <Text style={styles.captionSub}>Linked sparks drift together</Text>
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
