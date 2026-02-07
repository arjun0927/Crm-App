/**
 * Context Index - Export all context providers and hooks
 */

// Auth Context
export { AuthProvider, useAuth } from './AuthContext';
export { default as AuthContext } from './AuthContext';

// App Context
export { AppProvider, useApp } from './AppContext';
export { default as AppContext } from './AppContext';

// Leads Context
export { LeadsProvider, useLeads } from './LeadsContext';
export { default as LeadsContext } from './LeadsContext';

// Tasks Context
export { TasksProvider, useTasks } from './TasksContext';
export { default as TasksContext } from './TasksContext';

// Tab Navigation Context
export { TabNavigationProvider, useTabNavigation, BOTTOM_SHEET_SCREENS } from './TabNavigationContext';
export { default as TabNavigationContext } from './TabNavigationContext';

// Notification Context (FCM Push Notifications)
export { NotificationProvider, useNotification } from './NotificationContext';
export { default as NotificationContext } from './NotificationContext';
