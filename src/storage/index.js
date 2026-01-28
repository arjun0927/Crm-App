/**
 * Storage Index - Export all storage utilities
 */

export {
    // Token Management
    setToken,
    getToken,
    removeToken,
    hasToken,
    // User Data Management
    setUserData,
    getUserData,
    removeUserData,
    // Theme Management
    setTheme,
    getTheme,
    // Onboarding Management
    setOnboardingCompleted,
    isOnboardingCompleted,
    // Remember Me Management
    setRememberMe,
    getRememberMe,
    removeRememberMe,
    // Generic Storage
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
} from './mmkv';
