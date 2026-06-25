import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CosmicAudioButtonProps {
    isRecording: boolean;
    onPress: () => void;
    disabled?: boolean;
}

export function CosmicAudioButton({ isRecording, onPress, disabled }: CosmicAudioButtonProps) {
    return (
        <TouchableOpacity
            style={[
                styles.container,
                isRecording && styles.recordingContainer,
                disabled && styles.disabled
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <Ionicons
                name={isRecording ? "stop" : "mic"}
                size={18}
                color={isRecording ? "#ef4444" : "#cbd5e1"} // error color or slate-300
            />
            <Text style={[styles.text, isRecording && styles.recordingText]}>
                {isRecording ? "Stop Recording" : "Record Audio"}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16, // px-4
        paddingVertical: 8, // py-2
        borderRadius: 9999, // rounded-full
        backgroundColor: 'rgba(34, 42, 61, 0.5)', // bg-surface-container-high/50
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8, // gap-2
    },
    recordingContainer: {
        borderColor: 'rgba(239, 68, 68, 0.3)', // red tint
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        fontSize: 14, // text-label-lg
        fontWeight: '600',
        color: '#cbd5e1', // slate-300
    },
    recordingText: {
        color: '#ef4444', // red
    }
});
