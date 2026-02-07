/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

/**
 * FCM Background Message Handler
 * Must be registered outside of any React component
 * This handles notifications when the app is in background or quit state
 */
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('[FCM] Background message received:', remoteMessage);
    
    // You can process the notification data here
    // For example, update badge count, store notification locally, etc.
    const { data, notification } = remoteMessage;
    
    if (data) {
        console.log('[FCM] Background message data:', data);
    }
    
    // Return a promise or void
    // Don't do heavy processing here as it runs in a headless JS context
});

/**
 * Handle notification that caused the app to open from quit state
 * This is checked when the app boots up
 */
messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
        if (remoteMessage) {
            console.log('[FCM] App opened from quit state via notification:', remoteMessage);
            // You can set a global flag or store the notification data
            // to be processed once the app is fully loaded
            global.initialNotification = remoteMessage;
        }
    });

AppRegistry.registerComponent(appName, () => App);
