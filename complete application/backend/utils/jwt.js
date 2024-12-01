const jwt = require('jsonwebtoken');
const { promisify } = require('util');

/**
 * Generate a JWT token
 * @param {Object} user - User object to generate token for
 * @returns {string} JWT token
 */
exports.generateToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role || 'user'
    };

    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
};

/**
 * Generate a refresh token
 * @param {Object} user - User object to generate refresh token for
 * @returns {string} Refresh token
 */
exports.generateRefreshToken = (user) => {
    const payload = {
        id: user._id,
        version: user.tokenVersion || 0
    };

    return jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
};

/**
 * Verify a JWT token
 * @param {string} token - Token to verify
 * @returns {Promise<Object>} Decoded token payload
 */
exports.verifyToken = async (token) => {
    try {
        const decoded = await promisify(jwt.verify)(
            token,
            process.env.JWT_SECRET
        );
        return decoded;
    } catch (error) {
        throw new Error('Invalid token');
    }
};

/**
 * Verify a refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Promise<Object>} Decoded token payload
 */
exports.verifyRefreshToken = async (token) => {
    try {
        const decoded = await promisify(jwt.verify)(
            token,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        );
        return decoded;
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
};

/**
 * Extract token from authorization header
 * @param {string} authHeader - Authorization header
 * @returns {string|null} Token or null if not found
 */
exports.extractTokenFromHeader = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.split(' ')[1];
};
