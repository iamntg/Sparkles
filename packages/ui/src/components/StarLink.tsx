import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Theme } from '../theme';

interface StarLinkProps {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    /** 0..1 — drives the thread's opacity. */
    confidence?: number;
    /** Thread colour. Gold for ambient drift, lavender for explicit links. */
    color?: string;
    width?: number;
}

/**
 * A glowing thread connecting two sparks. Drawn as a thin rotated bar between
 * the two star centres.
 */
export function StarLink({ x1, y1, x2, y2, confidence = 1.0, color = Theme.colors.primary, width = 1 }: StarLinkProps) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    if (distance < 1) return null;

    return (
        <View
            pointerEvents="none"
            style={[
                styles.line,
                {
                    width: distance,
                    height: width,
                    left: x1,
                    top: y1,
                    backgroundColor: color,
                    opacity: 0.18 + 0.3 * confidence,
                    transform: [{ rotate: `${angle}deg` }],
                },
            ]}
        />
    );
}

const styles = StyleSheet.create({
    line: {
        position: 'absolute',
        transformOrigin: 'left center',
        zIndex: 1,
    },
});
