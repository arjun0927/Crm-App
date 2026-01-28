/**
 * AppContext - Global App State Management
 * Provides app-wide settings like theme, notifications, and preferences
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import {
    getTheme,
    setTheme as saveTheme,
    isOnboardingCompleted,
    setOnboardingCompleted as saveOnboardingCompleted,
    getObject,
    setObject,
} from '../storage';

// Storage keys
const STORAGE_KEYS = {
    APP_SETTINGS: '@app_settings',
};

// Default app settings
const DEFAULT_SETTINGS = {
    notifications: true,
    soundEnabled: true,
    hapticFeedback: true,
    autoRefresh: true,
    refreshInterval: 30, // seconds
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    language: 'en',
};

// Create the context
const AppContext = createContext(null);

/**
 * AppProvider Component
 * Wraps the app and provides app-wide context
 */
export const AppProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();

    const [theme, setThemeState] = useState('light');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [onboardingCompleted, setOnboardingCompletedState] = useState(false);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize app state on load
    useEffect(() => {
        initializeApp();
    }, []);

    // Update dark mode when theme changes
    useEffect(() => {
        if (theme === 'system') {
            setIsDarkMode(systemColorScheme === 'dark');
        } else {
            setIsDarkMode(theme === 'dark');
        }
    }, [theme, systemColorScheme]);

    const initializeApp = async () => {
        setIsLoading(true);
        try {
            const [storedTheme, storedOnboarding, storedSettings] = await Promise.all([
                getTheme(),
                isOnboardingCompleted(),
                getObject(STORAGE_KEYS.APP_SETTINGS),
            ]);

            if (storedTheme) {
                setThemeState(storedTheme);
            }

            setOnboardingCompletedState(storedOnboarding || false);

            if (storedSettings) {
                setSettings({ ...DEFAULT_SETTINGS, ...storedSettings });
            }
        } catch (error) {
            console.error('Error initializing app:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Set the app theme
     * @param {'light' | 'dark' | 'system'} newTheme
     */
    const setTheme = useCallback(async (newTheme) => {
        try {
            await saveTheme(newTheme);
            setThemeState(newTheme);
            return true;
        } catch (error) {
            console.error('Error setting theme:', error);
            return false;
        }
    }, []);

    /**
     * Toggle between light and dark mode
     */
    const toggleTheme = useCallback(async () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        return await setTheme(newTheme);
    }, [theme, setTheme]);

    /**
     * Mark onboarding as completed
     */
    const completeOnboarding = useCallback(async () => {
        try {
            await saveOnboardingCompleted(true);
            setOnboardingCompletedState(true);
            return true;
        } catch (error) {
            console.error('Error completing onboarding:', error);
            return false;
        }
    }, []);

    /**
     * Update app settings
     * @param {Object} updates - Settings updates
     */
    const updateSettings = useCallback(async (updates) => {
        try {
            const newSettings = { ...settings, ...updates };
            await setObject(STORAGE_KEYS.APP_SETTINGS, newSettings);
            setSettings(newSettings);
            return true;
        } catch (error) {
            console.error('Error updating settings:', error);
            return false;
        }
    }, [settings]);

    /**
     * Reset settings to defaults
     */
    const resetSettings = useCallback(async () => {
        try {
            await setObject(STORAGE_KEYS.APP_SETTINGS, DEFAULT_SETTINGS);
            setSettings(DEFAULT_SETTINGS);
            return true;
        } catch (error) {
            console.error('Error resetting settings:', error);
            return false;
        }
    }, []);

    /**
     * Get a specific setting value
     * @param {string} key - Setting key
     */
    const getSetting = useCallback((key) => {
        return settings[key];
    }, [settings]);

    const value = {
        // Theme State
        theme,
        isDarkMode,
        setTheme,
        toggleTheme,

        // Onboarding State
        onboardingCompleted,
        completeOnboarding,

        // Settings State
        settings,
        updateSettings,
        resetSettings,
        getSetting,

        // Loading State
        isLoading,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

/**
 * useApp Hook
 * Access app context from any component
 */
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

export default AppContext;
