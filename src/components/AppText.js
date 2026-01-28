/**
 * AppText - Reusable Text Component
 * Provides consistent typography across the app
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { FontSize, FontWeight } from '../constants/Fonts';
import { ms } from '../utils/Responsive';

const AppText = ({
    children,
    style,
    size = 'base',
    weight = 'regular',
    color,
    align = 'left',
    numberOfLines,
    onPress,
    selectable = false,
    ...props
}) => {
    // Get font size
    const getFontSize = () => {
        if (typeof size === 'number') return ms(size);
        const sizes = {
            tiny: FontSize.tiny,
            xs: FontSize.xs,
            sm: FontSize.sm,
            base: FontSize.base,
            md: FontSize.md,
            lg: FontSize.lg,
            xl: FontSize.xl,
            xxl: FontSize.xxl,
            xxxl: FontSize.xxxl,
            h1: FontSize.h1,
            h2: FontSize.h2,
            h3: FontSize.h3,
            h4: FontSize.h4,
            h5: FontSize.h5,
            h6: FontSize.h6,
        };
        return ms(sizes[size] || FontSize.base);
    };

    // Get font weight
    const getFontWeight = () => {
        const weights = {
            light: FontWeight.light,
            regular: FontWeight.regular,
            medium: FontWeight.medium,
            semiBold: FontWeight.semiBold,
            bold: FontWeight.bold,
            extraBold: FontWeight.extraBold,
        };
        return weights[weight] || FontWeight.regular;
    };

    const textStyles = [
        styles.text,
        {
            fontSize: getFontSize(),
            fontWeight: getFontWeight(),
            color: color || Colors.textPrimary,
            textAlign: align,
        },
        style,
    ];

    return (
        <Text
            style={textStyles}
            numberOfLines={numberOfLines}
            onPress={onPress}
            selectable={selectable}
            {...props}
        >
            {children}
        </Text>
    );
};

// Pre-styled variants
export const Heading1 = (props) => (
    <AppText size="h1" weight="bold" {...props} />
);

export const Heading2 = (props) => (
    <AppText size="h2" weight="bold" {...props} />
);

export const Heading3 = (props) => (
    <AppText size="h3" weight="semiBold" {...props} />
);

export const Heading4 = (props) => (
    <AppText size="h4" weight="semiBold" {...props} />
);

export const BodyText = (props) => (
    <AppText size="base" weight="regular" {...props} />
);

export const Caption = (props) => (
    <AppText size="xs" weight="regular" color={Colors.textSecondary} {...props} />
);

export const Label = (props) => (
    <AppText size="sm" weight="medium" {...props} />
);

const styles = StyleSheet.create({
    text: {
        includeFontPadding: false,
    },
});

export default AppText;
