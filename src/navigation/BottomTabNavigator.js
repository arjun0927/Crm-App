/**
 * Bottom Tab Navigator
 * Main app tab navigation
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../constants/Spacing';
import { ms, vs } from '../utils/Responsive';
import { ROUTES } from '../constants';
import {
    DashboardScreen,
    ContactsScreen,
    LeadsScreen,
    PipelineScreen,
} from '../screens';

const Tab = createBottomTabNavigator();

// Tab bar icon component
const TabBarIcon = ({ name, focused, color }) => {
    return (
        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
            <Icon name={name} size={ms(24)} color={color} />
        </View>
    );
};

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            initialRouteName={ROUTES.DASHBOARD}
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.tabBarActive,
                tabBarInactiveTintColor: Colors.tabBarInactive,
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarItemStyle: styles.tabBarItem,
                tabBarHideOnKeyboard: true,
            }}
        >
            <Tab.Screen
                name={ROUTES.DASHBOARD}
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'Companies',
                    tabBarIcon: ({ focused, color }) => (
                        <TabBarIcon
                            name={focused ? 'office-building' : 'office-building-outline'}
                            focused={focused}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name={ROUTES.CONTACTS}
                component={ContactsScreen}
                options={{
                    tabBarLabel: 'Contacts',
                    tabBarIcon: ({ focused, color }) => (
                        <TabBarIcon
                            name={focused ? 'account-multiple' : 'account-multiple-outline'}
                            focused={focused}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name={ROUTES.LEADS}
                component={LeadsScreen}
                options={{
                    tabBarLabel: 'Leads',
                    tabBarIcon: ({ focused, color }) => (
                        <TabBarIcon
                            name={focused ? 'account-star' : 'account-star-outline'}
                            focused={focused}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name={ROUTES.PIPELINE}
                component={PipelineScreen}
                options={{
                    tabBarLabel: 'Pipeline',
                    tabBarIcon: ({ focused, color }) => (
                        <TabBarIcon
                            name={focused ? 'chart-line' : 'chart-line-variant'}
                            focused={focused}
                            color={color}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: Colors.tabBarBackground,
        borderTopWidth: 0,
        height: Platform.OS === 'ios' ? vs(85) : vs(65),
        paddingTop: vs(8),
        paddingBottom: Platform.OS === 'ios' ? vs(25) : vs(10),
        paddingHorizontal: Spacing.sm,
        ...Shadow.lg,
    },
    tabBarLabel: {
        fontSize: ms(11),
        fontWeight: '500',
        marginTop: 2,
    },
    tabBarItem: {
        paddingTop: 0,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: ms(40),
        height: ms(32),
        borderRadius: BorderRadius.md,
    },
    iconContainerActive: {
        backgroundColor: Colors.primaryBackground,
    },
});

export default BottomTabNavigator;
