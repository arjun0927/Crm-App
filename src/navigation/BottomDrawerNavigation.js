/**
 * Bottom Drawer Navigation Component
 * A persistent drawer that shows first row of icons, expandable to show all
 * - Initially collapsed: shows only 4 icons in the first row
 * - Expandable: tap/drag to reveal all icons
 * - Auto-collapse on selection
 * - Selected icon moves to first row
 */

import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated,
    PanResponder,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { BorderRadius, Shadow } from '../constants/Spacing';
import { ms, vs, wp } from '../utils/Responsive';
import { AppText } from '../components';
import { useTabNavigation } from '../context/TabNavigationContext';

const ICONS_PER_ROW = 4;
// Increased collapsed height for fully visible icons in tab view
const COLLAPSED_HEIGHT = Platform.OS === 'ios' ? vs(140) : vs(130);
// Height for each row of icons - reduced for compact layout
const ROW_HEIGHT = vs(100);
const HANDLE_HEIGHT = vs(16);
const DRAG_THRESHOLD = 50;
// Safe area padding for bottom
const BOTTOM_SAFE_AREA = Platform.OS === 'ios' ? vs(20) : vs(8);

const BottomDrawerNavigation = ({ onNavigate }) => {
    const {
        isDrawerExpanded,
        expandDrawer: contextExpandDrawer,
        collapseDrawer: contextCollapseDrawer,
        selectScreen,
        orderedScreens,
        isScreenActive,
    } = useTabNavigation();

    // Local expanded state for smoother animations
    const [isExpanded, setIsExpanded] = useState(false);

    // Calculate expanded height based on number of screens
    const totalRows = Math.ceil(orderedScreens.length / ICONS_PER_ROW);
    const EXPANDED_HEIGHT = (totalRows * ROW_HEIGHT) + HANDLE_HEIGHT + BOTTOM_SAFE_AREA + vs(10);

    const drawerHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const dragStartY = useRef(0);
    const currentHeight = useRef(COLLAPSED_HEIGHT);

    // Animate drawer expansion - smoother and slower
    const expandDrawer = useCallback(() => {
        setIsExpanded(true);
        Animated.parallel([
            Animated.spring(drawerHeight, {
                toValue: EXPANDED_HEIGHT,
                damping: 28, // Higher damping = smoother, less bouncy
                stiffness: 90, // Lower stiffness = slower animation
                mass: 1,
                useNativeDriver: false,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0.5,
                duration: 350, // Longer duration for smoother fade
                useNativeDriver: true,
            }),
        ]).start(() => {
            currentHeight.current = EXPANDED_HEIGHT;
            contextExpandDrawer();
        });
    }, [EXPANDED_HEIGHT, drawerHeight, backdropOpacity, contextExpandDrawer]);

    // Animate drawer collapse - smoother and slower
    const collapseDrawerAnimated = useCallback(() => {
        Animated.parallel([
            Animated.spring(drawerHeight, {
                toValue: COLLAPSED_HEIGHT,
                damping: 28, // Higher damping = smoother, less bouncy
                stiffness: 90, // Lower stiffness = slower animation
                mass: 1,
                useNativeDriver: false,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 300, // Longer duration for smoother fade
                useNativeDriver: true,
            }),
        ]).start(() => {
            currentHeight.current = COLLAPSED_HEIGHT;
            setIsExpanded(false);
            contextCollapseDrawer();
        });
    }, [drawerHeight, backdropOpacity, contextCollapseDrawer]);

    // Pan responder for drag gesture - isolated to handle area only
    const panResponder = useMemo(() => PanResponder.create({
        // Only respond to touches that start in this view
        onStartShouldSetPanResponder: () => true,
        // Capture the gesture if there's vertical movement
        onMoveShouldSetPanResponder: (_, { dy }) => Math.abs(dy) > 5,
        // Prevent parent views from taking over the gesture
        onMoveShouldSetPanResponderCapture: (_, { dy }) => Math.abs(dy) > 5,
        // Don't allow gesture to be terminated by parent
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (evt) => {
            // Stop event propagation
            evt.stopPropagation && evt.stopPropagation();
            dragStartY.current = currentHeight.current;
        },
        onPanResponderMove: (_, { dy }) => {
            // Calculate new height (dragging up = negative dy = larger height)
            const newHeight = dragStartY.current - dy;
            const clampedHeight = Math.max(COLLAPSED_HEIGHT, Math.min(EXPANDED_HEIGHT, newHeight));
            drawerHeight.setValue(clampedHeight);

            // Update backdrop opacity proportionally
            const progress = (clampedHeight - COLLAPSED_HEIGHT) / (EXPANDED_HEIGHT - COLLAPSED_HEIGHT);
            backdropOpacity.setValue(progress * 0.5);
        },
        onPanResponderRelease: (_, { dy, vy }) => {
            // Determine final state based on velocity and position
            const shouldExpand = vy < -0.3 || (dy < -DRAG_THRESHOLD && vy >= -0.3);
            const shouldCollapse = vy > 0.3 || (dy > DRAG_THRESHOLD && vy <= 0.3);

            if (shouldExpand) {
                expandDrawer();
            } else if (shouldCollapse) {
                collapseDrawerAnimated();
            } else {
                // Snap to nearest state
                const midPoint = (COLLAPSED_HEIGHT + EXPANDED_HEIGHT) / 2;
                const currentVal = dragStartY.current - dy;
                if (currentVal > midPoint) {
                    expandDrawer();
                } else {
                    collapseDrawerAnimated();
                }
            }
        },
    }), [EXPANDED_HEIGHT, expandDrawer, collapseDrawerAnimated, drawerHeight, backdropOpacity]);

    // Handle external state changes
    useEffect(() => {
        if (isDrawerExpanded && !isExpanded) {
            expandDrawer();
        } else if (!isDrawerExpanded && isExpanded) {
            collapseDrawerAnimated();
        }
    }, [isDrawerExpanded]);

    // Handle screen selection - always collapse drawer after selection
    const handleScreenSelect = useCallback((screen) => {
        // First collapse the drawer
        collapseDrawerAnimated();

        // Then select the screen (this will also trigger collapse in context)
        selectScreen(screen);

        if (onNavigate) {
            onNavigate(screen.route);
        }
    }, [selectScreen, collapseDrawerAnimated, onNavigate]);

    // Handle tap on handle bar
    const handleHandleTap = useCallback(() => {
        if (currentHeight.current <= COLLAPSED_HEIGHT + 10) {
            expandDrawer();
        } else {
            collapseDrawerAnimated();
        }
    }, [expandDrawer, collapseDrawerAnimated]);

    // Render individual icon item with styling from screenshot 2
    const renderIconItem = useCallback((screen, index) => {
        const isActive = isScreenActive(screen.id);

        return (
            <TouchableOpacity
                key={screen.id}
                style={styles.iconItem}
                onPress={() => handleScreenSelect(screen)}
                activeOpacity={0.7}
            >
                <View
                    style={[
                        styles.iconContainer,
                        // Inactive: light gray background
                        { backgroundColor: Colors.background },
                        // Active: colored background matching the icon
                        isActive && {
                            backgroundColor: Colors.primary + '25',
                            borderWidth: 1.5,
                            borderColor: Colors.primary,
                        },
                    ]}
                >
                    <Icon
                        name={screen.icon}
                        size={ms(24)}
                        color={isActive ? Colors.primary : Colors.textMuted}
                    />
                </View>
                <AppText
                    size="xs"
                    weight={isActive ? 'bold' : 'medium'}
                    color={isActive ? Colors.primary : Colors.textMuted}
                    style={styles.iconLabel}
                    numberOfLines={1}
                >
                    {screen.title}
                </AppText>
                {isActive && (
                    <View style={[styles.activeIndicator, { backgroundColor: Colors.primary }]} />
                )}
            </TouchableOpacity>
        );
    }, [isScreenActive, handleScreenSelect]);

    // Render all rows
    const renderRows = useMemo(() => {
        const rows = [];
        for (let i = 0; i < orderedScreens.length; i += ICONS_PER_ROW) {
            const rowItems = orderedScreens.slice(i, i + ICONS_PER_ROW);

            rows.push(
                <View key={`row-${i}`} style={styles.row}>
                    {rowItems.map((screen, idx) => renderIconItem(screen, i + idx))}
                    {/* Fill empty spots in last row */}
                    {rowItems.length < ICONS_PER_ROW &&
                        Array(ICONS_PER_ROW - rowItems.length)
                            .fill(null)
                            .map((_, idx) => (
                                <View key={`empty-${idx}`} style={styles.iconItem} />
                            ))
                    }
                </View>
            );
        }
        return rows;
    }, [orderedScreens, renderIconItem]);

    return (
        <>
            {/* Backdrop - only visible when expanded */}
            {isExpanded && (
                <TouchableWithoutFeedback onPress={collapseDrawerAnimated}>
                    <Animated.View
                        style={[
                            styles.backdrop,
                            { opacity: backdropOpacity },
                        ]}
                    />
                </TouchableWithoutFeedback>
            )}

            {/* Drawer */}
            <Animated.View style={[styles.container, { height: drawerHeight }]}>
                {/* Handle Bar - Draggable and Tappable */}
                <View
                    {...panResponder.panHandlers}
                    style={styles.handleContainer}
                >
                    <TouchableOpacity
                        onPress={handleHandleTap}
                        style={styles.handleTouchable}
                        activeOpacity={0.8}
                    >
                        <View style={styles.handleBar} />
                        {/* <Icon
                            name={isExpanded ? 'chevron-down' : 'chevron-up'}
                            size={ms(16)}
                            color={Colors.textMuted}
                        /> */}
                    </TouchableOpacity>
                </View>

                {/* Icon Grid */}
                <View style={styles.gridContainer}>
                    {renderRows}
                </View>

                {/* Bottom safe area padding */}
                <View style={styles.bottomSafeArea} />
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.black,
        zIndex: 999,
    },
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.tabBarBackground,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        ...Shadow.lg,
        overflow: 'hidden',
        zIndex: 1000,
        // Add subtle top border for definition
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    handleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: vs(30), // Larger touch area for swiping
        backgroundColor: Colors.tabBarBackground,
        // Ensure gestures are captured here
        zIndex: 10,
    },
    handleTouchable: {
        alignItems: 'center',
        justifyContent: 'center',
        // paddingVertical: vs(2),
        width: wp(40),
    },
    handleBar: {
        width: wp(10),
        height: vs(4),
        backgroundColor: Colors.borderDark,
        borderRadius: BorderRadius.round,
    },
    gridContainer: {
        flex: 1,
        paddingHorizontal: wp(4), // Reduced horizontal padding
        paddingTop: vs(2), // Reduced top padding
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-evenly', // Even spacing between icons
        alignItems: 'flex-start',
        height: ROW_HEIGHT,
        paddingTop: vs(2), // Reduced top padding
    },
    iconItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 0, // Removed horizontal padding
        position: 'relative',
    },
    iconContainer: {
        width: ms(50),
        height: ms(50),
        borderRadius: ms(14),
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeIndicator: {
        width: ms(5),
        height: ms(5),
        borderRadius: ms(2.5),
        marginTop: vs(3),
    },
    iconLabel: {
        marginTop: vs(4), // Reduced margin
        textAlign: 'center',
        maxWidth: wp(20),
    },
    bottomSafeArea: {
        height: BOTTOM_SAFE_AREA,
        backgroundColor: Colors.tabBarBackground,
    },
});

export default BottomDrawerNavigation;
