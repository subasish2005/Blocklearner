import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Handle token refresh or logout
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    REFRESH_TOKEN: '/api/v1/auth/refresh-token',
    GOOGLE_AUTH: '/api/v1/auth/google',
    GOOGLE_AUTH_CALLBACK: '/api/v1/auth/google/callback',
    GITHUB_AUTH: '/api/v1/auth/github',
    GITHUB_AUTH_CALLBACK: '/api/v1/auth/github/callback',
    VERIFY_EMAIL: '/api/v1/auth/verify-email', // + /:token

    // User endpoints
    GET_PROFILE: '/api/v1/users/me',
    UPDATE_ME: '/api/v1/users/update-me',
    UPDATE_BIO: '/api/v1/users/profile/bio',
    UPDATE_SOCIAL_LINKS: '/api/v1/users/profile/social-links',
    UPDATE_SETTINGS: '/api/v1/users/settings',
    UPDATE_PASSWORD: '/api/v1/users/update-password',
    DELETE_ME: '/api/v1/users/delete-me',
    UPLOAD_AVATAR: '/api/v1/users/upload-avatar',
    GET_USER_ACHIEVEMENTS: '/api/v1/users/achievements', // + /:userId
    GET_ACHIEVEMENT_PROGRESS: '/api/v1/users/achievements/progress',
    GET_BADGES: '/api/v1/users/badges',
    GET_POINTS_HISTORY: '/api/v1/users/points-history',
    GET_USER_LEADERBOARD: '/api/v1/users/leaderboard',
    GET_ACTIVITY_LOG: '/api/v1/users/activity-log',

    // Notification endpoints
    GET_NOTIFICATIONS: '/api/v1/notifications/my',
    GET_UNREAD_COUNT: '/api/v1/notifications/unread-count',
    GET_NOTIFICATION_PREFERENCES: '/api/v1/notifications/preferences',
    UPDATE_NOTIFICATION_PREFERENCES: '/api/v1/notifications/preferences',
    MARK_NOTIFICATION_READ: '/api/v1/notifications', // + /:id/read
    MARK_ALL_READ: '/api/v1/notifications/mark-all-read',
    DELETE_NOTIFICATION: '/api/v1/notifications', // + /:id
    CLEAR_OLD_NOTIFICATIONS: '/api/v1/notifications/clear-old',
    CLEAR_NOTIFICATIONS: '/api/v1/notifications/clear',

    // Social endpoints
    GET_USERS: '/api/v1/users',
    SEARCH_USERS: '/api/v1/users/search',
    GET_FRIENDS: '/api/v1/friends',
    GET_FRIEND_REQUESTS: '/api/v1/friends/requests',
    SEND_FRIEND_REQUEST: '/api/v1/friends/requests', // + /:userId
    RESPOND_TO_REQUEST: '/api/v1/friends/requests', // + /:userId/respond
    CANCEL_FRIEND_REQUEST: '/api/v1/friends/requests', // + /:userId
    REMOVE_FRIEND: '/api/v1/friends', // + /:userId
    GET_MUTUAL_FRIENDS: '/api/v1/friends/mutual', // + /:userId
    BLOCK_USER: '/api/v1/friends/block', // + /:userId
    UNBLOCK_USER: '/api/v1/friends/unblock', // + /:userId
    GET_FRIEND_SUGGESTIONS: '/api/v1/friends/suggestions',
    GET_BLOCKED_USERS: '/api/v1/friends/blocked',
    GET_SENT_FRIEND_REQUESTS: '/api/v1/friends/requests/sent',

    // Gamified Task System endpoints
    GAMIFIED_TASKS: {
        // Basic Task Operations
        GET_ALL: '/api/v1/tasks',
        GET_BY_ID: '/api/v1/tasks', // + /:taskId
        
        // Task Categories and Discovery
        GET_CATEGORIES: '/api/v1/tasks/categories',
        GET_BY_CATEGORY: '/api/v1/tasks/category', // + /:category
        GET_AVAILABLE: '/api/v1/tasks/available',
        
        // Progress and Rewards
        GET_ALL_PROGRESS: '/api/v1/tasks/progress',
        GET_TASK_PROGRESS: '/api/v1/tasks/progress', // + /:taskId
        GET_REWARDS: '/api/v1/tasks/rewards',
        GET_UNCLAIMED_REWARDS: '/api/v1/tasks/rewards/unclaimed',
        
        // Task Interaction
        START_TASK: '/api/v1/tasks', // + /:taskId/start
        SUBMIT_PROOF: '/api/v1/tasks', // + /:taskId/submit
        CLAIM_REWARD: '/api/v1/tasks', // + /:taskId/claim-reward
        
        // Quiz Related
        GET_QUIZ_RESULTS: '/api/v1/tasks/quiz', // + /:taskId/results
        SUBMIT_QUIZ: '/api/v1/tasks/quiz', // + /:taskId/submit
        
        // Statistics
        GET_USER_STATS: '/api/v1/tasks/stats', // + /:userId
        GET_GLOBAL_STATS: '/api/v1/tasks/stats/global',
        GET_LEADERBOARD: '/api/v1/tasks/leaderboard',
        
        // Admin Operations
        ADMIN: {
            CREATE_TASK: '/api/v1/tasks',
            UPDATE_TASK: '/api/v1/tasks', // + /:taskId
            DELETE_TASK: '/api/v1/tasks', // + /:taskId
            GET_PENDING_VERIFICATIONS: '/api/v1/tasks/admin/pending-verifications',
            VERIFY_SUBMISSION: '/api/v1/tasks/admin/verify', // + /:taskId/:userId
            GET_TASK_ANALYTICS: '/api/v1/tasks/admin/analytics',
            UPDATE_TASK_CONFIG: '/api/v1/tasks/admin/config' // + /:taskId
        }
    },

    // Admin System endpoints
    ADMIN: {
        // User Management
        USERS: {
            GET_ALL: '/api/v1/users',
            CREATE: '/api/v1/users',
            GET_BY_ID: '/api/v1/users', // + /:id
            UPDATE: '/api/v1/users', // + /:id
            DELETE: '/api/v1/users', // + /:id
            UPDATE_STATUS: '/api/v1/users', // + /:id/status
            UPDATE_ROLE: '/api/v1/users', // + /:id/role
        },
        
        // Statistics and Analytics
        STATS: {
            GET_USER_OVERVIEW: '/api/v1/users/stats/overview',
            GET_USER_ACTIVITY: '/api/v1/users/stats/activity',
            GET_USER_GROWTH: '/api/v1/users/stats/growth'
        }
    }
};

export default api;
