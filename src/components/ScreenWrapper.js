/**
 * ScreenWrapper - Reusable Screen Container Component
 * Provides consistent screen layout with safe area handling
 */

import React from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Spacing } from '../constants/Spacing';

const ScreenWrapper = ({
    children,
    style,
    containerStyle,
    backgroundColor = Colors.background,
    statusBarStyle = 'dark-content',
    statusBarBackgroundColor = Colors.background,
    withScrollView = false,
    scrollViewProps = {},
    withPadding = true,
    withSafeArea = true,
    withKeyboardAvoiding = true,
    topSafeArea = true,
    bottomSafeArea = true,
    refreshing = false,
    onRefresh,
    edges = ['top', 'bottom'],
}) => {
    const insets = useSafeAreaInsets();

    const paddingTop = topSafeArea && withSafeArea ? insets.top : 0;
    const paddingBottom = bottomSafeArea && withSafeArea ? insets.bottom : 0;

    const containerPadding = withPadding ? Spacing.screenPadding : 0;

    const content = (
        <>
            <StatusBar
                barStyle={statusBarStyle}
                backgroundColor={statusBarBackgroundColor}
                translucent={Platform.OS === 'android'}
            />
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor,
                        paddingTop,
                        paddingBottom,
                    },
                    containerStyle,
                ]}
            >
                {withScrollView ? (
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={[
                            styles.scrollContent,
                            { padding: containerPadding },
                            style,
                        ]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        refreshControl={
                            onRefresh ? (
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    colors={[Colors.primary]}
                                    tintColor={Colors.primary}
                                />
                            ) : undefined
                        }
                        {...scrollViewProps}
                    >
                        {children}
                    </ScrollView>
                ) : (
                    <View style={[styles.content, { padding: containerPadding }, style]}>
                        {children}
                    </View>
                )}
            </View>
        </>
    );

    if (withKeyboardAvoiding) {
        return (
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {content}
            </KeyboardAvoidingView>
        );
    }

    return content;
};

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
});

export default ScreenWrapper;
