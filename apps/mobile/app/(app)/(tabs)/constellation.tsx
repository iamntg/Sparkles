import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useWindowDimensions, Pressable, ActivityIndicator, TouchableOpacity, Modal, Text, SafeAreaView } from 'react-native';
import { fetchAllIdeas } from '@/services/ideaService';
import { fetchAllLinks } from '@/services/linkService';
import { Idea, Link } from '@sparkles/core';
import { useRouter } from 'expo-router';
import { StarNode, StarLink, ConfirmModal, Theme } from '@sparkles/ui';
import { Ionicons } from '@expo/vector-icons';
import AddIdeaForm from '@/components/AddIdeaForm';

const PADDING = 60; // Extra padding to ensure visibility and avoid edges/tabs

export default function ConstellationScreen() {
    const { width, height } = useWindowDimensions();
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [lastSavedId, setLastSavedId] = useState<string | null>(null);
    const router = useRouter();

    const handleDevelopFurther = () => {
        setShowConfirmModal(false);
        if (lastSavedId) {
            router.push(`/develop/${lastSavedId}`);
        }
    };

    const handleComeBackLater = () => {
        setShowConfirmModal(false);
    };

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
                const displayTitle = idea.title || (idea.text ? idea.text.split('\n')[0].substring(0, 50) : 'Voice Note');
                return (
                    <StarNode
                        key={`star_${idea.id}`}
                        x={x}
                        y={y}
                        title={displayTitle}
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

            {/* Floating Action Button (FAB) for adding an idea */}
            <TouchableOpacity 
                style={styles.fabButton}
                onPress={() => setIsAddModalVisible(true)}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>

            {/* Modal for adding an idea */}
            <Modal
                visible={isAddModalVisible}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setIsAddModalVisible(false)}
            >
                <SafeAreaView style={styles.modalSafeArea}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Capture Idea</Text>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => setIsAddModalVisible(false)}
                        >
                            <Ionicons name="close" size={24} color={Theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    <AddIdeaForm 
                        onSaveSuccess={(ideaId) => {
                            setLastSavedId(ideaId);
                            setIsAddModalVisible(false);
                            setShowConfirmModal(true);
                            loadData();
                        }}
                        containerStyle={{ backgroundColor: 'transparent', padding: Theme.spacing.md, borderRadius: 0 }}
                    />
                </SafeAreaView>
            </Modal>

            {/* Saved Confirmation Modal */}
            <ConfirmModal
                visible={showConfirmModal}
                title="Idea Saved!"
                confirmText="Develop further"
                cancelText="Come back later"
                onConfirm={handleDevelopFurther}
                onCancel={handleComeBackLater}
            />
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
        zIndex: 98,
    },
    fabButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: Theme.colors.primary,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        ...Theme.shadows.primary,
        zIndex: 99,
    },
    modalSafeArea: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.md,
        paddingTop: Theme.spacing.sm,
        paddingBottom: Theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Theme.colors.text,
    },
    closeButton: {
        padding: 4,
    }
});
