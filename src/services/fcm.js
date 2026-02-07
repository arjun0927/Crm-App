/**
 * FCM (Firebase Cloud Messaging) Service
 * Handles push notifications for the CRM app
 */

import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const FCM_TOKEN_KEY = '@fcm_token';
const DEVICE_ID_KEY = '@device_id';

/**
 * Generate or retrieve a unique device ID
 */
export const getDeviceId = async () => {
    try {
        let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
        if (!deviceId) {
            // Generate a unique device ID
            deviceId = `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
        }
        return deviceId;
    } catch (error) {
        console.error('[FCM] Error getting device ID:', error);
        return `${Platform.OS}_${Date.now()}`;
    }
};

/**
 * Request notification permissions (Android 13+ and iOS)
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestNotificationPermission = async () => {
    try {
        // For Android 13+, request POST_NOTIFICATIONS permission
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            const result = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            );
            if (result !== PermissionsAndroid.RESULTS.GRANTED) {
                console.log('[FCM] Notification permission denied');
                return false;
            }
        }

        // Request Firebase messaging permission
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('[FCM] Notification permission granted');
        } else {
            console.log('[FCM] Notification permission denied');
        }

        return enabled;
    } catch (error) {
        console.error('[FCM] Error requesting notification permission:', error);
        return false;
    }
};

/**
 * Check if notification permissions are granted
 * @returns {Promise<boolean>}
 */
export const hasNotificationPermission = async () => {
    try {
        const authStatus = await messaging().hasPermission();
        return (
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
    } catch (error) {
        console.error('[FCM] Error checking notification permission:', error);
        return false;
    }
};

/**
 * Get FCM token for the device
 * @returns {Promise<string|null>}
 */
export const getFCMToken = async () => {
    try {
        // Check if app has notification permissions
        const hasPermission = await hasNotificationPermission();
        if (!hasPermission) {
            console.log('[FCM] No notification permission, skipping token retrieval');
            return null;
        }

        // Get the FCM token
        const token = await messaging().getToken();
        
        if (token) {
            // Store the token locally
            await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
            console.log('[FCM] Token retrieved successfully');
        }

        return token;
    } catch (error) {
        console.error('[FCM] Error getting FCM token:', error);
        return null;
    }
};

/**
 * Get stored FCM token
 * @returns {Promise<string|null>}
 */
export const getStoredFCMToken = async () => {
    try {
        return await AsyncStorage.getItem(FCM_TOKEN_KEY);
    } catch (error) {
        console.error('[FCM] Error getting stored token:', error);
        return null;
    }
};

/**
 * Delete FCM token (useful for logout)
 * @returns {Promise<boolean>}
 */
export const deleteFCMToken = async () => {
    try {
        await messaging().deleteToken();
        await AsyncStorage.removeItem(FCM_TOKEN_KEY);
        console.log('[FCM] Token deleted successfully');
        return true;
    } catch (error) {
        console.error('[FCM] Error deleting FCM token:', error);
        return false;
    }
};

/**
 * Subscribe to a topic
 * @param {string} topic - Topic name to subscribe to
 */
export const subscribeToTopic = async (topic) => {
    try {
        await messaging().subscribeToTopic(topic);
        console.log(`[FCM] Subscribed to topic: ${topic}`);
    } catch (error) {
        console.error(`[FCM] Error subscribing to topic ${topic}:`, error);
    }
};

/**
 * Unsubscribe from a topic
 * @param {string} topic - Topic name to unsubscribe from
 */
export const unsubscribeFromTopic = async (topic) => {
    try {
        await messaging().unsubscribeFromTopic(topic);
        console.log(`[FCM] Unsubscribed from topic: ${topic}`);
    } catch (error) {
        console.error(`[FCM] Error unsubscribing from topic ${topic}:`, error);
    }
};

/**
 * Set up foreground notification handler
 * @param {function} onNotification - Callback when notification is received in foreground
 * @returns {function} Unsubscribe function
 */
export const setupForegroundHandler = (onNotification) => {
    return messaging().onMessage(async (remoteMessage) => {
        console.log('[FCM] Foreground notification received:', remoteMessage);
        
        if (onNotification) {
            onNotification(remoteMessage);
        }
    });
};

/**
 * Set up notification opened handler (when app is in background/quit and notification is tapped)
 * @param {function} onNotificationOpened - Callback when notification is opened
 * @returns {function} Unsubscribe function
 */
export const setupNotificationOpenedHandler = (onNotificationOpened) => {
    return messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('[FCM] Notification opened app from background:', remoteMessage);
        
        if (onNotificationOpened) {
            onNotificationOpened(remoteMessage);
        }
    });
};

/**
 * Check if app was opened from a notification (when app was quit)
 * @returns {Promise<Object|null>} The initial notification or null
 */
export const getInitialNotification = async () => {
    try {
        const remoteMessage = await messaging().getInitialNotification();
        
        if (remoteMessage) {
            console.log('[FCM] App opened from quit state via notification:', remoteMessage);
        }
        
        return remoteMessage;
    } catch (error) {
        console.error('[FCM] Error getting initial notification:', error);
        return null;
    }
};

/**
 * Set up background message handler
 * Note: This must be called outside of any component, typically in index.js
 * @param {function} handler - Background message handler
 */
export const setBackgroundMessageHandler = (handler) => {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('[FCM] Background message received:', remoteMessage);
        
        if (handler) {
            await handler(remoteMessage);
        }
    });
};

/**
 * Set up token refresh handler
 * @param {function} onTokenRefresh - Callback when token is refreshed
 * @returns {function} Unsubscribe function
 */
export const setupTokenRefreshHandler = (onTokenRefresh) => {
    return messaging().onTokenRefresh((token) => {
        console.log('[FCM] Token refreshed');
        
        // Store the new token
        AsyncStorage.setItem(FCM_TOKEN_KEY, token).catch(console.error);
        
        if (onTokenRefresh) {
            onTokenRefresh(token);
        }
    });
};

/**
 * Parse notification data from a remote message
 * @param {Object} remoteMessage - Firebase remote message
 * @returns {Object} Parsed notification data
 */
export const parseNotificationData = (remoteMessage) => {
    if (!remoteMessage) {
        return null;
    }

    const { notification, data } = remoteMessage;

    return {
        title: notification?.title || data?.title || 'Notification',
        body: notification?.body || data?.body || '',
        imageUrl: notification?.android?.imageUrl || notification?.ios?.imageUrl || data?.imageUrl,
        notificationId: data?.notificationId,
        type: data?.type,
        priority: data?.priority,
        entityId: data?.entityId,
        actionUrl: data?.actionUrl,
        rawData: data,
    };
};

/**
 * Initialize FCM service
 * Call this in your app's entry point
 * @param {Object} callbacks - Callback functions
 * @param {function} callbacks.onForegroundNotification - Called when notification received in foreground
 * @param {function} callbacks.onNotificationOpened - Called when notification is tapped
 * @param {function} callbacks.onTokenRefresh - Called when FCM token is refreshed
 * @returns {Promise<Object>} Initialization result with token and unsubscribe functions
 */
export const initializeFCM = async (callbacks = {}) => {
    try {
        // Request permissions
        const hasPermission = await requestNotificationPermission();
        
        if (!hasPermission) {
            return {
                success: false,
                token: null,
                error: 'Notification permission denied',
            };
        }

        // Get FCM token
        const token = await getFCMToken();
        
        // Get device ID
        const deviceId = await getDeviceId();

        // Set up handlers
        const unsubscribeForeground = callbacks.onForegroundNotification
            ? setupForegroundHandler(callbacks.onForegroundNotification)
            : null;

        const unsubscribeOpened = callbacks.onNotificationOpened
            ? setupNotificationOpenedHandler(callbacks.onNotificationOpened)
            : null;

        const unsubscribeTokenRefresh = callbacks.onTokenRefresh
            ? setupTokenRefreshHandler(callbacks.onTokenRefresh)
            : null;

        // Check for initial notification (app opened from quit state)
        const initialNotification = await getInitialNotification();
        if (initialNotification && callbacks.onNotificationOpened) {
            callbacks.onNotificationOpened(initialNotification);
        }

        return {
            success: true,
            token,
            deviceId,
            platform: Platform.OS,
            unsubscribe: () => {
                unsubscribeForeground?.();
                unsubscribeOpened?.();
                unsubscribeTokenRefresh?.();
            },
        };
    } catch (error) {
        console.error('[FCM] Error initializing FCM:', error);
        return {
            success: false,
            token: null,
            error: error.message,
        };
    }
};

export default {
    requestNotificationPermission,
    hasNotificationPermission,
    getFCMToken,
    getStoredFCMToken,
    deleteFCMToken,
    getDeviceId,
    subscribeToTopic,
    unsubscribeFromTopic,
    setupForegroundHandler,
    setupNotificationOpenedHandler,
    getInitialNotification,
    setBackgroundMessageHandler,
    setupTokenRefreshHandler,
    parseNotificationData,
    initializeFCM,
};
