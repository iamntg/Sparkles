import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchAllIdeas } from '@/services/ideaService';
import { Idea } from '@sparkles/core';
import { useRouter } from 'expo-router';

interface ClusterItem {
    title: string;
    items: string[];
}

interface ClusterResult {
    clusters: ClusterItem[];
}

export default function ClustersScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [clusters, setClusters] = useState<ClusterItem[]>([]);
    const [originalIdeas, setOriginalIdeas] = useState<Idea[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        processClustering();
    }, []);

    const processClustering = async () => {
        try {
            // 1. Fetch ideas
            const ideas = await fetchAllIdeas();
            setOriginalIdeas(ideas);

            if (ideas.length === 0) {
                setIsLoading(false);
                return;
            }

            // 2. Extract text for clustering
            const ideaTexts = ideas.map(idea => idea.text || idea.title || '').filter(Boolean);

            // 3. Make POST request
            const apiUrl = process.env.EXPO_PUBLIC_AI_SERVICE_URL || 'http://localhost:3002';
            const response = await fetch(`${apiUrl}/cluster`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ideas: ideaTexts })
            });

            if (!response.ok) {
                throw new Error('Failed to cluster ideas. Make sure the AI service is running.');
            }

            const data: ClusterResult = await response.json();
            setClusters(data.clusters);

        } catch (error) {
            setErrorMessage((error as Error).message);
            console.error('Clustering error:', error);
            Alert.alert('Error', (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleItemPress = (itemText: string) => {
        // Find matching original idea
        const match = originalIdeas.find(idea =>
            (idea.text || idea.title || '').includes(itemText) || itemText.includes(idea.text || idea.title || '')
        );

        if (match) {
            router.push(`/develop/${match.id}`);
        } else {
            Alert.alert('Idea Context', itemText);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#9b59b6" />
                <Text style={styles.loadingText}>AI is analyzing your ideas...</Text>
            </View>
        );
    }

    if (errorMessage) {
        return (
            <View style={styles.centerContainer}>
                <Text style={[styles.emptyText, { marginBottom: 20 }]}>{errorMessage}</Text>
                <TouchableOpacity 
                    style={[styles.backButton, { marginBottom: 10 }]} 
                    onPress={() => processClustering()}
                >
                    <Ionicons name="refresh-outline" size={20} color="#9b59b6" />
                    <Text style={styles.backButtonText}>Retry</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => router.replace('/')}
                >
                    <Ionicons name="home-outline" size={20} color="#9b59b6" />
                    <Text style={styles.backButtonText}>Go Home</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (clusters.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="bulb-outline" size={48} color="#ccc" style={{ marginBottom: 16 }} />
                <Text style={styles.emptyText}>No ideas to cluster. Add some ideas first!</Text>
                <TouchableOpacity 
                    style={[styles.backButton, { marginTop: 20 }]} 
                    onPress={() => router.replace('/')}
                >
                    <Ionicons name="home-outline" size={20} color="#9b59b6" />
                    <Text style={styles.backButtonText}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => router.replace('/')}
                activeOpacity={0.7}
            >
                <Ionicons name="home-outline" size={20} color="#9b59b6" />
                <Text style={styles.backButtonText}>Back to Home</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Your Idea Clusters</Text>
            {clusters.map((cluster, index) => (
                <View key={index} style={styles.clusterCard}>
                    <Text style={styles.clusterTitle}>{cluster.title}</Text>
                    {cluster.items.map((item, itemIndex) => (
                        <TouchableOpacity
                            key={itemIndex}
                            style={styles.ideaItem}
                            onPress={() => handleItemPress(item)}
                        >
                            <Text style={styles.ideaText}>• {item}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    scrollContent: { padding: 16, paddingBottom: 40 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 },
    loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
    emptyText: { fontSize: 16, color: '#666', textAlign: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    clusterCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 16,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    clusterTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#9b59b6' },
    ideaItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    ideaText: { fontSize: 16, color: '#444', lineHeight: 22 },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#9b59b6',
        marginLeft: 8,
        fontWeight: '600'
    }
});
