import React from 'react';
import { Text, StyleSheet } from 'react-native';

export function SectionHeader({ title }: { title: string }) {
    return <Text style={styles.header}>{title}</Text>;
}

const styles = StyleSheet.create({
    header: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1a1a1a',
        marginVertical: 12,
    }
});
