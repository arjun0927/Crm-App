# Firebase Cloud Messaging (FCM) Setup for React Native

This document explains how to configure Firebase Cloud Messaging in the CRM Android app.

## Prerequisites

- Firebase project created (same project used for backend)
- React Native Firebase packages installed:
  - `@react-native-firebase/app`
  - `@react-native-firebase/messaging`

## Android Setup

### 1. Add google-services.json

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the Android icon to add an Android app (or select existing)
4. Enter your package name: `com.cbxcrm`
5. Download `google-services.json`
6. Place it in: `android/app/google-services.json`

**Important:** Never commit `google-services.json` to git. Add it to `.gitignore`.

### 2. Verify Gradle Configuration

The following have already been configured:

**android/build.gradle:**
```groovy
dependencies {
    classpath("com.google.gms:google-services:4.4.0")
}
```

**android/app/build.gradle:**
```groovy
apply plugin: "com.google.gms.google-services"

dependencies {
    implementation(platform("com.google.firebase:firebase-bom:32.7.0"))
    implementation("com.google.firebase:firebase-messaging")
}
```

### 3. Notification Channel (Android 8.0+)

The app is configured with a default notification channel in `AndroidManifest.xml`:

```xml
<meta-data
    android:name="com.google.firebase.messaging.default_notification_channel_id"
    android:value="crm_notifications" />
```

### 4. Required Permissions

Already added to `AndroidManifest.xml`:
- `POST_NOTIFICATIONS` (Android 13+)
- `VIBRATE`
- `RECEIVE_BOOT_COMPLETED`

## Usage in React Native

### Requesting Permissions

```javascript
import { requestNotificationPermission } from './src/services/fcm';

// Request permission (call during onboarding or login)
const granted = await requestNotificationPermission();
if (granted) {
  console.log('Notification permission granted');
}
```

### Getting FCM Token

```javascript
import { getFCMToken, getDeviceId } from './src/services/fcm';

const token = await getFCMToken();
const deviceId = await getDeviceId();

// Register with backend
await api.deviceTokens.register({
  token,
  deviceId,
  platform: 'android',
  deviceName: 'My Phone',
});
```

### Handling Notifications

The `NotificationContext` automatically handles:
- Foreground notifications (shows toast)
- Background notifications (system notification)
- Notification taps (opens app)
- Token refresh (re-registers with backend)

### Using NotificationContext

```javascript
import { useNotification } from './src/context';

const MyComponent = () => {
  const {
    fcmToken,
    deviceId,
    isInitialized,
    pushEnabled,
    notificationCount,
    togglePushNotifications,
  } = useNotification();

  return (
    <View>
      <Text>Notifications: {pushEnabled ? 'Enabled' : 'Disabled'}</Text>
      <Button
        title={pushEnabled ? 'Disable' : 'Enable'}
        onPress={() => togglePushNotifications(!pushEnabled)}
      />
    </View>
  );
};
```

## Background Message Handler

The background handler is registered in `index.js`:

```javascript
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Background message:', remoteMessage);
  // Process notification data
});
```

## Notification Data Structure

Notifications from the backend include:

```javascript
{
  notification: {
    title: 'New Task Assigned',
    body: 'You have a new task to complete',
    android: {
      imageUrl: 'https://example.com/image.jpg',
    },
  },
  data: {
    notificationId: '123',
    type: 'task',
    priority: 'high',
    entityId: '456',
    actionUrl: '/tasks/456',
  },
}
```

## Rich Notifications with Images

Images are automatically displayed when `imageUrl` is provided:
- Maximum recommended size: 1MB
- Supported formats: JPEG, PNG
- Aspect ratio: 2:1 recommended

## Testing

### Send Test Notification

Use the test endpoint after logging in:

```javascript
import { deviceTokensAPI } from './src/api';

await deviceTokensAPI.testNotification({
  title: 'Test Notification',
  body: 'This is a test push notification',
  imageUrl: 'https://example.com/test-image.jpg',
});
```

### Firebase Console

1. Go to Firebase Console > Cloud Messaging
2. Click "Send your first message"
3. Enter notification details
4. Target your app
5. Send test message

## Troubleshooting

### "google-services.json not found"

1. Download from Firebase Console
2. Place in `android/app/` directory
3. Clean and rebuild: `cd android && ./gradlew clean`

### Notifications not appearing

1. Check app is registered with Firebase
2. Verify notification permissions granted
3. Check notification channel exists
4. Test with Firebase Console

### Token is null

1. Ensure google-services.json is correct
2. Check Firebase project configuration
3. Verify network connectivity
4. Clean and reinstall app

### Build errors

1. Clean gradle cache: `cd android && ./gradlew clean`
2. Delete node_modules and reinstall
3. Verify gradle plugin versions match
4. Sync project with gradle files

## Production Considerations

1. **APNs for iOS**: Configure Apple Push Notification service for iOS
2. **Token rotation**: Tokens can change; handle `onTokenRefresh`
3. **Analytics**: Track notification delivery and engagement
4. **Rate limiting**: Backend should limit token registrations
5. **Uninstall handling**: Invalid tokens are auto-removed
