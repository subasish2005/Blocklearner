const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const path = require('path');
const crypto = require('crypto');
const User = require('../models/user.model');
const AppError = require('../utils/appError');

// Load environment variables from the root directory
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Debug log to check if environment variables are loaded
console.log('OAuth Configuration:', {
    googleClientIDExists: !!process.env.GOOGLE_CLIENT_ID,
    googleClientSecretExists: !!process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/google/callback`,
    backendURL: process.env.BACKEND_URL,
    frontendURL: process.env.FRONTEND_URL
});

// Ensure required environment variables are present
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Missing required Google OAuth credentials in environment variables');
    process.exit(1);
}

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    console.error('Missing required GitHub OAuth credentials in environment variables');
    process.exit(1);
}

// JWT Strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        // Find user by ID from JWT payload
        const user = await User.findById(payload.id)
            .select('+active +emailVerified');

        if (!user) {
            return done(null, false);
        }

        // Check if user is active and email is verified
        if (!user.active) {
            return done(new AppError('Your account has been deactivated', 401), false);
        }

        if (!user.emailVerified) {
            return done(new AppError('Please verify your email to access this resource', 401), false);
        }

        // Check if password was changed after token was issued
        if (user.changedPasswordAfter(payload.iat)) {
            return done(new AppError('User recently changed password. Please log in again', 401), false);
        }

        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
}));

// Serialize user for the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
const googleOptions = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/google/callback`,
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
    passReqToCallback: true,
    proxy: true
};

// Debug log for OAuth configuration
console.log('OAuth Configuration:', {
    googleCallbackURL: googleOptions.callbackURL,
    frontendURL: process.env.FRONTEND_URL,
    backendURL: process.env.BACKEND_URL,
    nodeEnv: process.env.NODE_ENV
});

passport.use(new GoogleStrategy(googleOptions, async (req, accessToken, refreshToken, profile, done) => {
    try {
        console.log('Google OAuth Profile:', profile);
        
        // Check if user already exists
        let user = await User.findOne({ 
            $or: [
                { googleId: profile.id },
                { email: profile.emails[0].value.toLowerCase() }
            ]
        });

        if (user) {
            console.log('Existing user found:', user._id);
            // Update existing user's Google info if needed
            if (!user.googleId) {
                user.googleId = profile.id;
                await user.save({ validateBeforeSave: false });
            }
            return done(null, user);
        }

        console.log('Creating new user from Google profile');
        // Create new user if doesn't exist
        user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value.toLowerCase(),
            googleId: profile.id,
            emailVerified: true, // Google emails are already verified
            avatar: profile.photos[0].value,
            username: profile.emails[0].value.split('@')[0], // Set username as email prefix
            password: crypto.randomBytes(20).toString('hex'), // Generate a random password
            role: 'user'
        });

        console.log('New user created:', user._id);
        return done(null, user);
    } catch (error) {
        console.error('Google OAuth Strategy Error:', error);
        return done(error, false);
    }
}));

// GitHub OAuth Strategy
const githubOptions = {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/github/callback`,
    scope: ['user:email'],
    proxy: true
};

passport.use(new GitHubStrategy(githubOptions, async (accessToken, refreshToken, profile, done) => {
    try {
        // Get primary email from GitHub profile
        const primaryEmail = profile.emails && profile.emails.length > 0
            ? profile.emails[0].value.toLowerCase()
            : null;

        if (!primaryEmail) {
            return done(new AppError('No email found in GitHub profile', 400), false);
        }

        // Check if user already exists
        let user = await User.findOne({
            $or: [
                { githubId: profile.id },
                { email: primaryEmail }
            ]
        });

        if (user) {
            // Update existing user's GitHub info if needed
            if (!user.githubId) {
                user.githubId = profile.id;
                await user.save({ validateBeforeSave: false });
            }
            return done(null, user);
        }

        // Create new user if doesn't exist
        user = await User.create({
            name: profile.displayName || profile.username,
            email: primaryEmail,
            githubId: profile.id,
            emailVerified: true, // GitHub emails are verified
            avatar: profile.photos[0].value,
            username: profile.username,
            password: crypto.randomBytes(20).toString('hex'), // Generate a random password
            passwordConfirm: crypto.randomBytes(20).toString('hex')
        });

        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
}));

module.exports = passport;
