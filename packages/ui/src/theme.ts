export const Theme = {
    colors: {
        primary: '#9b59b6',
        primaryLight: '#f0ebf7',
        secondary: '#f0f0f0',
        background: '#f9f9f9',
        surface: '#ffffff',
        text: '#333333',
        textSecondary: '#555555',
        textMuted: '#999999',
        error: '#ef4444',
        errorLight: '#fee2e2',
        success: '#10b981',
        border: '#f0f0f0',
        shadow: '#000000',
        gray: '#9ca3af',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        header: 60,
    },
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        full: 9999,
    },
    shadows: {
        soft: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 1,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
        },
        primary: {
            shadowColor: '#9b59b6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
        }
    }
} as const;

export type AppTheme = typeof Theme;
