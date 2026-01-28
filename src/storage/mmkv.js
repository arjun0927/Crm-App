/**
 * AsyncStorage Setup for CRM App
 * Local storage using @react-native-async-storage/async-storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

/**
 * Token Management
 */

// Set authentication token
export const setToken = async (token) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        return true;
    } catch (error) {
        console.error('Error setting token:', error);
        return false;
    }
};

// Get authentication token
export const getToken = async () => {
    try {
        return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
};

// Remove authentication token
export const removeToken = async () => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        return true;
    } catch (error) {
        console.error('Error removing token:', error);
        return false;
    }
};

// Check if token exists
export const hasToken = async () => {
    try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        return token !== null;
    } catch (error) {
        console.error('Error checking token:', error);
        return false;
    }
};

/**
 * User Data Management
 */

// Set user data
export const setUserData = async (userData) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        return true;
    } catch (error) {
        console.error('Error setting user data:', error);
        return false;
    }
};

// Get user data
export const getUserData = async () => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
};

// Remove user data
export const removeUserData = async () => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
        return true;
    } catch (error) {
        console.error('Error removing user data:', error);
        return false;
    }
};

/**
 * Theme Management
 */

// Set theme preference
export const setTheme = async (theme) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
        return true;
    } catch (error) {
        console.error('Error setting theme:', error);
        return false;
    }
};

// Get theme preference
export const getTheme = async () => {
    try {
        const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        return theme || 'light';
    } catch (error) {
        console.error('Error getting theme:', error);
        return 'light';
    }
};

/**
 * Onboarding Management
 */

// Set onboarding completed
export const setOnboardingCompleted = async (completed = true) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, JSON.stringify(completed));
        return true;
    } catch (error) {
        console.error('Error setting onboarding status:', error);
        return false;
    }
};

// Check if onboarding is completed
export const isOnboardingCompleted = async () => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
        return data ? JSON.parse(data) : false;
    } catch (error) {
        console.error('Error getting onboarding status:', error);
        return false;
    }
};

/**
 * Remember Me Management
 */

// Set remember me data
export const setRememberMe = async (email) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, email);
        return true;
    } catch (error) {
        console.error('Error setting remember me:', error);
        return false;
    }
};

// Get remember me data
export const getRememberMe = async () => {
    try {
        return await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
    } catch (error) {
        console.error('Error getting remember me:', error);
        return null;
    }
};

// Remove remember me data
export const removeRememberMe = async () => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
        return true;
    } catch (error) {
        console.error('Error removing remember me:', error);
        return false;
    }
};

/**
 * Generic Storage Methods
 */

// Set string value
export const setString = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.error('Error setting string:', error);
        return false;
    }
};

// Get string value
export const getString = async (key) => {
    try {
        return await AsyncStorage.getItem(key);
    } catch (error) {
        console.error('Error getting string:', error);
        return null;
    }
};

// Set object value
export const setObject = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error setting object:', error);
        return false;
    }
};

// Get object value
export const getObject = async (key) => {
    try {
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting object:', error);
        return null;
    }
};

// Set boolean value
export const setBoolean = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error setting boolean:', error);
        return false;
    }
};

// Get boolean value
export const getBoolean = async (key) => {
    try {
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : false;
    } catch (error) {
        console.error('Error getting boolean:', error);
        return false;
    }
};

// Delete specific key
export const deleteKey = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error deleting key:', error);
        return false;
    }
};

// Clear all data (logout)
export const clearAll = async () => {
    try {
        await AsyncStorage.clear();
        return true;
    } catch (error) {
        console.error('Error clearing storage:', error);
        return false;
    }
};

// Clear auth data only (keeps preferences)
export const clearAuthData = async () => {
    try {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.AUTH_TOKEN,
            STORAGE_KEYS.USER_DATA,
        ]);
        return true;
    } catch (error) {
        console.error('Error clearing auth data:', error);
        return false;
    }
};

// Get all keys
export const getAllKeys = async () => {
    try {
        return await AsyncStorage.getAllKeys();
    } catch (error) {
        console.error('Error getting all keys:', error);
        return [];
    }
};

export default {
    // Token
    setToken,
    getToken,
    removeToken,
    hasToken,
    // User Data
    setUserData,
    getUserData,
    removeUserData,
    // Theme
    setTheme,
    getTheme,
    // Onboarding
    setOnboardingCompleted,
    isOnboardingCompleted,
    // Remember Me
    setRememberMe,
    getRememberMe,
    removeRememberMe,
    // Generic
    setString,
    getString,
    setObject,
    getObject,
    setBoolean,
    getBoolean,
    deleteKey,
    clearAll,
    clearAuthData,
    getAllKeys,
};
