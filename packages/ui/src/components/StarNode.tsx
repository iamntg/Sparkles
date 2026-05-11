import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';

export function StarNode({ x, y, title, onPress }: { x: number, y: number, title?: string, onPress?: () => void }) {
    return (
        <Pressable 
            onPress={onPress}
            style={[styles.container, { left: x - 46, top: y }]}
        >
            <View style={styles.star} />
            {title && (
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignItems: 'center',
        width: 100,
    },
    star: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ffd700',
        shadowColor: '#ffd700',
        shadowOpacity: 0.8,
        shadowRadius: 5,
    },
    title: {
        marginTop: 4,
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 10,
        textAlign: 'center',
        fontWeight: '500',
        width: '100%',
    }
});
