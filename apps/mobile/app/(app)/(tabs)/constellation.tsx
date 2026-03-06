import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useWindowDimensions, Pressable, ActivityIndicator } from 'react-native';
import { fetchAllIdeas } from '@/services/ideaService';
import { fetchAllLinks } from '@/services/linkService';
import { Idea, Link } from '@sparkles/core';
import { useRouter } from 'expo-router';
import { StarNode, StarLink } from '@sparkles/ui';
import { Ionicons } from '@expo/vector-icons';

const PADDING = 60; // Extra padding to ensure visibility and avoid edges/tabs

export default function ConstellationScreen() {
    const { width, height } = useWindowDimensions();
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const loadData = async () => {
        setRefreshing(true);
        try {
            const [ideaData, linkData] = await Promise.all([
                fetchAllIdeas(),
                fetchAllLinks(),
            ]);
            setIdeas(ideaData);
            setLinks(linkData);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const getCoords = (idea: Idea) => {
        const xLimit = width - (2 * PADDING);
        const yLimit = height - (2 * PADDING);
        
        const x = PADDING + ((idea.constellationX || 0) % xLimit);
        const y = PADDING + ((idea.constellationY || 0) % yLimit);
        
        return { x: x - 4, y: y - 4 }; // Offset for star center (8x8)
    };

    const ideaMap = new Map(ideas.map(i => [i.id, i]));

    return (
        <View style={styles.container}>
            {/* Background space */}
            <View style={styles.spaceBackground} />

            {/* Links */}
            {links.map((link) => {
                const fromIdea = ideaMap.get(link.fromIdeaId);
                const toIdea = ideaMap.get(link.toIdeaId);

                if (!fromIdea || !toIdea) return null;

                const { x: x1, y: y1 } = getCoords(fromIdea);
                const { x: x2, y: y2 } = getCoords(toIdea);

                return (
                    <StarLink
                        key={`link_${link.id}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        confidence={link.confidence}
                    />
                );
            })}

            {/* Stars */}
            {ideas.map((idea) => {
                const { x, y } = getCoords(idea);
                return (
                    <StarNode
                        key={`star_${idea.id}`}
                        x={x}
                        y={y}
                        onPress={() => router.push(`/develop/${idea.id}`)}
                    />
                );
            })}

            {/* Refresh Button */}
            <Pressable 
                onPress={loadData} 
                style={styles.refreshButton}
                disabled={refreshing}
            >
                {refreshing ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Ionicons name="refresh" size={24} color="#fff" />
                )}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    spaceBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0a0a1a' },
    refreshButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 10,
        borderRadius: 25,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(10px)',
    }
});
