/**
 * Filter object to only keep allowed fields
 * @param {Object} obj - Object to filter
 * @param {...string} allowedFields - Fields to keep
 * @returns {Object} Filtered object
 */
exports.filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(key => {
        if (allowedFields.includes(key)) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
};

/**
 * Check if value is empty (null, undefined, empty string, or empty object)
 * @param {*} value - Value to check
 * @returns {boolean} True if empty, false otherwise
 */
exports.isEmpty = (value) => {
    return (
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim().length === 0) ||
        (typeof value === 'object' && Object.keys(value).length === 0)
    );
};

/**
 * Generate a random string
 * @param {number} length - Length of string to generate
 * @returns {string} Random string
 */
exports.generateRandomString = (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Format date to ISO string without milliseconds
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
exports.formatDate = (date) => {
    return date.toISOString().split('.')[0] + 'Z';
};

/**
 * Calculate the difference between two dates in days
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Difference in days
 */
exports.dateDiffInDays = (date1, date2) => {
    const diffTime = Math.abs(date2 - date1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid, false otherwise
 */
exports.isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Convert string to slug
 * @param {string} str - String to convert
 * @returns {string} Slugified string
 */
exports.toSlug = (str) => {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
exports.deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
exports.formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Parse query parameters for pagination
 * @param {Object} query - Query object
 * @returns {Object} Parsed query parameters
 */
exports.parsePaginationParams = (query) => {
    return {
        page: parseInt(query.page, 10) || 1,
        limit: parseInt(query.limit, 10) || 10,
        sort: query.sort || '-createdAt'
    };
};

/**
 * Sanitize user input to prevent XSS
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
exports.sanitizeInput = (str) => {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Check if user has required permissions
 * @param {string[]} userRoles - User's roles
 * @param {string[]} requiredRoles - Required roles
 * @returns {boolean} True if user has required permissions
 */
exports.hasPermission = (userRoles, requiredRoles) => {
    return requiredRoles.some(role => userRoles.includes(role));
};

/**
 * Generate a random color
 * @returns {string} Random hex color
 */
exports.generateRandomColor = () => {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
};
