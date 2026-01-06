// hooks/useThemeColor.ts
import { useColorScheme } from 'react-native';

export const Colors = {
    light: {
        // Primary colors from your app
        primary: '#4289f4',
        primaryDark: '#1472d6',

        // Text colors
        text: '#000000',
        textSecondary: '#666666',
        textMuted: '#a0a0a0',

        // Background colors
        background: '#f0f2f5',
        backgroundSecondary: '#ffffff',
        card: '#ffffff',

        // Border colors
        border: '#cececeff',
        borderLight: 'rgba(0,0,0,0.05)',

        // Status colors
        success: '#12df34',
        successBg: '#e8f5e9',
        warning: '#ff9800',
        error: '#f44336',
        errorLight: '#f45742',

        // Leave badge colors
        privilegeLeave: '#4caf50',
        casualLeave: '#2196f3',
        sickLeave: '#ff9800',
        absent: '#f44336',

        // Special colors
        swipeDefault: '#bfbfbf',
        swipeCheckedIn: '#ffe23d',
        swipeDisabled: '#999999',
        profileBg: '#E0E8FF',
        birthdayBg: '#fef5e7',
        birthdayBorder: '#f9e79f',
        birthdayAccent: '#d4145a',
        birthdayProfile: '#8e44ad',

        // Icon colors
        icon: '#4169E1',
        iconSecondary: '#666666',

        // Tab bar
        tabIconDefault: '#687076',
        tabIconSelected: '#4289f4',
        tint: '#4289f4',
    },
    dark: {
        // Primary colors
        primary: '#4289f4',
        primaryDark: '#1472d6',

        // Text colors
        text: '#ECEDEE',
        textSecondary: '#9BA1A6',
        textMuted: '#6b7280',

        // Background colors
        background: '#151718',
        backgroundSecondary: '#1c1c1e',
        card: '#1c1c1e',

        // Border colors
        border: '#2c2c2e',
        borderLight: 'rgba(255,255,255,0.1)',

        // Status colors
        success: '#12df34',
        successBg: '#1a2e1a',
        warning: '#ff9800',
        error: '#f44336',
        errorLight: '#f45742',

        // Leave badge colors
        privilegeLeave: '#4caf50',
        casualLeave: '#2196f3',
        sickLeave: '#ff9800',
        absent: '#f44336',

        // Special colors
        swipeDefault: '#3a3a3c',
        swipeCheckedIn: '#ffe23d',
        swipeDisabled: '#555555',
        profileBg: '#2a3a5a',
        birthdayBg: '#2a2520',
        birthdayBorder: '#4a4030',
        birthdayAccent: '#d4145a',
        birthdayProfile: '#8e44ad',

        // Icon colors
        icon: '#4169E1',
        iconSecondary: '#9BA1A6',

        // Tab bar
        tabIconDefault: '#9BA1A6',
        tabIconSelected: '#4289f4',
        tint: '#ffffff',
    },
};

export function useThemeColor(
    props: { light?: string; dark?: string },
    colorName: keyof typeof Colors.light
): string {
    const theme = useColorScheme() ?? 'light';
    const colorFromProps = props[theme];

    if (colorFromProps) {
        return colorFromProps;
    }
    return Colors[theme][colorName];
}

// Helper hook to get multiple colors at once
export function useThemeColors() {
    // Import useTheme dynamically to avoid circular dependency
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { useTheme } = require('@/contexts/ThemeContext');
        const { theme } = useTheme();
        return Colors[theme as 'light' | 'dark'];
    } catch {
        // Fallback to system theme if ThemeContext is not available
        const theme = useColorScheme() ?? 'light';
        return Colors[theme];
    }
}