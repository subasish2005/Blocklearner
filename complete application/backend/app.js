const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const session = require('express-session');
const User = require('./models/user.model');

const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/appError');

// Import routes
const authRoutes = require('./routes/v1/auth.routes');
const userRoutes = require('./routes/v1/user.routes');
const dashboardRoutes = require('./routes/v1/dashboard.routes');
const notificationRoutes = require('./routes/v1/notification.routes');
const friendRoutes = require('./routes/v1/friend.routes');
const gamifiedTaskRoutes = require('./routes/v1/gamified-tasks.routes');

// Import Passport config
require('./config/passport');

const app = express();

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log('\n=== Incoming Request ===');
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('======================\n');
    next();
});

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://blocklearner-frontend.vercel.app',
    'https://blocklearner-frontend-nd2c69qf8-subasishs-projects.vercel.app'
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Frontend-URL']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Handle file uploads
app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(path.join(__dirname, 'uploads')));

// Data sanitization
app.use(mongoSanitize()); // Against NoSQL query injection
app.use(xss()); // Against XSS
app.use(hpp()); // Against HTTP Parameter Pollution

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Gzip compression
app.use(compression());

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/friends', friendRoutes);
app.use('/api/v1/tasks', gamifiedTaskRoutes);

// Welcome route
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to Blocklearner API',
        documentation: '/api/v1/docs',
        healthCheck: '/health',
        version: '1.0.0'
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Handle undefined routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(errorHandler);

console.log('\n=== Registered Routes ===');

const listEndpoints = (router, basePath = '') => {
    router.stack.forEach(layer => {
        if (layer.route) {
            const path = basePath + layer.route.path;
            const methods = Object.keys(layer.route.methods);
            console.log(`${methods.join(', ').toUpperCase().padEnd(10)} ${path}`);
        }
    });
};

console.log('\nAuth Routes:');
listEndpoints(authRoutes, '/api/v1/auth');

console.log('\nUser Routes:');
listEndpoints(userRoutes, '/api/v1/users');

console.log('\nDashboard Routes:');
listEndpoints(dashboardRoutes, '/api/v1/dashboard');

console.log('\nNotification Routes:');
listEndpoints(notificationRoutes, '/api/v1/notifications');

console.log('\nFriend Routes:');
listEndpoints(friendRoutes, '/api/v1/friends');

console.log('\nTask Routes:');
listEndpoints(gamifiedTaskRoutes, '/api/v1/tasks');

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Database connection successful'))
.catch((err) => {
    console.error('Database connection error:', err);
    // Exit only in development, let the process manager handle restarts in production
    if (process.env.NODE_ENV === 'development') {
        process.exit(1);
    }
});

// Global error handlers for uncaught errors
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Error details:', err);
    // Log the error but don't exit in production
    if (process.env.NODE_ENV === 'development') {
        process.exit(1);
    }
});

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Error details:', err);
    // Log the error but don't exit in production
    if (process.env.NODE_ENV === 'development') {
        process.exit(1);
    }
});

module.exports = app;
