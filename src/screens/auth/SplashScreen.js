/**
 * Splash Screen
 * Initial loading screen with auto-navigation based on auth state
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ms, vs } from '../../utils/Responsive';
import { useAuth } from '../../context';
import AppText from '../../components/AppText';
import { isOnboardingCompleted } from '../../storage';

const SplashScreen = ({ navigation }) => {
    const { isLoading, isAuthenticated } = useAuth();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Navigate when auth state is loaded
    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(async () => {
                const onboarded = await isOnboardingCompleted();
                if (!onboarded) {
                    // First launch — show onboarding
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Onboarding' }],
                    });
                } else if (isAuthenticated) {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'MainTabs' }],
                    });
                } else {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    });
                }
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [isLoading, isAuthenticated, navigation]);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                {/* Logo placeholder - replace with actual logo */}
                <View style={styles.logoPlaceholder}>
                    <AppText size="xxxl" weight="bold" color={Colors.white}>
                        CRM
                    </AppText>
                </View>
                <AppText
                    size="xxl"
                    weight="bold"
                    color={Colors.textPrimary}
                    style={styles.appName}
                >
                    CRM Pro
                </AppText>
                <AppText
                    size="sm"
                    color={Colors.textSecondary}
                    style={styles.tagline}
                >
                    Manage your leads efficiently
                </AppText>
            </Animated.View>

            <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                <AppText size="xs" color={Colors.textMuted}>
                    Powered by Your Company
                </AppText>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoPlaceholder: {
        width: ms(100),
        height: ms(100),
        borderRadius: ms(24),
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: vs(20),
    },
    appName: {
        letterSpacing: 1,
    },
    tagline: {
        marginTop: vs(8),
    },
    footer: {
        position: 'absolute',
        bottom: vs(40),
    },
});

export default SplashScreen;
