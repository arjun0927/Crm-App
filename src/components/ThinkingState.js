import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from './AppText';
import { Colors } from '../constants';
import { ms } from '../utils/Responsive';

const THINKING_STEPS = [
    'Processing request...',
    'Analyzing context...',
    'Accessing CRM data...',
    'Generating insights...'
];

const ThinkingState = () => {
    const [stepIndex, setStepIndex] = useState(0);
    const spinValue = new Animated.Value(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStepIndex((prev) => (prev + 1) % THINKING_STEPS.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true
            })
        ).start();
    }, []);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.loader, { transform: [{ rotate: spin }] }]}>
                <Icon name="loading" size={ms(16)} color={Colors.primary} />
            </Animated.View>
            <AppText size="xs" color={Colors.textSecondary} style={styles.text}>
                {THINKING_STEPS[stepIndex]}
            </AppText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: ms(6),
        paddingHorizontal: ms(4),
        minHeight: ms(28),
    },
    loader: {
        marginRight: ms(8),
    },
    text: {
        fontStyle: 'italic',
    }
});

export default ThinkingState;
