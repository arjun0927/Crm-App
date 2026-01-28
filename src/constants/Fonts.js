/**
 * Global Font Constants for CRM App
 * Typography system for consistent text styling
 */

export const FontFamily = {
    // System fonts (works on both iOS and Android)
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
    light: 'System',
};

export const FontSize = {
    // Tiny
    tiny: 10,

    // Extra Small
    xs: 12,

    // Small
    sm: 14,

    // Base/Regular
    base: 16,

    // Medium
    md: 18,

    // Large
    lg: 20,

    // Extra Large
    xl: 24,

    // 2XL
    xxl: 28,

    // 3XL
    xxxl: 32,

    // Heading Sizes
    h1: 32,
    h2: 28,
    h3: 24,
    h4: 20,
    h5: 18,
    h6: 16,
};

export const FontWeight = {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
};

export const LineHeight = {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
};

export const LetterSpacing = {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
};

// Pre-defined text styles
export const TextStyles = {
    h1: {
        fontSize: FontSize.h1,
        fontWeight: FontWeight.bold,
        lineHeight: FontSize.h1 * LineHeight.tight,
    },
    h2: {
        fontSize: FontSize.h2,
        fontWeight: FontWeight.bold,
        lineHeight: FontSize.h2 * LineHeight.tight,
    },
    h3: {
        fontSize: FontSize.h3,
        fontWeight: FontWeight.semiBold,
        lineHeight: FontSize.h3 * LineHeight.tight,
    },
    h4: {
        fontSize: FontSize.h4,
        fontWeight: FontWeight.semiBold,
        lineHeight: FontSize.h4 * LineHeight.normal,
    },
    body: {
        fontSize: FontSize.base,
        fontWeight: FontWeight.regular,
        lineHeight: FontSize.base * LineHeight.normal,
    },
    bodySmall: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.regular,
        lineHeight: FontSize.sm * LineHeight.normal,
    },
    caption: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.regular,
        lineHeight: FontSize.xs * LineHeight.normal,
    },
    button: {
        fontSize: FontSize.base,
        fontWeight: FontWeight.semiBold,
        lineHeight: FontSize.base * LineHeight.tight,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        lineHeight: FontSize.sm * LineHeight.tight,
    },
};

export default {
    FontFamily,
    FontSize,
    FontWeight,
    LineHeight,
    LetterSpacing,
    TextStyles,
};
