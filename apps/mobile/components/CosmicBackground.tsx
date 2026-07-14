import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, useWindowDimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@sparkles/ui';

/** Small deterministic PRNG so the starfield is stable across renders. */
function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

interface Star {
    left: number;
    top: number;
    size: number;
    opacity: number;
    pixel: boolean;
}

interface CosmicBackgroundProps {
    starCount?: number;
    /** Show the soft amber glow near the top (used on the Universe screen). */
    amberGlow?: boolean;
    /** Render the twinkling ambient starfield. Only the Universe screen uses it. */
    starfield?: boolean;
}

/**
 * The full-screen dark cosmos: a vertical space gradient and soft nebula
 * washes. The twinkling ambient starfield is opt-in (`starfield`) and is only
 * used on the Universe screen, per the design.
 */
export function CosmicBackground({ starCount = 60, amberGlow = true, starfield = false }: CosmicBackgroundProps) {
    const { width, height } = useWindowDimensions();
    const twinkle = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!starfield) return;
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(twinkle, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(twinkle, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [twinkle, starfield]);

    const stars = useMemo<Star[]>(() => {
        if (!starfield) return [];
        const rand = mulberry32(987654);
        const arr: Star[] = [];
        for (let i = 0; i < starCount; i++) {
            arr.push({
                left: (3 + rand() * 94) / 100 * width,
                top: (3 + rand() * 94) / 100 * height,
                size: 1 + rand() * 2.3,
                opacity: 0.45 + rand() * 0.5,
                pixel: rand() < 0.16,
            });
        }
        return arr;
    }, [width, height, starCount, starfield]);

    // Two interleaved twinkle phases so the field doesn't pulse in unison.
    const phaseA = twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
    const phaseB = twinkle.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] });

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <LinearGradient
                colors={[...Theme.gradient]}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* Soft, edge-free atmospheric washes (no hard circles) */}
            <LinearGradient
                colors={['rgba(128,64,155,0.11)', 'rgba(128,64,155,0)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.55 }}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />
            {amberGlow && (
                <LinearGradient
                    colors={['rgba(255,178,62,0.06)', 'rgba(255,178,62,0)']}
                    start={{ x: 0.15, y: 0 }}
                    end={{ x: 0.6, y: 0.4 }}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                />
            )}

            {stars.map((s, i) => (
                <Animated.View
                    key={i}
                    style={{
                        position: 'absolute',
                        left: s.left,
                        top: s.top,
                        width: s.size,
                        height: s.size,
                        borderRadius: s.pixel ? 0 : s.size / 2,
                        backgroundColor: `rgba(255,255,255,${s.opacity})`,
                        opacity: i % 2 === 0 ? phaseA : phaseB,
                    }}
                />
            ))}
        </View>
    );
}
