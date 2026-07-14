import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Pressable, Text, View, Animated, Easing } from 'react-native';
import { Theme } from '../theme';

export interface StarNodeProps {
    x: number;
    y: number;
    title?: string;
    /** 0..1 — how brightly the spark glows (more visits / links = brighter). */
    brightness?: number;
    /** Stagger index so nodes don't all pulse in unison (matches the design). */
    index?: number;
    onPress?: () => void;
}

const BOX = 44; // touch target around the dot

/**
 * A single spark in the constellation: a crisp gold dot with a soft glow,
 * matching the dots used on the Idea Details and Ideas screens. Size, glow and
 * opacity scale with brightness, a `nodePulse` animation gently breathes it
 * (brighter sparks pulse faster, staggered by index), and hover/press
 * brightens it and reveals the label. Centred at (x, y).
 */
export function StarNode({ x, y, title, brightness = 0.6, index = 0, onPress }: StarNodeProps) {
    const [active, setActive] = useState(false);
    const b = Math.max(0, Math.min(1, brightness));

    // Design: dot diameter = 9 + b*9, glow blur = 5 + b*16.
    const size = 9 + b * 9;
    const glow = active ? 22 : 5 + b * 16;
    const glowOpacity = active ? 0.75 : 0.35 + b * 0.4;
    const dotOpacity = active ? 1 : 0.5 + b * 0.5;

    // nodePulse: scale 1 -> 1.22 -> 1; brighter cycles faster; staggered start.
    const pulse = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (active) return;
        const half = ((3.4 - b * 0.7) * 1000) / 2;
        const delay = (index * 0.3 * 1000) % 1200;
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1, duration: half, delay, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 0, duration: half, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        );
        anim.start();
        return () => anim.stop();
    }, [pulse, b, index, active]);

    const scale = active ? 1.18 : pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] });

    return (
        <Pressable
            onPress={onPress}
            onHoverIn={() => setActive(true)}
            onHoverOut={() => setActive(false)}
            onPressIn={() => setActive(true)}
            onPressOut={() => setActive(false)}
            hitSlop={8}
            style={[styles.container, { left: x - BOX / 2, top: y - BOX / 2, zIndex: active ? 9 : 3 }]}
        >
            <Animated.View
                style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: Theme.colors.gold,
                    opacity: dotOpacity,
                    transform: [{ scale }],
                    shadowColor: Theme.colors.gold,
                    shadowOpacity: glowOpacity,
                    shadowRadius: glow,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: 0,
                }}
            />

            {active && title ? (
                <View style={styles.tooltipWrap} pointerEvents="none">
                    <View style={styles.tooltipBubble}>
                        <Text style={styles.label} numberOfLines={1}>{title}</Text>
                    </View>
                </View>
            ) : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: BOX,
        height: BOX,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Spans wide and centers the bubble so it sits under the dot regardless of width.
    tooltipWrap: {
        position: 'absolute',
        top: BOX / 2 + 12,
        left: -80,
        right: -80,
        alignItems: 'center',
    },
    tooltipBubble: {
        maxWidth: 150,
        backgroundColor: 'rgba(14,11,22,0.82)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.09)',
        borderRadius: 9,
        paddingHorizontal: 9,
        paddingVertical: 4,
    },
    label: {
        color: '#EAE6F0',
        fontSize: 11,
        fontFamily: Theme.fonts.medium,
        letterSpacing: 0.1,
    },
});
