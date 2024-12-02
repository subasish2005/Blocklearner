const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Activity = require('../models/activity.model');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const { filterObj } = require('../utils/helpers');

// Helper function to create and send token
const createSendToken = (user, statusCode, res) => {
    try {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        // Remove sensitive data from output
        user.password = undefined;
        user.__v = undefined;

        res.status(statusCode).json({
            status: 'success',
            token,
            data: {
                user
            }
        });
    } catch (error) {
        console.error('Token creation error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating authentication token'
        });
    }
};

// Register new user
exports.register = async (req, res, next) => {
    try {
        console.log('Registration request received:', {
            email: req.body.email,
            name: req.body.name
        });

        // Create verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // Create user
        const filteredBody = filterObj(
            req.body,
            'name',
            'username',
            'email',
            'password',
            'passwordConfirm'
        );

        // Set default username if not provided
        if (!filteredBody.username) {
            filteredBody.username = filteredBody.email.split('@')[0];
        }

        const user = await User.create({
            ...filteredBody,
            emailVerificationToken: crypto
                .createHash('sha256')
                .update(verificationToken)
                .digest('hex'),
            emailVerificationExpires: verificationTokenExpires,
            role: req.body.role || 'user'
        });

        console.log('User created successfully:', {
            userId: user._id,
            email: user.email
        });

        // Log account creation
        await Activity.create({
            type: 'account_created',
            user: user._id,
            content: 'Account created successfully',
            metadata: {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                location: req.headers['x-forwarded-for'] || req.connection.remoteAddress
            }
        });

        // Create verification URL
        const verificationURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/auth/verify-email/${verificationToken}`;

        const message = `Welcome to BlockLearner! Please verify your email by clicking on the following link: ${verificationURL}\nIf you didn't register for BlockLearner, please ignore this email.`;

        console.log('Attempting to send verification email to:', user.email);

        // Send verification email
        await sendEmail({
            email: user.email,
            subject: 'Email Verification - BlockLearner',
            message,
            html: `
                <h1>Welcome to BlockLearner!</h1>
                <p>Please verify your email by clicking on the following link:</p>
                <a href="${verificationURL}" target="_blank">Verify Email</a>
                <p>If you didn't register for BlockLearner, please ignore this email.</p>
            `
        });

        console.log('Verification email sent successfully');

        // Create and send token
        createSendToken(user, 201, res);
    } catch (error) {
        console.error('Registration error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        next(error);
    }
};

// Verify email
exports.verifyEmail = async (req, res, next) => {
    try {
        // Get user based on the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });

        // If token has expired or is invalid
        if (!user) {
            return next(new AppError('Token is invalid or has expired', 400));
        }

        // Activate account
        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save({ validateBeforeSave: false });

        // Log email verification
        await Activity.create({
            type: 'email_verified',
            user: user._id,
            content: 'Email address verified successfully',
            metadata: {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                location: req.headers['x-forwarded-for'] || req.connection.remoteAddress
            }
        });

        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Login user
exports.login = async (req, res, next) => {
    try {
        console.log('Login attempt for:', req.body.email);
        const { email, password } = req.body;

        // 1) Check if email and password exist
        if (!email || !password) {
            return next(new AppError('Please provide email and password', 400));
        }

        // 2) Check if user exists
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            console.log('User not found:', email);
            // Log failed login attempt
            await Activity.create({
                type: 'login_failed',
                user: null,
                content: 'Failed login attempt - user not found',
                metadata: {
                    email,
                    reason: 'user_not_found',
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent']
                }
            });
            return next(new AppError('Incorrect email or password', 401));
        }

        // 3) Check if password is correct
        const isPasswordCorrect = await user.correctPassword(password);
        
        if (!isPasswordCorrect) {
            console.log('Invalid password for user:', email);
            // Log failed login attempt
            await Activity.create({
                type: 'login_failed',
                user: user._id,
                content: 'Failed login attempt - incorrect password',
                metadata: {
                    reason: 'invalid_password',
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent']
                }
            });
            return next(new AppError('Incorrect email or password', 401));
        }

        // 4) Check if email is verified
        if (!user.emailVerified) {
            console.log('Unverified email attempt:', email);
            // Log failed login attempt
            await Activity.create({
                type: 'login_failed',
                user: user._id,
                content: 'Failed login attempt - email not verified',
                metadata: {
                    reason: 'unverified_email',
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent']
                }
            });
            return next(new AppError('Please verify your email first', 401));
        }

        console.log('Successful login for user:', email);
        
        // Log successful login
        await Activity.create({
            type: 'login',
            user: user._id,
            content: 'Successful login',
            metadata: {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                location: req.headers['x-forwarded-for'] || req.connection.remoteAddress
            }
        });
        
        // 5) If everything ok, send token to client
        createSendToken(user, 200, res);
    } catch (error) {
        console.error('Login error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        next(new AppError('Error during login. Please try again.', 500));
    }
};

// Protect routes
exports.protect = async (req, res, next) => {
    try {
        // Get token
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('Please log in to get access', 401));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new AppError('User no longer exists', 401));
        }

        // Check if user changed password after token was issued
        if (user.changedPasswordAfter(decoded.iat)) {
            return next(
                new AppError('Password recently changed. Please log in again', 401)
            );
        }

        // Grant access to protected route
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

// Restrict to certain roles
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    'You do not have permission to perform this action',
                    403
                )
            );
        }
        next();
    };
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email.toLowerCase() });
        if (!user) {
            return next(new AppError('No user found with that email address', 404));
        }

        // Generate reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // Log password reset request
        await Activity.create({
            type: 'password_reset_requested',
            user: user._id,
            content: 'Password reset requested',
            metadata: {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                location: req.headers['x-forwarded-for'] || req.connection.remoteAddress
            }
        });

        try {
            // Send reset email
            const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
            const resetURL = `${frontendURL}/reset-password/${resetToken}`;
            
            const message = `Forgot your password? Click the link below to reset your password: ${resetURL}\nIf you didn't forget your password, please ignore this email!`;
            
            await sendEmail({
                email: user.email,
                subject: 'Your password reset token (valid for 10 minutes)',
                message,
                html: `
                    <h1>Password Reset Request</h1>
                    <p>Hello ${user.name},</p>
                    <p>You requested to reset your password. Click the button below to reset it:</p>
                    <div style="margin: 20px 0;">
                        <a href="${resetURL}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
                    </div>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>This link will expire in 10 minutes.</p>
                    <p>Best regards,<br>BlockLearner Team</p>
                `
            });

            res.status(200).json({
                status: 'success',
                message: 'Password reset token sent to email'
            });
        } catch (error) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            return next(new AppError('Error sending password reset email. Please try again.', 500));
        }
    } catch (error) {
        next(error);
    }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
    try {
        // Get user based on token
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return next(new AppError('Token is invalid or has expired', 400));
        }

        // Set new password
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // Log password reset
        await Activity.create({
            type: 'password_reset',
            user: user._id,
            content: 'Password reset successfully',
            metadata: {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                location: req.headers['x-forwarded-for'] || req.connection.remoteAddress
            }
        });

        // Log user in
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        // Remove password from output
        user.password = undefined;

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user
            }
        });
    } catch (error) {
        next(error);
    }
};

// Update password
exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
            return next(new AppError('Current password is incorrect', 401));
        }

        // Update password
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        await user.save();

        // Log user in with new password
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        // Remove password from output
        user.password = undefined;

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user
            }
        });
    } catch (error) {
        next(error);
    }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return next(new AppError('Please provide refresh token', 400));
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Check if user exists and token matches
        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return next(new AppError('Invalid refresh token', 401));
        }

        // Generate new tokens
        const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });
        const newRefreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
        });

        // Update refresh token
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        // Remove sensitive data from response
        user.password = undefined;

        res.status(200).json({
            status: 'success',
            token: newToken,
            refreshToken: newRefreshToken,
            data: {
                user
            }
        });
    } catch (error) {
        next(error);
    }
};

// Logout user
exports.logout = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('You are not logged in', 401));
        }

        // Log logout activity
        await Activity.create({
            type: 'logout',
            user: req.user._id,
            content: 'Successfully logged out',
            metadata: {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                location: req.headers['x-forwarded-for'] || req.connection.remoteAddress
            }
        });

        // Clear refresh token
        await User.findByIdAndUpdate(req.user.id, {
            $unset: { refreshToken: 1 }
        });

        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        next(error);
    }
};

// OAuth callbacks
exports.googleAuthCallback = async (req, res, next) => {
    try {
        console.log('Google OAuth Callback - Request User:', req.user);
        console.log('Google OAuth Callback - Session:', req.session);

        if (!req.user) {
            console.log('No user found in request');
            return next(new AppError('No user found from Google authentication', 401));
        }

        // Create JWT token
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        // Only send essential user data in URL
        const essentialUserData = {
            id: req.user._id,
            email: req.user.email,
            name: req.user.name
        };

        // Log successful OAuth login
        try {
            await Activity.create({
                type: 'oauth_login',
                user: req.user._id,
                content: 'Successfully logged in via Google',
                metadata: {
                    provider: 'google',
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent']
                }
            });
        } catch (activityError) {
            console.error('Failed to create activity log:', activityError);
            // Continue with auth flow even if activity logging fails
        }

        // Redirect to frontend with token and minimal user data
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
        const userData = encodeURIComponent(JSON.stringify(essentialUserData));
        const redirectURL = `${frontendURL}/auth/callback#token=${token}&user=${userData}`;
        console.log('Redirecting to:', redirectURL);
        res.redirect(redirectURL);
    } catch (error) {
        console.error('Google OAuth callback error:', error);
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendURL}/auth/callback#error=${encodeURIComponent(error.message)}`);
    }
};

exports.githubAuthCallback = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('No user found from GitHub authentication', 401));
        }

        // Create JWT token
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        // Only send essential user data in URL
        const essentialUserData = {
            id: req.user._id,
            email: req.user.email,
            name: req.user.name
        };

        // Log successful OAuth login
        await Activity.create({
            type: 'oauth_login',
            user: req.user._id,
            content: 'Successfully logged in via GitHub',
            metadata: {
                provider: 'github',
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                location: req.headers['x-forwarded-for'] || req.connection.remoteAddress
            }
        });

        // Redirect to frontend with token and minimal user data
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
        const userData = encodeURIComponent(JSON.stringify(essentialUserData));
        res.redirect(`${frontendURL}/auth/callback#token=${token}&user=${userData}`);
    } catch (error) {
        console.error('GitHub OAuth callback error:', error);
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendURL}/auth/callback#error=${encodeURIComponent(error.message)}`);
    }
};

module.exports = exports;
