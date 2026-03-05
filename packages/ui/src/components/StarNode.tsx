import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

export function StarNode({ x, y, onPress }: { x: number, y: number, onPress?: () => void }) {
    // In a real implementation inside the Constellation screen, we would use Skia.
    // This is a placeholder standard RN component representation for fallback.
    return (
        <Pressable onPress={onPress} style={[styles.star, { left: x, top: y }]} />
    );
}

const styles = StyleSheet.create({
    star: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ffd700',
        shadowColor: '#ffd700',
        shadowOpacity: 0.8,
        shadowRadius: 5,
    }
});
