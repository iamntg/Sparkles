/**
 * Sparkles "cosmic" dark theme.
 *
 * The app lives in a dark, starry universe. Sparks are warm gold stars,
 * connections glow lavender, and accents are amber. There is no light theme.
 *
 * Token keys are kept stable (background / surface / text / primary / ...) so
 * screens migrate to the new palette without churning every reference.
 *
 * Typography matches the design exactly: Inter for body/headings, Space Mono
 * for eyebrow labels. These family names come from @expo-google-fonts and must
 * be loaded (see app/_layout.tsx) before they render.
 */

export const Theme = {
    colors: {
        // Cosmic backgrounds (dark)
        background: '#090711',
        backgroundDeep: '#060509',
        surface: 'rgba(255,255,255,0.035)',      // glass card fill
        surfaceRaised: 'rgba(255,255,255,0.05)',  // search / inputs
        surfaceSolid: '#15121f',                  // opaque panels
        glass: 'rgba(20,16,28,0.72)',             // floating nav / toggles

        // Brand / accents
        primary: '#C9A6FF',         // lavender — links, active, accents
        primaryDeep: '#9B6BE0',
        primaryLight: 'rgba(201,166,255,0.12)',
        amber: '#FFB23E',           // section eyebrows, warm CTA
        gold: '#FFD700',            // spark stars
        goldSoft: '#FFF6D0',

        // Text
        text: '#F3F0F8',
        textSecondary: '#E7E3F0',
        textMuted: '#7a7591',
        textFaint: '#6f6a86',
        label: '#9b95b4',           // mono labels / captions

        // Status
        success: '#7CE0A8',
        error: '#FF6B6B',
        errorLight: 'rgba(255,107,107,0.15)',

        // Lines / borders
        border: 'rgba(255,255,255,0.08)',
        borderSoft: 'rgba(255,255,255,0.06)',
        borderStrong: 'rgba(255,255,255,0.12)',
        linkThread: 'rgba(201,166,255,0.3)',
        starThread: 'rgba(255,210,110,0.18)',

        // Misc back-compat
        secondary: 'rgba(255,255,255,0.06)',
        shadow: '#000000',
        gray: '#6f6a86',
    },
    // Background gradient stops (top -> bottom) for the cosmic canvas
    gradient: ['#15121f', '#0b1326', '#090711'] as const,
    // Exact font families from the design (loaded via @expo-google-fonts).
    fonts: {
        regular: 'Inter_400Regular',
        medium: 'Inter_500Medium',
        semibold: 'Inter_600SemiBold',
        bold: 'Inter_700Bold',
        mono: 'SpaceMono_400Regular',
        monoBold: 'SpaceMono_700Bold',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        header: 64,
    },
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        pill: 30,
        full: 9999,
    },
    shadows: {
        // Subtle lift for glass cards
        soft: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 18,
            elevation: 6,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 14 },
            shadowOpacity: 0.5,
            shadowRadius: 30,
            elevation: 10,
        },
        // Lavender glow for primary actions
        primary: {
            shadowColor: '#9B6BE0',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.6,
            shadowRadius: 16,
            elevation: 8,
        },
        // Warm glow for the FAB / stars
        gold: {
            shadowColor: '#FFB23E',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.6,
            shadowRadius: 24,
            elevation: 10,
        },
    },
} as const;

export type AppTheme = typeof Theme;
