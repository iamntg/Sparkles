import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchAllIdeas } from '@/services/ideaService';
import { digestService } from '@/services/digestService';
import { googleAuthService } from '@/services/googleAuthService';
import { Idea, ReviewSession } from '@sparkles/core';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface ClusterItem {
  title: string;
  items: string[];
}

interface DigestData {
  summary: string;
  clusters: ClusterItem[];
}

export default function DailyDigestScreen() {
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
  const [isLoading, setIsLoading] = useState(true);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [todayIdeas, setTodayIdeas] = useState<Idea[]>([]);
  const [digest, setDigest] = useState<DigestData | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [history, setHistory] = useState<ReviewSession[]>([]);
  const [selectedHistoryDigest, setSelectedHistoryDigest] = useState<ReviewSession | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    initializeScreen();
  }, [activeTab]);

  const initializeScreen = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      if (activeTab === 'today') {
        await loadTodayDigest();
      } else {
        await loadHistory();
      }
    } catch (error) {
      console.error('Initialization error:', error);
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTodayDigest = async () => {
    // 1. Fetch today's ideas
    const allIdeas = await fetchAllIdeas();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayMs = startOfDay.getTime();
    const currentTodayIdeas = allIdeas.filter(idea => idea.createdAt >= todayMs);
    setTodayIdeas(currentTodayIdeas);

    // 2. Check if a local digest already exists for today
    const todayStr = startOfDay.toISOString().split('T')[0];
    const digestId = `digest-${todayStr}`;
    const existingDigest = await digestService.fetchDigestById(digestId);

    if (existingDigest) {
      const parsedData = JSON.parse(existingDigest.resultJson) as DigestData;
      setDigest(parsedData);
      setIsSaved(true);
    } else {
      setDigest(null);
      setIsSaved(false);
    }
  };

  const loadHistory = async () => {
    const pastDigests = await digestService.fetchAllDigests();
    setHistory(pastDigests);
    setSelectedHistoryDigest(null);
  };

  const handleSynthesize = async () => {
    try {
      // 1. Auth check
      const user = googleAuthService.getUser();
      if (!user?.id) {
        setErrorMessage('You need to be logged in to use the AI Daily Digest. Please log in here or from the Settings tab.');
        return;
      }

      if (todayIdeas.length < 3) {
        Alert.alert('Not Enough Ideas', `You need at least 3 ideas today to synthesize a digest (you have ${todayIdeas.length}). Capture a few more thoughts!`);
        return;
      }

      setIsSynthesizing(true);
      
      // 2. Request backend synthesis
      const result = await digestService.generateDigestAPI(todayIdeas);
      setDigest(result);
      setIsSaved(false);
    } catch (error) {
      console.error('Synthesis error:', error);
      Alert.alert('Synthesis Failed', (error as Error).message);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSaveDigest = async () => {
    if (!digest) return;
    try {
      setIsLoading(true);
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const todayStr = startOfDay.toISOString().split('T')[0];
      const digestId = `digest-${todayStr}`;

      const session: ReviewSession = {
        id: digestId,
        createdAt: Date.now(),
        scope: 'daily-digest',
        resultJson: JSON.stringify(digest)
      };

      await digestService.saveDigest(session);
      setIsSaved(true);
      Alert.alert('Success ✨', 'Your Daily Sparkles Digest has been saved to your personal ledger.');
    } catch (error) {
      Alert.alert('Save Failed', (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await googleAuthService.login();
      setErrorMessage('');
      await loadTodayDigest();
    } catch (error) {
      Alert.alert('Login Failed', (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTodayTab = () => {
    if (isSynthesizing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ffffff" style={{ marginBottom: 20 }} />
          <Text style={styles.loadingText}>Synthesizing your daily thoughts into a celestial narrative...</Text>
        </View>
      );
    }

    if (errorMessage && errorMessage.includes('logged in')) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="lock-closed-outline" size={64} color="rgba(255,255,255,0.7)" style={{ marginBottom: 20 }} />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Ionicons name="logo-google" size={20} color="#fff" />
            <Text style={styles.loginButtonText}>Login with Google</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!digest) {
      return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.ungeneratedCard}>
            <View style={styles.celestialIconRing}>
              <Ionicons name="planet-outline" size={44} color="#ffffff" />
            </View>
            <Text style={styles.cardTitle}>Synthesis Available</Text>
            <Text style={styles.cardDesc}>
              You have captured <Text style={styles.highlightText}>{todayIdeas.length}</Text> ideas today. 
              Ready to weave them into a cosmic daily story?
            </Text>
            
            {todayIdeas.length >= 3 ? (
              <TouchableOpacity style={styles.synthesizeButton} onPress={handleSynthesize}>
                <Ionicons name="sparkles-outline" size={20} color="#fff" />
                <Text style={styles.synthesizeButtonText}>Synthesize Digest</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.disabledBanner}>
                <Ionicons name="alert-circle-outline" size={20} color="rgba(255,255,255,0.8)" />
                <Text style={styles.disabledBannerText}>
                  Capture at least 3 ideas today (currently {todayIdeas.length}) to synthesize.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Celestial Summary */}
        <View style={styles.glassCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="sparkles-outline" size={18} color="#9b59b6" />
            <Text style={styles.cardHeaderTitle}>Today's Celestial Summary</Text>
          </View>
          <Text style={styles.summaryText}>"{digest.summary}"</Text>
        </View>

        {/* Clusters */}
        <Text style={styles.sectionTitle}>Idea Constellations</Text>
        {digest.clusters.map((cluster, idx) => (
          <View key={idx} style={styles.glassCard}>
            <View style={styles.clusterTitleRow}>
              <View style={styles.dotIndicator} />
              <Text style={styles.clusterTitle}>{cluster.title}</Text>
            </View>
            {cluster.items.map((item, itemIdx) => (
              <View key={itemIdx} style={styles.clusterIdeaRow}>
                <Text style={styles.bulletText}>•</Text>
                <Text style={styles.clusterIdeaText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Action Button */}
        {!isSaved ? (
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveDigest}>
            <Ionicons name="cloud-done-outline" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Save to Ledger</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.savedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#2ecc71" />
            <Text style={styles.savedBadgeText}>Saved in SQLite Database</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderHistoryTab = () => {
    if (selectedHistoryDigest) {
      const parsedData = JSON.parse(selectedHistoryDigest.resultJson) as DigestData;
      return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.backToHistory} onPress={() => setSelectedHistoryDigest(null)}>
            <Ionicons name="arrow-back-outline" size={18} color="#fff" />
            <Text style={styles.backToHistoryText}>Back to History List</Text>
          </TouchableOpacity>

          <Text style={styles.historyDetailTitle}>
            Digest for {new Date(selectedHistoryDigest.createdAt).toLocaleDateString()}
          </Text>

          <View style={styles.glassCard}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="sparkles-outline" size={18} color="#9b59b6" />
              <Text style={styles.cardHeaderTitle}>Celestial Summary</Text>
            </View>
            <Text style={styles.summaryText}>"{parsedData.summary}"</Text>
          </View>

          <Text style={styles.sectionTitle}>Idea Constellations</Text>
          {parsedData.clusters.map((cluster, idx) => (
            <View key={idx} style={styles.glassCard}>
              <View style={styles.clusterTitleRow}>
                <View style={styles.dotIndicator} />
                <Text style={styles.clusterTitle}>{cluster.title}</Text>
              </View>
              {cluster.items.map((item, itemIdx) => (
                <View key={itemIdx} style={styles.clusterIdeaRow}>
                  <Text style={styles.bulletText}>•</Text>
                  <Text style={styles.clusterIdeaText}>{item}</Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      );
    }

    if (history.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="journal-outline" size={64} color="rgba(255,255,255,0.4)" style={{ marginBottom: 20 }} />
          <Text style={styles.errorText}>No past digests found. Synthesize and save your first digest to begin your journal!</Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Past Digests Ledger</Text>
        {history.map((session) => {
          const parsedData = JSON.parse(session.resultJson) as DigestData;
          return (
            <TouchableOpacity
              key={session.id}
              style={styles.glassCard}
              onPress={() => setSelectedHistoryDigest(session)}
            >
              <View style={styles.historyRowHeader}>
                <Text style={styles.historyDate}>{new Date(session.createdAt).toLocaleDateString()}</Text>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
              </View>
              <Text style={styles.historySummarySnippet} numberOfLines={2}>
                {parsedData.summary}
              </Text>
              <Text style={styles.historyMeta}>
                {parsedData.clusters.length} constellations mapped
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.mainContainer, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Initializing starry system...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Background space elements */}
      <View style={styles.cosmicBackgroundGradient} />

      {/* Header bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.replace('/')}>
          <Ionicons name="home-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Sparkles Digest</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Custom tab segments */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'today' && styles.activeTabButton]}
          onPress={() => setActiveTab('today')}
        >
          <Ionicons name="sparkles" size={16} color={activeTab === 'today' ? '#ffffff' : 'rgba(255,255,255,0.6)'} />
          <Text style={[styles.tabText, activeTab === 'today' && styles.activeTabText]}>Today's Digest</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.activeTabButton]}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons name="journal" size={16} color={activeTab === 'history' ? '#ffffff' : 'rgba(255,255,255,0.6)'} />
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>Past Digests</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'today' ? renderTodayTab() : renderHistoryTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0F0C20', // Cosmic space deep dark theme
  },
  cosmicBackgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F0C20',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#e1ddec',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  errorText: {
    fontSize: 16,
    color: '#e1ddec',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    maxWidth: width * 0.8,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 25,
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: '#9b59b6', // Primary cosmic theme color
    shadowColor: '#9b59b6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  ungeneratedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 20,
  },
  celestialIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(155, 89, 182, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.4)',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  cardDesc: {
    fontSize: 15,
    color: '#ccc7dd',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  highlightText: {
    color: '#9b59b6',
    fontWeight: 'bold',
    fontSize: 18,
  },
  synthesizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9b59b6',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    gap: 8,
    width: '100%',
    elevation: 2,
    shadowColor: '#9b59b6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  synthesizeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  disabledBannerText: {
    flex: 1,
    color: '#f19e97',
    fontSize: 13,
    lineHeight: 18,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9b59b6',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#e1ddec',
    lineHeight: 26,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  clusterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9b59b6',
  },
  clusterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  clusterIdeaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingLeft: 4,
  },
  bulletText: {
    color: '#9b59b6',
    fontSize: 16,
    marginRight: 8,
    lineHeight: 20,
  },
  clusterIdeaText: {
    flex: 1,
    fontSize: 15,
    color: '#ccc7dd',
    lineHeight: 22,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ecc71',
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.4)',
  },
  savedBadgeText: {
    color: '#2ecc71',
    fontWeight: '600',
    fontSize: 15,
  },
  backToHistory: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
    gap: 8,
  },
  backToHistoryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  historyDetailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  historyRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  historySummarySnippet: {
    fontSize: 14,
    color: '#ccc7dd',
    lineHeight: 20,
    marginBottom: 12,
  },
  historyMeta: {
    fontSize: 12,
    color: '#9b59b6',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 12,
    gap: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
