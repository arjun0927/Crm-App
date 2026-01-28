/**
 * Utils Index - Export all utilities from a single file
 */

export {
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
} from './Responsive';

export {
    formatDate,
    formatCurrency,
    formatPhoneNumber,
    truncateText,
    capitalize,
    capitalizeWords,
    getInitials,
    isValidEmail,
    isValidPhone,
    generateId,
    debounce,
    deepClone,
    isEmpty,
    timeAgo,
    sleep,
} from './Helpers';

// Toast utilities
export {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    hideToast,
    showToast,
    default as toast,
} from './toast';

