import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface CosmicCaptureButtonProps {
    onPress: () => void;
    isLoading: boolean;
    disabled?: boolean;
    label?: string;
}

export function CosmicCaptureButton({ onPress, isLoading, disabled, label = "Capture Idea" }: CosmicCaptureButtonProps) {
    const isInteractive = !isLoading && !disabled;

    return (
        <TouchableOpacity
            style={[styles.container, !isInteractive && styles.disabled]}
            onPress={onPress}
            disabled={!isInteractive}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={['#8b5cf6', '#4f46e5']} // from-violet-500 to-indigo-600
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    {isLoading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <>
                            <Text style={styles.text}>{label}</Text>
                            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                        </>
                    )}
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 32, // mt-8
        shadowColor: '#8b5cf6', // shadow-[0_0_30px_rgba(139,92,246,0.3)]
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
        elevation: 10,
        borderRadius: 9999,
        overflow: 'visible', // For shadow to be visible outside
    },
    disabled: {
        opacity: 0.6,
    },
    gradient: {
        borderRadius: 9999,
        paddingHorizontal: 40, // px-10
        paddingVertical: 16, // py-4
        overflow: 'hidden',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12, // gap-3
        minWidth: 160,
    },
    text: {
        color: '#ffffff',
        fontSize: 18, // font-label-lg? design uses 18px or 14px? text-label-lg is 14px in tailwind config, wait tailwind config says label-lg is 14px. I'll use 16px to be safe.
        fontWeight: '600',
    }
});
