// contexts/ThemeContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
    theme: 'light' | 'dark';
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme_preference';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const systemTheme = useColorScheme() ?? 'light';
    const [themeMode, setThemeModeState] = useState<ThemeMode>('light'); // Default to light
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Load saved theme preference on mount
    useEffect(() => {
        loadThemePreference();
    }, []);

    // Update theme when themeMode or systemTheme changes
    useEffect(() => {
        if (themeMode === 'auto') {
            setTheme(systemTheme);
        } else {
            setTheme(themeMode);
        }
    }, [themeMode, systemTheme]);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto')) {
                setThemeModeState(savedTheme as ThemeMode);
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        }
    };

    const setThemeMode = async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
            setThemeModeState(mode);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    const toggleTheme = () => {
        const newMode = theme === 'light' ? 'dark' : 'light';
        setThemeMode(newMode);
    };

    return (
        <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
