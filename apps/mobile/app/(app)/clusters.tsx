import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchAllIdeas } from '@/services/ideaService';
import { googleAuthService } from '@/services/googleAuthService';
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
            const user = googleAuthService.getUser();
            if (!user?.id) {
                setErrorMessage('You need to be logged in to use the AI clustering feature. Please log in here or from the Settings tab.');
                setIsLoading(false);
                return;
            }

            // 1. Fetch ideas
            const ideas = await fetchAllIdeas();
            setOriginalIdeas(ideas);

            if (ideas.length === 0) {
                setIsLoading(false);
                return;
            }

            // 2. Extract text and metadata for clustering
            const payload = ideas.map(idea => ({
                text: idea.text,
                title: idea.title,
                tags: idea.tags || [],
                rawText: idea.rawText || idea.text
            }));

            // 3. Make POST request
            const apiUrl = process.env.EXPO_PUBLIC_AI_SERVICE_URL || 'http://localhost:3002';
            const response = await fetch(`${apiUrl}/cluster`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify({ ideas: payload })
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('You have reached your daily limit for AI clustering. Please try again tomorrow.');
                }
                if (response.status === 401) {
                    throw new Error('Unauthorized. Please ensure you are logged in.');
                }
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
            (idea.rawText || idea.text || idea.title || '').includes(itemText) || itemText.includes(idea.rawText || idea.text || idea.title || '')
        );

        if (match) {
            router.push(`/develop/${match.id}`);
        } else {
            Alert.alert('Idea Context', itemText);
        }
    };

    const handleLogin = async () => {
        try {
            setIsLoading(true);
            await googleAuthService.login();
            setErrorMessage('');
            processClustering();
        } catch (error) {
            Alert.alert('Login Failed', (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.messageContainer}>
                    <ActivityIndicator size="large" color="#9b59b6" />
                    <Text style={styles.loadingText}>AI is analyzing your ideas...</Text>
                </View>
            </View>
        );
    }

    if (errorMessage) {
        const isAuthError = errorMessage.includes('logged in');
        return (
            <View style={styles.centerContainer}>
                <View style={styles.messageContainer}>
                    <Ionicons
                        name={isAuthError ? "lock-closed-outline" : "alert-circle-outline"}
                        size={64}
                        color={isAuthError ? "#9b59b6" : "#e74c3c"}
                        style={{ marginBottom: 20 }}
                    />
                    <Text style={[styles.emptyText, { fontSize: 18, fontWeight: '500' }]}>{errorMessage}</Text>
                    {isAuthError && (
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleLogin}
                        >
                            <Ionicons name="logo-google" size={20} color="#fff" />
                            <Text style={styles.loginButtonText}>Login with Google</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.bottomActions}>
                    {!isAuthError && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.secondaryActionButton]}
                            onPress={() => processClustering()}
                        >
                            <Ionicons name="refresh-outline" size={20} color="#9b59b6" />
                            <Text style={styles.secondaryActionText}>Retry</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.actionButton, styles.primaryActionButton]}
                        onPress={() => router.replace('/')}
                    >
                        <Ionicons name="home-outline" size={20} color="#fff" />
                        <Text style={styles.primaryActionText}>Go Home</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (clusters.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.messageContainer}>
                    <Ionicons name="bulb-outline" size={64} color="#ccc" style={{ marginBottom: 20 }} />
                    <Text style={styles.emptyText}>No ideas to cluster. Add some ideas first!</Text>
                </View>

                <View style={styles.bottomActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.primaryActionButton]}
                        onPress={() => router.replace('/')}
                    >
                        <Ionicons name="home-outline" size={20} color="#fff" />
                        <Text style={styles.primaryActionText}>Back to Home</Text>
                    </TouchableOpacity>
                </View>
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
    centerContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 24,
        justifyContent: 'space-between'
    },
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
    emptyText: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 },
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
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4285F4',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 32,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
    bottomActions: {
        width: '100%',
        gap: 12,
        paddingBottom: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    primaryActionButton: {
        backgroundColor: '#9b59b6',
    },
    secondaryActionButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#9b59b6',
    },
    primaryActionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryActionText: {
        color: '#9b59b6',
        fontSize: 16,
        fontWeight: '600',
    }
});
