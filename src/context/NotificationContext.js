/**
 * NotificationContext - Push Notification State Management
 * Provides FCM token management and notification handling throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import {
    initializeFCM,
    getFCMToken,
    getDeviceId,
    deleteFCMToken,
    parseNotificationData,
} from '../services/fcm';
import { notificationsAPI } from '../api';
import { useAuth } from './AuthContext';

// Create the context
const NotificationContext = createContext(null);

// API endpoint for device tokens
const DEVICE_TOKEN_ENDPOINTS = {
    REGISTER: '/device-tokens/register',
    REMOVE: (deviceId) => `/device-tokens/${deviceId}`,
    TOGGLE: '/device-tokens/toggle-notifications',
    GET_DEVICES: '/device-tokens',
};

/**
 * NotificationProvider Component
 * Wraps the app and provides notification context
 */
export const NotificationProvider = ({ children }) => {
    const { isAuthenticated, token: authToken, user } = useAuth();
    
    // State
    const [fcmToken, setFcmToken] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [pushEnabled, setPushEnabled] = useState(true);
    const [lastNotification, setLastNotification] = useState(null);
    const [notificationCount, setNotificationCount] = useState(0);
    
    // Refs
    const unsubscribeRef = useRef(null);
    const appStateRef = useRef(AppState.currentState);
    const registrationAttemptedRef = useRef(false);

    /**
     * Register device token with backend
     */
    const registerDeviceToken = useCallback(async (token, devId) => {
        if (!authToken || !token || !devId) {
            return false;
        }

        try {
            const response = await fetch(`${getApiBaseUrl()}${DEVICE_TOKEN_ENDPOINTS.REGISTER}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    token,
                    deviceId: devId,
                    platform: Platform.OS,
                    deviceName: `${Platform.OS} ${Platform.Version}`,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('[Notification] Device token registered successfully');
                return true;
            } else {
                console.error('[Notification] Failed to register device token:', data.message);
                return false;
            }
        } catch (error) {
            console.error('[Notification] Error registering device token:', error);
            return false;
        }
    }, [authToken]);

    /**
     * Remove device token from backend
     */
    const removeDeviceToken = useCallback(async () => {
        if (!authToken || !deviceId) {
            return false;
        }

        try {
            const response = await fetch(
                `${getApiBaseUrl()}${DEVICE_TOKEN_ENDPOINTS.REMOVE(deviceId)}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                }
            );

            if (response.ok) {
                console.log('[Notification] Device token removed successfully');
                return true;
            }
            return false;
        } catch (error) {
            console.error('[Notification] Error removing device token:', error);
            return false;
        }
    }, [authToken, deviceId]);

    /**
     * Handle foreground notification
     */
    const handleForegroundNotification = useCallback((remoteMessage) => {
        const notification = parseNotificationData(remoteMessage);
        
        if (notification) {
            setLastNotification(notification);
            setNotificationCount(prev => prev + 1);

            // Show toast notification
            Toast.show({
                type: notification.priority === 'urgent' ? 'error' : 
                      notification.priority === 'high' ? 'info' : 'success',
                text1: notification.title,
                text2: notification.body,
                visibilityTime: 5000,
                onPress: () => {
                    // Handle notification tap
                    handleNotificationPress(notification);
                },
            });
        }
    }, []);

    /**
     * Handle notification opened (from background/quit state)
     */
    const handleNotificationOpened = useCallback((remoteMessage) => {
        const notification = parseNotificationData(remoteMessage);
        
        if (notification) {
            setLastNotification(notification);
            handleNotificationPress(notification);
        }
    }, []);

    /**
     * Handle notification press/tap
     */
    const handleNotificationPress = useCallback((notification) => {
        console.log('[Notification] Pressed:', notification);
        
        // You can add navigation logic here based on notification type
        // For example:
        // if (notification.type === 'lead' && notification.entityId) {
        //     navigation.navigate('LeadDetails', { id: notification.entityId });
        // }
    }, []);

    /**
     * Handle token refresh
     */
    const handleTokenRefresh = useCallback(async (newToken) => {
        console.log('[Notification] Token refreshed');
        setFcmToken(newToken);
        
        // Re-register with new token
        if (deviceId && authToken) {
            await registerDeviceToken(newToken, deviceId);
        }
    }, [deviceId, authToken, registerDeviceToken]);

    /**
     * Initialize FCM
     */
    const initializeNotifications = useCallback(async () => {
        if (isInitialized || !isAuthenticated) {
            return;
        }

        try {
            const result = await initializeFCM({
                onForegroundNotification: handleForegroundNotification,
                onNotificationOpened: handleNotificationOpened,
                onTokenRefresh: handleTokenRefresh,
            });

            if (result.success) {
                setFcmToken(result.token);
                setDeviceId(result.deviceId);
                setIsInitialized(true);
                
                // Store unsubscribe function
                unsubscribeRef.current = result.unsubscribe;

                // Register with backend
                if (result.token && result.deviceId && authToken && !registrationAttemptedRef.current) {
                    registrationAttemptedRef.current = true;
                    await registerDeviceToken(result.token, result.deviceId);
                }

                console.log('[Notification] FCM initialized successfully');
            } else {
                console.warn('[Notification] FCM initialization failed:', result.error);
            }
        } catch (error) {
            console.error('[Notification] Error initializing notifications:', error);
        }
    }, [
        isInitialized,
        isAuthenticated,
        authToken,
        handleForegroundNotification,
        handleNotificationOpened,
        handleTokenRefresh,
        registerDeviceToken,
    ]);

    /**
     * Toggle push notifications
     */
    const togglePushNotifications = useCallback(async (enabled) => {
        if (!authToken) {
            return false;
        }

        try {
            const response = await fetch(
                `${getApiBaseUrl()}${DEVICE_TOKEN_ENDPOINTS.TOGGLE}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ enabled }),
                }
            );

            if (response.ok) {
                setPushEnabled(enabled);
                console.log(`[Notification] Push notifications ${enabled ? 'enabled' : 'disabled'}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('[Notification] Error toggling push notifications:', error);
            return false;
        }
    }, [authToken]);

    /**
     * Cleanup on logout
     */
    const cleanupNotifications = useCallback(async () => {
        try {
            // Remove device token from backend
            await removeDeviceToken();
            
            // Delete FCM token
            await deleteFCMToken();
            
            // Cleanup handlers
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
            
            // Reset state
            setFcmToken(null);
            setIsInitialized(false);
            registrationAttemptedRef.current = false;
            
            console.log('[Notification] Cleanup completed');
        } catch (error) {
            console.error('[Notification] Error during cleanup:', error);
        }
    }, [removeDeviceToken]);

    /**
     * Clear notification count
     */
    const clearNotificationCount = useCallback(() => {
        setNotificationCount(0);
    }, []);

    /**
     * Refresh FCM token manually
     */
    const refreshToken = useCallback(async () => {
        try {
            const token = await getFCMToken();
            if (token && token !== fcmToken) {
                setFcmToken(token);
                await registerDeviceToken(token, deviceId);
            }
            return token;
        } catch (error) {
            console.error('[Notification] Error refreshing token:', error);
            return null;
        }
    }, [fcmToken, deviceId, registerDeviceToken]);

    // Initialize notifications when authenticated
    useEffect(() => {
        if (isAuthenticated && authToken) {
            initializeNotifications();
        }
    }, [isAuthenticated, authToken, initializeNotifications]);

    // Handle app state changes
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (
                appStateRef.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // App has come to foreground - refresh token if needed
                refreshToken();
            }
            appStateRef.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [refreshToken]);

    // Cleanup on unmount or logout
    useEffect(() => {
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, []);

    const value = {
        // State
        fcmToken,
        deviceId,
        isInitialized,
        pushEnabled,
        lastNotification,
        notificationCount,
        
        // Methods
        initializeNotifications,
        registerDeviceToken,
        removeDeviceToken,
        togglePushNotifications,
        cleanupNotifications,
        clearNotificationCount,
        refreshToken,
        handleNotificationPress,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

/**
 * useNotification Hook
 * Access notification context from any component
 */
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

/**
 * Helper function to get API base URL
 * Import this from your API config if available
 */
const getApiBaseUrl = () => {
    // You should import this from your API config
    // return API_BASE_URL;
    return 'https://gsvmdl68-3001.inc1.devtunnels.ms/api';
};

export default NotificationContext;
