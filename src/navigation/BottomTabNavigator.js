/**
 * Bottom Tab Navigator
 * Main app navigation with bottom drawer for quick screen access
 * Uses a custom bottom drawer instead of traditional tab bar
 */

import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { ROUTES } from '../constants';
import {
    LeadsScreen,
    PipelineScreen,
    TasksScreen,
    DashboardScreen,
    ContactsScreen,
    ReportsScreen,
    FollowUpEngineScreen,
    ProfileScreen,
} from '../screens';
import BottomDrawerNavigation from './BottomDrawerNavigation';
import { useTabNavigation } from '../context/TabNavigationContext';
import { vs } from '../utils/Responsive';

// Height of the collapsed drawer to reserve space
const DRAWER_COLLAPSED_HEIGHT = Platform.OS === 'ios' ? vs(140) : vs(130);

// Dynamic content renderer based on active screen
const DynamicScreenContent = ({ navigation }) => {
    const { activeScreen } = useTabNavigation();

    // Create a route mock for screens that need it
    const mockRoute = useMemo(() => ({
        params: {},
    }), []);

    // Render the appropriate screen based on active selection
    const renderScreen = () => {
        const screenProps = { navigation, route: mockRoute };

        switch (activeScreen?.route) {
            case ROUTES.LEADS:
                return <LeadsScreen {...screenProps} />;
            case ROUTES.PIPELINE:
                return <PipelineScreen {...screenProps} />;
            case ROUTES.TASKS:
                return <TasksScreen {...screenProps} />;
            case ROUTES.DASHBOARD:
                return <DashboardScreen {...screenProps} />;
            case ROUTES.CONTACTS:
                return <ContactsScreen {...screenProps} />;
            case ROUTES.REPORTS:
                return <ReportsScreen {...screenProps} />;
            case ROUTES.FOLLOW_UP_ENGINE:
                return <FollowUpEngineScreen {...screenProps} />;
            case ROUTES.PROFILE:
                return <ProfileScreen {...screenProps} />;
            default:
                return <LeadsScreen {...screenProps} />;
        }
    };

    return (
        <View style={styles.screenContainer}>
            {renderScreen()}
        </View>
    );
};

const BottomTabNavigator = () => {
    const navigation = useNavigation();
    const { collapseDrawer } = useTabNavigation();

    // Handle navigation from drawer - collapse drawer and navigate
    const handleDrawerNavigate = useCallback((route) => {
        // Drawer is already collapsed by the BottomDrawerNavigation component
        // The screen will re-render based on context state
    }, []);

    return (
        <View style={styles.container}>
            {/* Main Content Area */}
            <DynamicScreenContent navigation={navigation} />

            {/* Bottom Drawer Navigation */}
            <BottomDrawerNavigation onNavigate={handleDrawerNavigate} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    screenContainer: {
        flex: 1,
        // Reserve space for the collapsed drawer at the bottom
        marginBottom: DRAWER_COLLAPSED_HEIGHT,
    },
});

export default BottomTabNavigator;
