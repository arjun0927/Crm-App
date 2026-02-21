/**
 * Bottom Sheet Navigation Component
 * Displays secondary screens in a bottom sheet with smooth animations
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated,
    Dimensions,
    ScrollView,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { Spacing, BorderRadius, Shadow } from '../constants/Spacing';
import { ms, vs, wp, screenHeight } from '../utils/Responsive';
import { AppText } from '../components';
import { useTabNavigation } from '../context/TabNavigationContext';

const SHEET_HEIGHT = screenHeight * 0.55;

const BottomSheetNavigation = ({ onNavigate }) => {
    const {
        isBottomSheetVisible,
        closeBottomSheet,
        selectScreen,
        bottomSheetScreens,
        isScreenActive,
    } = useTabNavigation();

    const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isBottomSheetVisible) {
            // Animate in
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    damping: 20,
                    stiffness: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Animate out
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: SHEET_HEIGHT,
                    damping: 20,
                    stiffness: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isBottomSheetVisible, translateY, backdropOpacity]);

    const handleScreenSelect = (screen) => {
        selectScreen(screen);
        if (onNavigate) {
            onNavigate(screen.route);
        }
    };

    if (!isBottomSheetVisible) {
        return null;
    }

    return (
        <View style={styles.container} pointerEvents="box-none">
            {/* Backdrop */}
            <TouchableWithoutFeedback onPress={closeBottomSheet}>
                <Animated.View
                    style={[
                        styles.backdrop,
                        { opacity: backdropOpacity },
                    ]}
                />
            </TouchableWithoutFeedback>

            {/* Bottom Sheet */}
            <Animated.View
                style={[
                    styles.sheet,
                    { transform: [{ translateY }] },
                ]}
            >
                {/* Handle Bar */}
                <View style={styles.handleContainer}>
                    <View style={styles.handleBar} />
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <AppText size="lg" weight="bold" color={Colors.textPrimary}>
                        Quick Access
                    </AppText>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={closeBottomSheet}
                    >
                        <Icon name="close" size={ms(22)} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Grid of Screens */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.gridContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {bottomSheetScreens.map((screen) => {
                        const isActive = isScreenActive(screen.id);
                        return (
                            <TouchableOpacity
                                key={screen.id}
                                style={[
                                    styles.gridItem,
                                    isActive && styles.gridItemActive,
                                ]}
                                onPress={() => handleScreenSelect(screen)}
                                activeOpacity={0.7}
                            >
                                <View
                                    style={[
                                        styles.iconContainer,
                                        { backgroundColor: screen.iconColor + '15' },
                                        isActive && { backgroundColor: screen.iconColor + '30' },
                                    ]}
                                >
                                    <Icon
                                        name={screen.icon}
                                        size={ms(28)}
                                        color={screen.iconColor}
                                    />
                                </View>
                                <AppText
                                    size="sm"
                                    weight={isActive ? 'bold' : 'semiBold'}
                                    color={isActive ? Colors.primary : Colors.textPrimary}
                                    style={styles.screenTitle}
                                    numberOfLines={1}
                                >
                                    {screen.title}
                                </AppText>
                                <AppText
                                    size="xs"
                                    color={Colors.textMuted}
                                    style={styles.screenSubtitle}
                                    numberOfLines={2}
                                >
                                    {screen.subtitle}
                                </AppText>
                                {isActive && (
                                    <View style={styles.activeIndicator}>
                                        <Icon
                                            name="checkmark-circle"
                                            size={ms(16)}
                                            color={Colors.primary}
                                        />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1000,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.overlay,
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: SHEET_HEIGHT,
        backgroundColor: Colors.white,
        borderTopLeftRadius: BorderRadius.xxl,
        borderTopRightRadius: BorderRadius.xxl,
        ...Shadow.xl,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: vs(12),
    },
    handleBar: {
        width: wp(12),
        height: vs(4),
        backgroundColor: Colors.borderDark,
        borderRadius: BorderRadius.round,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingBottom: vs(12),
    },
    closeButton: {
        width: ms(36),
        height: ms(36),
        borderRadius: BorderRadius.round,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: wp(3),
        paddingBottom: vs(30),
    },
    gridItem: {
        width: (Dimensions.get('window').width - wp(6)) / 3 - ms(8),
        margin: ms(4),
        padding: Spacing.md,
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    gridItemActive: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryBackground,
    },
    iconContainer: {
        width: ms(56),
        height: ms(56),
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: vs(8),
    },
    screenTitle: {
        marginTop: vs(4),
        textAlign: 'center',
    },
    screenSubtitle: {
        marginTop: vs(2),
        textAlign: 'center',
    },
    activeIndicator: {
        position: 'absolute',
        top: ms(8),
        right: ms(8),
    },
});

export default BottomSheetNavigation;
