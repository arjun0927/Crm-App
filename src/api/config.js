/**
 * API Configuration
 * Contains base URLs and API endpoints
 */

// Base URL for the API
// export const API_BASE_URL = 'https://crm.ceoitbox.com/api';
export const API_BASE_URL = 'https://gsvmdl68-3001.inc1.devtunnels.ms/api';

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        GOOGLE_LOGIN: '/auth/google',
        LOGOUT: '/auth/logout',
        REFRESH_TOKEN: '/auth/refresh',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        VERIFY_EMAIL: '/auth/verify-email',
        ME: '/auth/me',
    },

    // Users
    USERS: {
        PROFILE: '/users/profile',
        UPDATE_PROFILE: '/users/profile',
        CHANGE_PASSWORD: '/users/change-password',
        UPLOAD_AVATAR: '/users/avatar',
    },

    // Leads
    LEADS: {
        LIST: '/leads',
        CREATE: '/leads',
        DETAIL: (id) => `/leads/${id}`,
        UPDATE: (id) => `/leads/${id}`,
        DELETE: (id) => `/leads/${id}`,
        SEARCH: '/leads/search',
        STATS: '/leads/stats',
        EXPORT: '/leads/export',
        IMPORT: '/leads/import',
    },

    // Tasks
    TASKS: {
        LIST: '/tasks',
        CREATE: '/tasks',
        DETAIL: (id) => `/tasks/${id}`,
        UPDATE: (id) => `/tasks/${id}`,
        DELETE: (id) => `/tasks/${id}`,
        TOGGLE_STATUS: (id) => `/tasks/${id}/toggle`,
        STATS: '/tasks/stats',
        TODAY: '/tasks/today',
        OVERDUE: '/tasks/overdue',
    },

    // Dashboard
    DASHBOARD: {
        STATS: '/dashboard/stats',
        RECENT_LEADS: '/dashboard/recent-leads',
        RECENT_TASKS: '/dashboard/recent-tasks',
        CHARTS: '/dashboard/charts',
    },

    // Notifications
    NOTIFICATIONS: {
        LIST: '/notifications',
        MARK_READ: (id) => `/notifications/${id}/read`,
        MARK_ALL_READ: '/notifications/read-all',
        DELETE: (id) => `/notifications/${id}`,
    },

    // Settings
    SETTINGS: {
        GET: '/settings',
        UPDATE: '/settings',
    },

    // Companies
    COMPANIES: {
        LIST: '/companies',
        CREATE: '/companies',
        DETAIL: (id) => `/companies/${id}`,
        UPDATE: (id) => `/companies/${id}`,
        DELETE: (id) => `/companies/${id}`,
    },
};

// Request timeout (in milliseconds)
export const API_TIMEOUT = 30000;

// Response status codes
export const STATUS_CODES = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 422,
    SERVER_ERROR: 500,
};

export default {
    API_BASE_URL,
    API_ENDPOINTS,
    API_TIMEOUT,
    STATUS_CODES,
};
