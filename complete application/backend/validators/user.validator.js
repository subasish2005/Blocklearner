const { body } = require('express-validator');

const createUser = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    body('role')
        .optional()
        .isIn(['user', 'admin'])
        .withMessage('Invalid role')
];

const updateUser = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),
    body('avatar')
        .optional()
        .isURL()
        .withMessage('Avatar must be a valid URL'),
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio must not exceed 500 characters')
];

const updateProfile = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio must not exceed 500 characters'),
    body('location')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Location must not exceed 100 characters'),
    body('website')
        .optional()
        .trim()
        .isURL()
        .withMessage('Website must be a valid URL'),
    body('avatar')
        .optional()
        .isURL()
        .withMessage('Avatar must be a valid URL')
];

const updateSettings = [
    body('emailNotifications')
        .optional()
        .isBoolean()
        .withMessage('Email notifications must be a boolean'),
    body('pushNotifications')
        .optional()
        .isBoolean()
        .withMessage('Push notifications must be a boolean'),
    body('language')
        .optional()
        .isIn(['en', 'es', 'fr', 'de'])
        .withMessage('Invalid language selection'),
    body('theme')
        .optional()
        .isIn(['light', 'dark', 'system'])
        .withMessage('Invalid theme selection')
];

const updateSocialLinks = [
    body('github')
        .optional()
        .trim()
        .isURL()
        .withMessage('GitHub link must be a valid URL'),
    body('linkedin')
        .optional()
        .trim()
        .isURL()
        .withMessage('LinkedIn link must be a valid URL'),
    body('twitter')
        .optional()
        .trim()
        .isURL()
        .withMessage('Twitter link must be a valid URL'),
    body('website')
        .optional()
        .trim()
        .isURL()
        .withMessage('Website must be a valid URL')
];

const updateBio = [
    body('bio')
        .trim()
        .notEmpty()
        .withMessage('Bio is required')
        .isLength({ max: 500 })
        .withMessage('Bio must not exceed 500 characters')
];

const updateUserStatus = [
    body('status')
        .trim()
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['active', 'inactive', 'suspended'])
        .withMessage('Invalid status')
];

const updateUserRole = [
    body('role')
        .trim()
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['user', 'admin', 'moderator'])
        .withMessage('Invalid role')
];

const respondToFriendRequest = [
    body('action')
        .trim()
        .notEmpty()
        .withMessage('Action is required')
        .isIn(['accept', 'reject'])
        .withMessage('Invalid action')
];

module.exports = {
    createUser,
    updateUser,
    updateProfile,
    updateSettings,
    updateSocialLinks,
    updateBio,
    updateUserStatus,
    updateUserRole,
    respondToFriendRequest
};
