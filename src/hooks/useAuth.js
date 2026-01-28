/**
 * useAuth Hook
 * Custom hook for authentication state management
 */

import { useState, useEffect, useCallback } from 'react';
import {
    getToken,
    setToken,
    removeToken,
    getUserData,
    setUserData,
    removeUserData,
    clearAuthData,
} from '../storage';

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check initial auth state
    useEffect(() => {
        checkAuthState();
    }, []);

    const checkAuthState = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const userData = await getUserData();

            if (token && userData) {
                setIsAuthenticated(true);
                setUser(userData);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Login function
    const login = useCallback(async (token, userData) => {
        try {
            await setToken(token);
            await setUserData(userData);
            setIsAuthenticated(true);
            setUser(userData);
            return true;
        } catch (error) {
            console.error('Error during login:', error);
            return false;
        }
    }, []);

    // Logout function
    const logout = useCallback(async () => {
        try {
            await clearAuthData();
            setIsAuthenticated(false);
            setUser(null);
            return true;
        } catch (error) {
            console.error('Error during logout:', error);
            return false;
        }
    }, []);

    // Update user data
    const updateUser = useCallback(async (userData) => {
        try {
            await setUserData(userData);
            setUser(userData);
            return true;
        } catch (error) {
            console.error('Error updating user:', error);
            return false;
        }
    }, []);

    return {
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        updateUser,
        checkAuthState,
    };
};

export default useAuth;
