import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api.config';

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Enable sending cookies
});

// Add request interceptor for auth token and headers
axiosInstance.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add frontend URL for verification
        config.headers['X-Frontend-URL'] = window.location.origin;
        
        // Log the request configuration
        console.log('Request Config:', {
            url: config.url,
            method: config.method,
            headers: {
                ...config.headers,
                Authorization: config.headers.Authorization ? '[REDACTED]' : undefined
            },
            data: config.data ? {
                ...config.data,
                password: config.data.password ? '[REDACTED]' : undefined,
                passwordConfirm: config.data.passwordConfirm ? '[REDACTED]' : undefined
            } : undefined
        });

        return config;
    },
    (error) => {
        console.error('Request Interceptor Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
    (response) => {
        // Log successful response
        console.log('API Response:', {
            url: response.config.url,
            method: response.config.method,
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        // Log error response
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

const apiService = {
    // Auth endpoints
    login: async (credentials) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                if (response.data.refreshToken) {
                    localStorage.setItem('refreshToken', response.data.refreshToken);
                }
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Login failed' };
        }
    },

    async register(userData) {
        try {
            // Create the registration URL with the frontend origin
            const frontendOrigin = window.location.origin;
            console.log('Frontend Origin:', frontendOrigin);

            // Prepare registration data
            const registrationData = {
                ...userData,
                frontendUrl: frontendOrigin // Add frontend URL to the request body
            };

            console.log('Sending registration request to:', `${API_BASE_URL}${API_ENDPOINTS.REGISTER}`);

            const response = await axiosInstance.post(API_ENDPOINTS.REGISTER, registrationData, {
                headers: {
                    'X-Frontend-URL': frontendOrigin,
                    'Origin': frontendOrigin
                }
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            return response.data;
        } catch (error) {
            console.error('Registration Error Details:', {
                message: error.message,
                response: {
                    status: error.response?.status,
                    data: error.response?.data
                },
                request: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            });
            throw error;
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post(API_ENDPOINTS.LOGOUT);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
        }
    },

    forgotPassword: async (email) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
            return response.data;
        } catch (error) {
            console.error('Forgot password error:', error.response?.data || error);
            throw error.response?.data || { message: 'Failed to send reset email' };
        }
    },

    resetPassword: async (token, passwordData) => {
        try {
            console.log('Resetting password with token:', token);
            const response = await axiosInstance.patch(
                `/api/v1/auth/reset-password/${token}`,
                passwordData
            );
            return response.data;
        } catch (error) {
            console.error('Reset password error:', error.response?.data || error);
            throw error.response?.data || { message: 'Failed to reset password' };
        }
    },

    // User endpoints
    getUserProfile: async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.GET_PROFILE);
            if (!response.data || !response.data.status === 'success') {
                throw new Error('Invalid response format');
            }
            return response.data;
        } catch (error) {
            console.error('Error in getUserProfile:', error);
            throw error.response?.data || { message: 'Failed to fetch user profile' };
        }
    },

    uploadAvatar(formData) {
        return axiosInstance.post(API_ENDPOINTS.UPLOAD_AVATAR, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    updateUserProfile: async (profileData) => {
        try {
            // Update basic info
            if (profileData.name || profileData.email) {
                await axiosInstance.patch(API_ENDPOINTS.UPDATE_ME, {
                    name: profileData.name,
                    email: profileData.email
                });
            }

            // Update bio
            if (profileData.bio !== undefined) {
                const bioResponse = await axiosInstance.patch(API_ENDPOINTS.UPDATE_BIO, {
                    bio: profileData.bio
                });
                
                if (!bioResponse.data.status === 'success') {
                    throw new Error(bioResponse.data.message || 'Failed to update bio');
                }
            }

            // Update social links
            if (profileData.socialLinks) {
                await axiosInstance.patch(API_ENDPOINTS.UPDATE_SOCIAL_LINKS, {
                    socialLinks: profileData.socialLinks
                });
            }

            // Update settings/preferences
            if (profileData.preferences) {
                await axiosInstance.patch(API_ENDPOINTS.UPDATE_SETTINGS, {
                    emailNotifications: profileData.preferences.emailNotifications,
                    pushNotifications: profileData.preferences.pushNotifications
                });
            }

            // Get updated user data
            const response = await axiosInstance.get(API_ENDPOINTS.GET_PROFILE);
            return {
                status: 'success',
                message: 'Profile updated successfully',
                data: response.data
            };
        } catch (error) {
            console.error('Profile Update Error:', error.response?.data || error);
            throw {
                status: error.response?.status || 500,
                message: error.response?.data?.message || error.message || 'Failed to update profile',
                errors: error.response?.data?.errors || []
            };
        }
    },

    updatePassword: async (passwordData) => {
        try {
            const response = await axiosInstance.patch(API_ENDPOINTS.UPDATE_PASSWORD, passwordData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update password' };
        }
    },

    deleteMe: async () => {
        try {
            const response = await axiosInstance.delete(`${API_ENDPOINTS.DELETE_ME}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete account' };
        }
    },

    // Task endpoints
    getTasks: async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.GET_TASKS);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch tasks' };
        }
    },



    // Notification endpoints
    getNotifications: async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.GET_NOTIFICATIONS);
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error.response?.data || { message: 'Failed to fetch notifications' };
        }
    },

    getNotificationPreferences: async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.GET_NOTIFICATION_PREFERENCES);
            return response.data;
        } catch (error) {
            console.error('Error fetching notification preferences:', error);
            throw error.response?.data || { message: 'Failed to fetch notification preferences' };
        }
    },

    updateNotificationPreferences: async (preferences) => {
        try {
            const response = await axiosInstance.patch(API_ENDPOINTS.UPDATE_NOTIFICATION_PREFERENCES, preferences);
            return response.data;
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            throw error.response?.data || { message: 'Failed to update notification preferences' };
        }
    },

    markNotificationRead: async (notificationId) => {
        try {
            const response = await axiosInstance.patch(
                `${API_ENDPOINTS.MARK_NOTIFICATION_READ}/${notificationId}/read`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to mark notification as read' };
        }
    },

    clearNotifications: async () => {
        try {
            const response = await axiosInstance.delete(API_ENDPOINTS.CLEAR_NOTIFICATIONS);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to clear notifications' };
        }
    },

    deleteNotification: async (notificationId) => {
        try {
            const response = await axiosInstance.delete(`${API_ENDPOINTS.DELETE_NOTIFICATION}/${notificationId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error.response?.data || { message: 'Failed to delete notification' };
        }
    },

    // Social endpoints
    getUsers(query = '') {
        return axiosInstance.get(`${API_ENDPOINTS.GET_USERS}?query=${query}`);
    },

    searchUsers(query) {
        return axiosInstance.get(`${API_ENDPOINTS.SEARCH_USERS}?query=${query}`);
    },

    getFriendRequests() {
        return axiosInstance.get(API_ENDPOINTS.GET_FRIEND_REQUESTS);
    },

    getFriends() {
        return axiosInstance.get(API_ENDPOINTS.GET_FRIENDS);
    },


 
    sendFriendRequest(userId) {
        return axiosInstance.post(`${API_ENDPOINTS.SEND_FRIEND_REQUEST}/${userId}`);
    },

    respondToFriendRequest(userId, action) {
        if (!userId) {
            throw new Error('User ID is required to respond to friend request');
        }
        return axiosInstance.patch(`/api/v1/friends/requests/${userId}/respond`, { action })
            .then(response => {
                console.log('Friend request response:', response);
                return response;
            })
            .catch(error => {
                console.error('Friend request error:', error);
                throw error;
            });
    },

    cancelFriendRequest(userId) {
        return axiosInstance.delete(`${API_ENDPOINTS.CANCEL_FRIEND_REQUEST}/${userId}`);
    },

    removeFriend(userId) {
        return axiosInstance.delete(`${API_ENDPOINTS.REMOVE_FRIEND}/${userId}`);
    },

    getMutualFriends(userId) {
        return axiosInstance.get(`${API_ENDPOINTS.GET_MUTUAL_FRIENDS}/${userId}`);
    },

    blockUser(userId) {
        return axiosInstance.post(`${API_ENDPOINTS.BLOCK_USER}/${userId}`);
    },

    unblockUser(userId) {
        return axiosInstance.post(`${API_ENDPOINTS.UNBLOCK_USER}/${userId}`);
    },




    // Achievement endpoints
    getUserAchievements(userId) {
        return axiosInstance.get(`${API_ENDPOINTS.GET_USER_ACHIEVEMENTS}/${userId}`);
    },




    // Dashboard endpoints
    getDashboardProgress: async () => {
        try {
            const response = await axiosInstance.get('/api/v1/dashboard/progress');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard progress:', error);
            throw error.response?.data || { message: 'Failed to fetch dashboard progress' };
        }
    },

    getDashboardDetailedStats: async () => {
        try {
            const response = await axiosInstance.get('/api/v1/dashboard/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard detailed stats:', error);
            throw error.response?.data || { message: 'Failed to fetch dashboard statistics' };
        }
    },

    // User Achievement endpoints
    getAchievementProgress: async () => {
        try {
            const response = await axiosInstance.get('/api/v1/users/achievements/progress');
            return response.data;
        } catch (error) {
            console.error('Error fetching achievement progress:', error);
            throw error.response?.data || { message: 'Failed to fetch achievement progress' };
        }
    },

    // Activity Log endpoints
    getActivityLog: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/api/v1/users/activity-log', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching activity log:', error);
            throw error.response?.data || { message: 'Failed to fetch activity log' };
        }
    },

    // User Preferences endpoints
    updateUserPreferences: async (preferences) => {
        try {
            const response = await axiosInstance.patch('/api/v1/users/preferences', preferences);
            return response.data;
        } catch (error) {
            console.error('Error updating user preferences:', error);
            throw error.response?.data || { message: 'Failed to update preferences' };
        }
    },

    // Security Log endpoints
    getSecurityLog: async (period = '30days') => {
        try {
            const response = await axiosInstance.get(`/api/v1/users/security-log?period=${period}`);
            return response;
        } catch (error) {
            console.error('Error fetching security log:', error);
            throw error.response?.data || { message: 'Failed to fetch security log' };
        }
    },

    // Helper methods
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    getAuthToken: () => {
        return localStorage.getItem('token');
    }
};

export { apiService };
