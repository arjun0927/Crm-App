/**
 * Custom Tab Bar Component
 * Features a floating up-arrow button in the center with dynamic last tab
 */

import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../constants/Spacing';
import { ms, vs, wp } from '../utils/Responsive';
import { AppText } from '../components';
import { useTabNavigation } from '../context/TabNavigationContext';

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const { openBottomSheet, dynamicTab, activeBottomSheetScreen } = useTabNavigation();

    // Filter out any dynamic route that might exist
    const routes = state.routes;

    // Calculate the middle index (for placing the floating button)
    const middleIndex = 2; // After Leads and Pipeline, before Tasks

    const renderTabItem = (route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || route.name;
        const isFocused = state.index === index;

        // Check if this is the dynamic tab (last tab)
        const isLastTab = index === routes.length - 1;
        const isDynamicTabActive = isLastTab && dynamicTab && activeBottomSheetScreen;

        // If this is the last tab and we have a dynamic tab selected, show it differently
        let displayLabel = label;
        let iconName = options.tabBarIcon?.({ focused: isFocused, color: isFocused ? Colors.tabBarActive : Colors.tabBarInactive })?.props?.children?.props?.name;

        // For dynamic tab display
        if (isLastTab && dynamicTab) {
            displayLabel = dynamicTab.title;
            iconName = dynamicTab.icon;
        }

        const onPress = () => {
            const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
            }
        };

        const onLongPress = () => {
            navigation.emit({
                type: 'tabLongPress',
                target: route.key,
            });
        };

        const color = isFocused ? Colors.tabBarActive : Colors.tabBarInactive;

        return (
            <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabItem}
            >
                <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
                    {options.tabBarIcon?.({ focused: isFocused, color })}
                </View>
                <AppText
                    size="xs"
                    weight={isFocused ? 'semiBold' : 'medium'}
                    color={color}
                    style={styles.tabLabel}
                    numberOfLines={1}
                >
                    {displayLabel}
                </AppText>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Tab Bar Background */}
            <View style={styles.tabBar}>
                {/* Left tabs (before floating button) */}
                {routes.slice(0, middleIndex).map((route, index) => renderTabItem(route, index))}

                {/* Floating Button Placeholder */}
                <View style={styles.floatingButtonPlaceholder} />

                {/* Right tabs (after floating button) */}
                {routes.slice(middleIndex).map((route, index) =>
                    renderTabItem(route, index + middleIndex)
                )}
            </View>

            {/* Floating Up Arrow Button */}
            <TouchableOpacity
                style={styles.floatingButton}
                onPress={openBottomSheet}
                activeOpacity={0.85}
            >
                <View style={styles.floatingButtonInner}>
                    <Icon
                        name="chevron-up"
                        size={ms(28)}
                        color={Colors.white}
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: Colors.tabBarBackground,
        height: Platform.OS === 'ios' ? vs(85) : vs(70),
        paddingTop: vs(8),
        paddingBottom: Platform.OS === 'ios' ? vs(25) : vs(10),
        paddingHorizontal: Spacing.sm,
        borderTopWidth: 0,
        ...Shadow.lg,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
    tabLabel: {
        marginTop: vs(2),
    },
    floatingButtonPlaceholder: {
        width: ms(60),
    },
    floatingButton: {
        position: 'absolute',
        top: -ms(20),
        left: '50%',
        marginLeft: -ms(28),
        zIndex: 10,
    },
    floatingButtonInner: {
        width: ms(56),
        height: ms(56),
        borderRadius: ms(28),
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.lg,
        // Extra glow effect
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 10,
    },
});

export default CustomTabBar;
