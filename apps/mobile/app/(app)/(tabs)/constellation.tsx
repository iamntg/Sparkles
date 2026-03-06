import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { fetchAllIdeas } from '@/services/ideaService';
import { Idea } from '@sparkles/core';
import { useRouter } from 'expo-router';
import { StarNode } from '@sparkles/ui'; // fallback if Skia gestures are complex to write initially

const { width, height } = Dimensions.get('window');

export default function ConstellationScreen() {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const router = useRouter();

    useEffect(() => {
        const loadIdeas = async () => {
            const data = await fetchAllIdeas();
            setIdeas(data);
        };
        loadIdeas();
    }, []);

    return (
        <View style={styles.container}>
            {/* Background space */}
            <View style={styles.spaceBackground} />

            {/* Interactive overlays since Canvas tap handling needs gesture setup */}
            {ideas.map((idea) => {
                const x = ((idea.constellationX || 0) % width) - 10;
                const y = ((idea.constellationY || 0) % height) - 10;
                return (
                    <StarNode
                        key={`star_${idea.id}`}
                        x={x}
                        y={y}
                        onPress={() => router.push(`/develop/${idea.id}`)}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    spaceBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0a0a1a' }
});
