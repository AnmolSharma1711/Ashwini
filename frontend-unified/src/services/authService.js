/**
 * Authentication Service for Frontend-Unified (Doctor's Portal)
 * 
 * This service handles:
 * - User login and registration
 * - JWT token management in localStorage
 * - Role verification for portal access
 * - Auto logout on token expiry
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://ashwini-backend.onrender.com';
const AUTH_ENDPOINT = `${API_URL}/api/auth`;

// Portal identifier - used to verify role-based access
const PORTAL_NAME = 'frontend-unified';
const ALLOWED_ROLES = ['ADMIN', 'DOCTOR'];

/**
 * Login user and store JWT tokens + user data
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<object>} User data with role
 */
export const login = async (username, password) => {
    try {
        const response = await axios.post(`${AUTH_ENDPOINT}/login/`, {
            username,
            password
        });

        const { access, refresh, user } = response.data;

        // Store tokens and user info in localStorage
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('username', user.username);

        // Verify user can access this portal
        if (!canAccessPortal(user.role)) {
            logout();
            throw new Error(
                `${user.role} role is not authorized for the Doctor's Portal. ` +
                `Please use the Registration Portal if you are a nurse or reception staff.`
            );
        }

        return user;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.error || 'Login failed');
        }
        throw error;
    }
};

/**
 * Register a new user
 * @param {object} userData - {username, email, password, password_confirm, first_name, last_name, role}
 * @returns {Promise<object>} User data
 */
export const register = async (userData) => {
    try {
        const response = await axios.post(`${AUTH_ENDPOINT}/register/`, userData);

        const { access, refresh, user } = response.data;

        // Store tokens and user info
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('username', user.username);

        return user;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.error || 'Registration failed');
        }
        throw error;
    }
};

/**
 * Logout user and clear all stored data
 */
export const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    try {
        if (refreshToken) {
            await axios.post(`${AUTH_ENDPOINT}/logout/`, {
                refresh: refreshToken
            }, {
                headers: {
                    'Authorization': `Bearer ${getAccessToken()}`
                }
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear all auth data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
    }
};

/**
 * Get stored access token
 * @returns {string|null}
 */
export const getAccessToken = () => {
    return localStorage.getItem('accessToken');
};

/**
 * Get stored refresh token
 * @returns {string|null}
 */
export const getRefreshToken = () => {
    return localStorage.getItem('refreshToken');
};

/**
 * Get stored user data
 * @returns {object|null}
 */
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

/**
 * Get current user's role
 * @returns {string|null}
 */
export const getUserRole = () => {
    return localStorage.getItem('userRole');
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
    return !!getAccessToken();
};

/**
 * Check if current user's role can access this portal
 * @param {string} role - User's role
 * @returns {boolean}
 */
export const canAccessPortal = (role) => {
    return ALLOWED_ROLES.includes(role);
};

/**
 * Verify current user can access this portal
 * @returns {boolean}
 */
export const verifyPortalAccess = () => {
    const role = getUserRole();
    if (!role) return false;
    return canAccessPortal(role);
};

/**
 * Refresh the access token using refresh token
 * @returns {Promise<string>} New access token
 */
export const refreshAccessToken = async () => {
    try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await axios.post(`${AUTH_ENDPOINT}/token/refresh/`, {
            refresh: refreshToken
        });

        const { access } = response.data;
        localStorage.setItem('accessToken', access);

        return access;
    } catch (error) {
        // If refresh fails, logout user
        logout();
        throw error;
    }
};

/**
 * Fetch current user data from backend
 * @returns {Promise<object>}
 */
export const fetchCurrentUser = async () => {
    try {
        const response = await axios.get(`${AUTH_ENDPOINT}/me/`, {
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`
            }
        });

        const user = response.data;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('username', user.username);

        return user;
    } catch (error) {
        console.error('Failed to fetch current user:', error);
        throw error;
    }
};

// Export portal configuration
export const PORTAL_CONFIG = {
    name: PORTAL_NAME,
    allowedRoles: ALLOWED_ROLES,
    displayName: "Doctor's Portal",
    unauthorizedMessage: 'Only Admins and Doctors can access this portal.',
    redirectUrl: process.env.REACT_APP_MAIN_PORTAL_URL || 'http://localhost:4000'
};

const authService = {
    login,
    register,
    logout,
    getAccessToken,
    getRefreshToken,
    getCurrentUser,
    getUserRole,
    isAuthenticated,
    canAccessPortal,
    verifyPortalAccess,
    refreshAccessToken,
    fetchCurrentUser,
    PORTAL_CONFIG
};

export default authService;
