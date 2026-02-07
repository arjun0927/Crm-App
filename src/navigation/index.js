/**
 * Navigation Index - Export all navigation components
 */

export { default as AppNavigator } from './AppNavigator';
export { navigationRef, navigate, resetNavigation } from './AppNavigator';
export { default as AuthStack } from './AuthStack';
export { default as MainStack } from './MainStack';
export { default as BottomTabNavigator } from './BottomTabNavigator';
export { default as BottomDrawerNavigation } from './BottomDrawerNavigation';
// Legacy exports - can be removed later
export { default as CustomTabBar } from './CustomTabBar';
export { default as BottomSheetNavigation } from './BottomSheetNavigation';

