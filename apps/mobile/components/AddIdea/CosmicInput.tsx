import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, Platform } from 'react-native';

interface CosmicInputProps extends TextInputProps {
    value: string;
    onChangeText: (text: string) => void;
}

export function CosmicInput({ value, onChangeText, style, ...props }: CosmicInputProps) {
    return (
        <View style={styles.container}>
            <View style={styles.glowEffect} />
            <TextInput
                style={[styles.input, style, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                value={value}
                onChangeText={onChangeText}
                placeholderTextColor="rgba(203, 195, 215, 0.8)" // surface-variant/80 from design
                multiline
                autoFocus
                {...props}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        maxWidth: 768, // max-w-3xl
        marginBottom: 48, // mb-12
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        width: '100%',
        backgroundColor: 'transparent',
        fontSize: 40, // text-display
        lineHeight: 48,
        fontWeight: '700',
        color: '#ffffff',
        textAlign: 'center',
        minHeight: 150,
    },
    glowEffect: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(208, 188, 255, 0.05)', // primary/5
        borderRadius: 9999,
        zIndex: -1,
        // React Native doesn't support blur filters natively on Views like CSS blur-3xl easily without expo-blur,
        // but we can simulate the intent or use standard shadows.
        shadowColor: '#d0bcff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 50,
        elevation: 0,
    }
});
