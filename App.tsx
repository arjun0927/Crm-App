/**
 * CRM Pro - Customer Relationship Management App
 * Main Application Entry Point
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AppNavigator } from './src/navigation';
import { Colors } from './src/constants/Colors';
import { toastConfig } from './src/components';
import {
  AuthProvider,
  AppProvider,
  LeadsProvider,
  TasksProvider,
} from './src/context';
import { configureGoogleSignIn } from './src/services';

// Ignore specific warnings (optional - for development)
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

/**
 * Root App Component
 * Wraps the app with all necessary providers
 */
function App(): React.JSX.Element {
  // Configure Google Sign-In when the app starts
  useEffect(() => {
    configureGoogleSignIn();
  }, []);
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background}
        translucent={false}
      />
      <AppProvider>
        <AuthProvider>
          <LeadsProvider>
            <TasksProvider>
              <AppNavigator />
            </TasksProvider>
          </LeadsProvider>
        </AuthProvider>
      </AppProvider>
      {/* Toast must be at the root level, outside of navigation */}
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}

export default App;
