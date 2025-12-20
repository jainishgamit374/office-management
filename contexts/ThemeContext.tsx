// contexts/ThemeContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ThemeColors {
    // Base colors
    primary: string;
    primaryLight: string;
    secondary: string;
    background: string;
    card: string;

    // Text colors
    text: string;
    textSecondary: string;
    textTertiary: string;

    // UI colors
    border: string;
    divider: string;
    shadow: string;

    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;
}

const lightColors: ThemeColors = {
    primary: '#4A90FF',
    primaryLight: 'rgba(74, 144, 255, 0.1)',
    secondary: '#6C757D',
    background: '#F5F5F5',
    card: '#FFFFFF',

    text: '#1a1a1a',
    textSecondary: '#666666',
    textTertiary: '#888888',

    border: 'rgba(74, 144, 255, 0.1)',
    divider: '#F0F0F0',
    shadow: '#000000',

    success: '#4CAF50',
    warning: '#FF9800',
    error: '#FF5252',
    info: '#2196F3',
};

const darkColors: ThemeColors = {
    primary: '#4A90FF',
    primaryLight: 'rgba(74, 144, 255, 0.2)',
    secondary: '#8E9AAF',
    background: '#121212',
    card: '#1E1E1E',

    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',

    border: 'rgba(255, 255, 255, 0.1)',
    divider: '#2A2A2A',
    shadow: '#000000',

    success: '#66BB6A',
    warning: '#FFA726',
    error: '#EF5350',
    info: '#42A5F5',
};

interface ThemeContextType {
    theme: 'light' | 'dark';
    colors: ThemeColors;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = '@app_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_KEY);
            if (savedTheme === 'dark' || savedTheme === 'light') {
                setTheme(savedTheme);
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        }
    };

    const toggleTheme = async () => {
        try {
            const newTheme = theme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
            await AsyncStorage.setItem(THEME_KEY, newTheme);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const colors = theme === 'light' ? lightColors : darkColors;

    return (
        <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
