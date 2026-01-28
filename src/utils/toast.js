/**
 * Toast Utility
 * Helper functions for showing toast notifications
 */

import Toast from 'react-native-toast-message';

/**
 * Default toast options
 */
const defaultOptions = {
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 50,
    position: 'top',
};

/**
 * Show success toast
 * @param {string} title - Toast title
 * @param {string} message - Toast message (optional)
 * @param {object} options - Additional options (optional)
 */
export const showSuccess = (title, message = '', options = {}) => {
    Toast.show({
        type: 'success',
        text1: title,
        text2: message,
        ...defaultOptions,
        ...options,
    });
};

/**
 * Show error toast
 * @param {string} title - Toast title
 * @param {string} message - Toast message (optional)
 * @param {object} options - Additional options (optional)
 */
export const showError = (title, message = '', options = {}) => {
    Toast.show({
        type: 'error',
        text1: title,
        text2: message,
        visibilityTime: 4000, // Errors stay longer
        ...defaultOptions,
        ...options,
    });
};

/**
 * Show info toast
 * @param {string} title - Toast title
 * @param {string} message - Toast message (optional)
 * @param {object} options - Additional options (optional)
 */
export const showInfo = (title, message = '', options = {}) => {
    Toast.show({
        type: 'info',
        text1: title,
        text2: message,
        ...defaultOptions,
        ...options,
    });
};

/**
 * Show warning toast
 * @param {string} title - Toast title
 * @param {string} message - Toast message (optional)
 * @param {object} options - Additional options (optional)
 */
export const showWarning = (title, message = '', options = {}) => {
    Toast.show({
        type: 'warning',
        text1: title,
        text2: message,
        ...defaultOptions,
        ...options,
    });
};

/**
 * Hide current toast
 */
export const hideToast = () => {
    Toast.hide();
};

/**
 * Show toast with custom type
 * @param {string} type - Toast type (success, error, info, warning)
 * @param {string} title - Toast title
 * @param {string} message - Toast message (optional)
 * @param {object} options - Additional options (optional)
 */
export const showToast = (type, title, message = '', options = {}) => {
    Toast.show({
        type,
        text1: title,
        text2: message,
        ...defaultOptions,
        ...options,
    });
};

export default {
    success: showSuccess,
    error: showError,
    info: showInfo,
    warning: showWarning,
    hide: hideToast,
    show: showToast,
};
