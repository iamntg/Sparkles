import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, TextInput, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ConfirmModal, Theme } from '@sparkles/ui';
import { fetchAllIdeas } from '@/services/ideaService';
import { digestService } from '@/services/digestService';
import { Idea } from '@sparkles/core';
import { useRouter, useFocusEffect } from 'expo-router';
import AddIdeaForm from '@/components/AddIdeaForm';

export default function InboxScreen() {
    const [showModal, setShowModal] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [lastSavedId, setLastSavedId] = useState<string | null>(null);
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDigestBanner, setShowDigestBanner] = useState(false);
    const [todayIdeasCount, setTodayIdeasCount] = useState(0);
    const router = useRouter();

    const loadIdeas = useCallback(async () => {
        const data = await fetchAllIdeas();
        setIdeas(data);

        // Calculate count of ideas created today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const todayMs = startOfDay.getTime();
        const todayIdeas = data.filter(idea => idea.createdAt >= todayMs);
        setTodayIdeasCount(todayIdeas.length);

        // Check if today's digest has already been generated
        const todayStr = startOfDay.toISOString().split('T')[0];
        const digestId = `digest-${todayStr}`;
        try {
            const existingDigest = await digestService.fetchDigestById(digestId);
            setShowDigestBanner(todayIdeas.length >= 3 && !existingDigest);
        } catch (err) {
            console.error("Failed to check daily digest existence", err);
            setShowDigestBanner(todayIdeas.length >= 3);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadIdeas();
        }, [loadIdeas])
    );

    const handleSaveSuccess = (ideaId: string) => {
        setLastSavedId(ideaId);
        setShowModal(true);
        loadIdeas();
    };

    const handleDevelopFurther = () => {
        setShowModal(false);
        if (lastSavedId) {
            router.push(`/develop/${lastSavedId}`);
        }
    };

    const handleComeBackLater = () => {
        setShowModal(false);
    };

    const filteredIdeas = ideas.filter(idea =>
        (idea.title && idea.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (idea.text && idea.text.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <View style={styles.container}>
            {/* Immersive Full-Screen Modal for adding an idea */}
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
                            setIsAddModalVisible(false);
                            handleSaveSuccess(ideaId);
                        }}
                        containerStyle={{ backgroundColor: 'transparent', padding: Theme.spacing.md, borderRadius: 0 }}
                    />
                </SafeAreaView>
            </Modal>

            {/* Floating Action Button (FAB) for adding an idea */}
            <TouchableOpacity 
                style={styles.fabButton}
                onPress={() => setIsAddModalVisible(true)}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>

            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Inbox</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.clusterButton}
                        onPress={() => router.push('/clusters')}
                    >
                        <View style={{ position: 'relative', width: 22, height: 18, justifyContent: 'center' }}>
                            <Ionicons name="layers-outline" size={16} color="#fff" />
                            <Ionicons name="sparkles-outline" size={12} color="#fff" style={{ position: 'absolute', top: -2, right: -4 }} />
                        </View>
                        <Text style={styles.clusterButtonText}>AI Cluster</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.refreshIconButton} onPress={loadIdeas}>
                        <Ionicons name="refresh-outline" size={22} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.searchBarContainer}>
                <Ionicons name="search-outline" size={18} color={Theme.colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search ideas..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={Theme.colors.textMuted}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color={Theme.colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {showDigestBanner && (
                <TouchableOpacity
                    style={styles.digestBanner}
                    onPress={() => router.push('/daily-digest')}
                    activeOpacity={0.9}
                >
                    <View style={styles.digestBannerIconContainer}>
                        <Ionicons name="sparkles" size={20} color="#fff" />
                    </View>
                    <View style={styles.digestBannerTextContainer}>
                        <Text style={styles.digestBannerTitle}>Daily Sparkles Digest Ready</Text>
                        <Text style={styles.digestBannerSubtitle}>
                            You've captured {todayIdeasCount} ideas today. Tap to synthesize!
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#fff" style={{ opacity: 0.8 }} />
                </TouchableOpacity>
            )}

            <FlatList
                data={filteredIdeas}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.listItem}
                        onPress={() => router.push(`/develop/${item.id}`)}
                    >
                        <View style={styles.listItemHeader}>
                            {item.title ? (
                                <Text style={styles.listTitleText} numberOfLines={1}>{item.title}</Text>
                            ) : null}
                            <Text style={styles.listDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                        </View>
                        <Text style={styles.listText} numberOfLines={2}>{item.text || 'Empty Idea'}</Text>
                    </TouchableOpacity>
                )}
            />

            <ConfirmModal
                visible={showModal}
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
    container: { flex: 1, padding: Theme.spacing.md, backgroundColor: Theme.colors.background },
    card: { padding: Theme.spacing.md, marginTop: 40, borderRadius: Theme.borderRadius.lg, backgroundColor: Theme.colors.surface, zIndex: 10 },
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
    titleInput: {
        fontSize: 16,
        fontWeight: '600',
        color: Theme.colors.text,
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border
    },
    tagSuggestionsBox: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        ...Theme.shadows.soft,
        zIndex: 20,
        maxHeight: 150
    },
    tagSuggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border
    },
    tagSuggestionText: {
        fontSize: 15,
        color: Theme.colors.primary,
        fontWeight: '500'
    },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 10 },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: Theme.borderRadius.xl,
        gap: 6
    },
    primaryButton: { backgroundColor: Theme.colors.primary },
    secondaryButton: { backgroundColor: Theme.colors.secondary },
    recordingButton: { backgroundColor: Theme.colors.error },
    disabledButton: { backgroundColor: '#ddd' },
    buttonText: { color: Theme.colors.surface, fontWeight: '600', fontSize: 14 },
    iconButton: { padding: 4 },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, marginBottom: 16 },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    listTitle: { fontSize: 22, fontWeight: 'bold', color: Theme.colors.text },
    clusterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: Theme.borderRadius.lg + 6,
        gap: 6
    },
    clusterButtonText: { color: Theme.colors.surface, fontWeight: '600', fontSize: 13 },
    refreshIconButton: { padding: 4 },
    listContainer: { paddingBottom: 40 },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: Theme.borderRadius.md,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        ...Theme.shadows.soft
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Theme.colors.text,
        paddingVertical: 0
    },
    listItem: {
        backgroundColor: Theme.colors.surface,
        padding: 16,
        marginBottom: 12,
        borderRadius: Theme.borderRadius.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        ...Theme.shadows.soft
    },
    listItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6
    },
    listTitleText: {
        fontSize: 14,
        fontWeight: '700',
        color: Theme.colors.primary,
        flex: 1,
        marginRight: 8
    },
    listDate: {
        fontSize: 12,
        color: Theme.colors.textMuted
    },
    listText: { color: Theme.colors.textSecondary, fontSize: 16, lineHeight: 22 },
    digestBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#9b59b6', // Cosmic purple background
        padding: 16,
        borderRadius: Theme.borderRadius.lg,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#9b59b6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)'
    },
    digestBannerIconContainer: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    digestBannerTextContainer: {
        flex: 1
    },
    digestBannerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2
    },
    digestBannerSubtitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.9)'
    }
});
