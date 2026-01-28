/**
 * Main Stack Navigator
 * Handles all app screens including detail screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants';
import BottomTabNavigator from './BottomTabNavigator';
import {
    LeadDetailsScreen,
    TaskDetailsScreen,
    AddLeadScreen,
    AddTaskScreen,
    ProfileScreen,
} from '../screens';
import EditCompanyScreen from '../screens/main/EditCompanyScreen';

const Stack = createNativeStackNavigator();

const MainStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
            }}
        >
            {/* Tab Navigator */}
            <Stack.Screen
                name={ROUTES.MAIN_TABS}
                component={BottomTabNavigator}
                options={{
                    animation: 'fade',
                }}
            />

            {/* Lead Screens */}
            <Stack.Screen
                name={ROUTES.LEAD_DETAILS}
                component={LeadDetailsScreen}
            />
            <Stack.Screen
                name={ROUTES.ADD_LEAD}
                component={AddLeadScreen}
                options={{
                    animation: 'slide_from_bottom',
                    presentation: 'modal',
                }}
            />

            {/* Task Screens */}
            <Stack.Screen
                name={ROUTES.TASK_DETAILS}
                component={TaskDetailsScreen}
            />
            <Stack.Screen
                name={ROUTES.ADD_TASK}
                component={AddTaskScreen}
                options={{
                    animation: 'slide_from_bottom',
                    presentation: 'modal',
                }}
            />

            {/* Company Screens */}
            <Stack.Screen
                name={'EditCompany'}
                component={EditCompanyScreen}
                options={{
                    animation: 'slide_from_bottom',
                    presentation: 'modal',
                }}
            />

            {/* Profile Screen */}
            <Stack.Screen
                name={ROUTES.PROFILE}
                component={ProfileScreen}
            />
        </Stack.Navigator>
    );
};

export default MainStack;
