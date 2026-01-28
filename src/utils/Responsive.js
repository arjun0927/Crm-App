/**
 * Responsive Utilities for CRM App
 * Provides responsive sizing based on device dimensions
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 14 Pro)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

// Check if device is small
export const isSmallDevice = SCREEN_WIDTH < 375;

// Check if device is tablet
export const isTablet = SCREEN_WIDTH >= 768;

// Get device dimensions
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

/**
 * Horizontal scaling based on screen width
 * @param {number} size - Size to scale
 * @returns {number} Scaled size
 */
export const wp = (widthPercent) => {
    const elemWidth = typeof widthPercent === 'number'
        ? widthPercent
        : parseFloat(widthPercent);
    return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * elemWidth) / 100);
};

/**
 * Vertical scaling based on screen height
 * @param {number} size - Size to scale
 * @returns {number} Scaled size
 */
export const hp = (heightPercent) => {
    const elemHeight = typeof heightPercent === 'number'
        ? heightPercent
        : parseFloat(heightPercent);
    return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * elemHeight) / 100);
};

/**
 * Horizontal scale based on base design width
 * @param {number} size - Size in pixels from design
 * @returns {number} Scaled size
 */
export const hs = (size) => {
    const scale = SCREEN_WIDTH / BASE_WIDTH;
    return Math.round(size * scale);
};

/**
 * Vertical scale based on base design height
 * @param {number} size - Size in pixels from design
 * @returns {number} Scaled size
 */
export const vs = (size) => {
    const scale = SCREEN_HEIGHT / BASE_HEIGHT;
    return Math.round(size * scale);
};

/**
 * Moderate scale - for text and elements that shouldn't scale too much
 * @param {number} size - Size in pixels
 * @param {number} factor - Scaling factor (default: 0.5)
 * @returns {number} Scaled size
 */
export const ms = (size, factor = 0.5) => {
    const scale = SCREEN_WIDTH / BASE_WIDTH;
    return Math.round(size + (size * scale - size) * factor);
};

/**
 * Font scale with pixel ratio consideration
 * @param {number} size - Font size
 * @returns {number} Scaled font size
 */
export const fs = (size) => {
    const scale = SCREEN_WIDTH / BASE_WIDTH;
    const newSize = size * scale;

    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize));
    }
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

/**
 * Normalize size across different screen densities
 * @param {number} size - Size to normalize
 * @returns {number} Normalized size
 */
export const normalize = (size) => {
    const scale = SCREEN_WIDTH / BASE_WIDTH;
    const newSize = size * scale;

    if (isTablet) {
        return Math.round(newSize * 0.85);
    }

    return Math.round(newSize);
};

/**
 * Get responsive value based on screen size
 * @param {any} small - Value for small screens
 * @param {any} medium - Value for medium screens (optional)
 * @param {any} large - Value for large screens (optional)
 * @returns {any} Appropriate value
 */
export const responsive = (small, medium, large) => {
    if (isTablet) return large || medium || small;
    if (isSmallDevice) return small;
    return medium || small;
};

/**
 * Get platform-specific value
 * @param {any} ios - Value for iOS
 * @param {any} android - Value for Android
 * @returns {any} Platform-specific value
 */
export const platformSelect = (ios, android) => {
    return Platform.select({ ios, android }) || ios;
};

// Export device info
export const deviceInfo = {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    isSmall: isSmallDevice,
    isTablet: isTablet,
    platform: Platform.OS,
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
};

export default {
    wp,
    hp,
    hs,
    vs,
    ms,
    fs,
    normalize,
    responsive,
    platformSelect,
    screenWidth,
    screenHeight,
    isSmallDevice,
    isTablet,
    deviceInfo,
};
