import React from 'react';
import { View, StyleSheet } from 'react-native';

interface StarLinkProps {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    confidence?: number;
}

export function StarLink({ x1, y1, x2, y2, confidence = 1.0 }: StarLinkProps) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // If the distance is very small, don't render
    if (distance < 1) return null;

    return (
        <View
            pointerEvents="none"
            style={[
                styles.line,
                {
                    width: distance,
                    left: x1 + 4, // offset for star center (star is 8x8)
                    top: y1 + 4,
                    transform: [
                        { translateX: 0 },
                        { translateY: 0 },
                        { rotate: `${angle}deg` },
                    ],
                    opacity: 0.3 * confidence,
                },
            ]}
        />
    );
}

const styles = StyleSheet.create({
    line: {
        position: 'absolute',
        height: 1,
        backgroundColor: '#fff',
        transformOrigin: 'left center',
    },
});
