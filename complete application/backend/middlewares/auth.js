const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');

/**
 * Protect routes - Authentication middleware
 */
exports.protect = catchAsync(async (req, res, next) => {
    console.log('Auth Middleware - Headers:', req.headers);
    
    // 1) Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log('Auth Middleware - Token found:', token);
    }

    if (!token) {
        console.log('Auth Middleware - No token found');
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    try {
        // 2) Verify token
        console.log('Auth Middleware - Verifying token with secret:', process.env.JWT_SECRET ? 'Secret exists' : 'No secret found');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Auth Middleware - Decoded token:', decoded);

        // 3) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        console.log('Auth Middleware - User found:', currentUser ? currentUser._id : 'No user found');
        
        if (!currentUser) {
            return next(new AppError('The user belonging to this token no longer exists.', 401));
        }

        // 4) Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
            return next(new AppError('User recently changed password! Please log in again.', 401));
        }

        // Grant access to protected route
        req.user = currentUser;
        console.log('Auth Middleware - Access granted for user:', currentUser._id);
        next();
    } catch (error) {
        console.error('Auth Middleware - Error:', error);
        return next(new AppError('Invalid token or authentication error', 401));
    }
});

/**
 * Restrict access to certain roles
 */
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};

/**
 * Check if user is authenticated
 */
exports.isAuthenticated = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        next(new AppError('You must be logged in to access this resource', 401));
    }
};
