/**
 * Global Spacing Constants for CRM App
 * Consistent spacing system across the application
 */

export const Spacing = {
    // Base spacing unit: 4px
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
    xxxxl: 48,

    // Semantic spacing
    screenPadding: 16,
    cardPadding: 16,
    sectionGap: 24,
    itemGap: 12,
    inputPadding: 14,

    // Specific use cases
    buttonPaddingVertical: 14,
    buttonPaddingHorizontal: 24,
    iconMargin: 8,
    listItemPadding: 16,
    headerHeight: 56,
    tabBarHeight: 60,
    bottomSafeArea: 34,
};

export const BorderRadius = {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 9999,

    // Specific use cases
    button: 12,
    card: 16,
    input: 12,
    modal: 20,
    avatar: 9999,
    badge: 8,
};

export const Shadow = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 16,
    },
};

export const ZIndex = {
    base: 0,
    dropdown: 10,
    sticky: 20,
    overlay: 30,
    modal: 40,
    popover: 50,
    toast: 60,
};

export default {
    Spacing,
    BorderRadius,
    Shadow,
    ZIndex,
};
