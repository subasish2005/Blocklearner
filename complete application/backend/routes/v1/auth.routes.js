const express = require('express');
const passport = require('passport');
const { validateRequest } = require('../../middlewares/validate');
const authController = require('../../controllers/auth.controller');

const router = express.Router();

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.protect, authController.logout);

// Password management
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch('/update-password', authController.protect, authController.updatePassword);

// Email verification
router.get('/verify-email/:token', authController.verifyEmail);

// Token refresh
router.post('/refresh-token', authController.refreshToken);

// OAuth routes
router.get('/google', 
    (req, res, next) => {
        console.log('Starting Google OAuth flow');
        next();
    },
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account',
        session: true
    })
);

router.get('/google/callback', 
    (req, res, next) => {
        console.log('Google OAuth callback received');
        next();
    },
    passport.authenticate('google', { 
        failureRedirect: '/login',
        session: true,
        failureMessage: true
    }), 
    (req, res, next) => {
        console.log('Google OAuth authentication successful');
        next();
    },
    authController.googleAuthCallback
);

router.get('/github', 
    (req, res, next) => {
        console.log('Starting GitHub OAuth flow');
        next();
    },
    passport.authenticate('github', { 
        scope: ['user:email'],
        prompt: 'select_account',
        session: true
    })
);

router.get('/github/callback', 
    (req, res, next) => {
        console.log('GitHub OAuth callback received');
        next();
    },
    passport.authenticate('github', { 
        failureRedirect: '/login',
        session: true,
        failureMessage: true
    }), 
    (req, res, next) => {
        console.log('GitHub OAuth authentication successful');
        next();
    },
    authController.githubAuthCallback
);

module.exports = router;
