/**
 * Loader - Reusable Loading Component
 * Provides consistent loading indicators across the app
 */

import React from 'react';
import {
    View,
    ActivityIndicator,
    StyleSheet,
    Modal,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { ms } from '../utils/Responsive';
import AppText from './AppText';

// Simple inline loader
export const Loader = ({
    size = 'large',
    color = Colors.primary,
    style,
}) => {
    return (
        <ActivityIndicator
            size={size}
            color={color}
            style={style}
        />
    );
};

// Centered loader that fills container
export const CenteredLoader = ({
    size = 'large',
    color = Colors.primary,
    text,
    style,
}) => {
    return (
        <View style={[styles.centeredContainer, style]}>
            <ActivityIndicator size={size} color={color} />
            {text && (
                <AppText
                    size="sm"
                    color={Colors.textSecondary}
                    style={styles.loaderText}
                >
                    {text}
                </AppText>
            )}
        </View>
    );
};

// Full screen loader with overlay
export const FullScreenLoader = ({
    visible = false,
    text = 'Loading...',
    color = Colors.primary,
    overlayColor = Colors.overlay,
}) => {
    if (!visible) return null;

    return (
        <View style={[styles.fullScreenContainer, { backgroundColor: overlayColor }]}>
            <View style={styles.loaderBox}>
                <ActivityIndicator size="large" color={color} />
                {text && (
                    <AppText
                        size="sm"
                        color={Colors.textSecondary}
                        style={styles.loaderText}
                    >
                        {text}
                    </AppText>
                )}
            </View>
        </View>
    );
};

// Modal loader that blocks interaction
export const ModalLoader = ({
    visible = false,
    text = 'Please wait...',
    color = Colors.primary,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <ActivityIndicator size="large" color={color} />
                    {text && (
                        <AppText
                            size="sm"
                            color={Colors.textSecondary}
                            style={styles.loaderText}
                        >
                            {text}
                        </AppText>
                    )}
                </View>
            </View>
        </Modal>
    );
};

// Skeleton loader placeholder
export const SkeletonLoader = ({
    width = '100%',
    height = 20,
    borderRadius = 8,
    style,
}) => {
    return (
        <View
            style={[
                styles.skeleton,
                {
                    width,
                    height: ms(height),
                    borderRadius: ms(borderRadius),
                },
                style,
            ]}
        />
    );
};

// Skeleton card loader
export const SkeletonCard = ({ style }) => {
    return (
        <View style={[styles.skeletonCard, style]}>
            <View style={styles.skeletonCardHeader}>
                <SkeletonLoader width={50} height={50} borderRadius={25} />
                <View style={styles.skeletonCardHeaderText}>
                    <SkeletonLoader width="60%" height={16} />
                    <SkeletonLoader width="40%" height={12} style={styles.skeletonMarginTop} />
                </View>
            </View>
            <SkeletonLoader width="100%" height={14} style={styles.skeletonMarginTop} />
            <SkeletonLoader width="80%" height={14} style={styles.skeletonMarginTop} />
        </View>
    );
};

const styles = StyleSheet.create({
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: ms(12),
    },
    fullScreenContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    loaderBox: {
        backgroundColor: Colors.white,
        padding: ms(24),
        borderRadius: ms(16),
        alignItems: 'center',
        minWidth: ms(120),
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.overlay,
    },
    modalContent: {
        backgroundColor: Colors.white,
        padding: ms(24),
        borderRadius: ms(16),
        alignItems: 'center',
        minWidth: ms(150),
    },
    skeleton: {
        backgroundColor: Colors.borderLight,
        opacity: 0.7,
    },
    skeletonCard: {
        backgroundColor: Colors.white,
        padding: ms(16),
        borderRadius: ms(12),
        marginBottom: ms(12),
    },
    skeletonCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    skeletonCardHeaderText: {
        flex: 1,
        marginLeft: ms(12),
    },
    skeletonMarginTop: {
        marginTop: ms(8),
    },
});

export default Loader;
