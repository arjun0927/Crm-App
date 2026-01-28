/**
 * AppButton - Reusable Button Component
 * Provides consistent button styling across the app
 */

import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/Colors';
import { BorderRadius, Spacing } from '../constants/Spacing';
import { ms, hs, vs } from '../utils/Responsive';
import AppText from './AppText';

const AppButton = ({
    title,
    onPress,
    variant = 'primary', // primary, secondary, outline, ghost, danger
    size = 'medium', // small, medium, large
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left', // left, right
    iconSize = 20,
    fullWidth = true,
    style,
    textStyle,
    ...props
}) => {
    // Get variant styles
    const getVariantStyles = () => {
        const variants = {
            primary: {
                backgroundColor: disabled ? Colors.primaryLight : Colors.primary,
                borderColor: 'transparent',
            },
            secondary: {
                backgroundColor: disabled ? Colors.secondaryLight : Colors.secondary,
                borderColor: 'transparent',
            },
            outline: {
                backgroundColor: 'transparent',
                borderColor: disabled ? Colors.border : Colors.primary,
                borderWidth: 1.5,
            },
            ghost: {
                backgroundColor: 'transparent',
                borderColor: 'transparent',
            },
            danger: {
                backgroundColor: disabled ? Colors.errorLight : Colors.error,
                borderColor: 'transparent',
            },
        };
        return variants[variant] || variants.primary;
    };

    // Get text color based on variant
    const getTextColor = () => {
        if (disabled) {
            if (variant === 'outline' || variant === 'ghost') {
                return Colors.textMuted;
            }
            return Colors.textInverse;
        }

        const textColors = {
            primary: Colors.textInverse,
            secondary: Colors.textInverse,
            outline: Colors.primary,
            ghost: Colors.primary,
            danger: Colors.textInverse,
        };
        return textColors[variant] || Colors.textInverse;
    };

    // Get size styles
    const getSizeStyles = () => {
        const sizes = {
            small: {
                paddingVertical: vs(8),
                paddingHorizontal: hs(16),
                fontSize: 'sm',
            },
            medium: {
                paddingVertical: vs(14),
                paddingHorizontal: hs(24),
                fontSize: 'base',
            },
            large: {
                paddingVertical: vs(18),
                paddingHorizontal: hs(32),
                fontSize: 'md',
            },
        };
        return sizes[size] || sizes.medium;
    };

    const variantStyle = getVariantStyles();
    const sizeStyle = getSizeStyles();
    const textColor = getTextColor();

    const renderIcon = () => {
        if (!icon) return null;
        return (
            <Icon
                name={icon}
                size={ms(iconSize)}
                color={textColor}
                style={[
                    iconPosition === 'left' ? styles.iconLeft : styles.iconRight,
                ]}
            />
        );
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                variantStyle,
                {
                    paddingVertical: sizeStyle.paddingVertical,
                    paddingHorizontal: sizeStyle.paddingHorizontal,
                },
                fullWidth && styles.fullWidth,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={textColor} size="small" />
            ) : (
                <View style={styles.content}>
                    {iconPosition === 'left' && renderIcon()}
                    <AppText
                        style={[styles.text, textStyle]}
                        size={sizeStyle.fontSize}
                        weight="semiBold"
                        color={textColor}
                    >
                        {title}
                    </AppText>
                    {iconPosition === 'right' && renderIcon()}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: BorderRadius.button,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    fullWidth: {
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        textAlign: 'center',
    },
    iconLeft: {
        marginRight: Spacing.sm,
    },
    iconRight: {
        marginLeft: Spacing.sm,
    },
});

export default AppButton;
