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
const fs = require('fs'); // Added fs module

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
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

// Serve static files from the React app
const frontendPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, 'build')  // Local build directory
  : path.join(__dirname, '../frontend/dist');

console.log('\n=== Frontend Configuration ===');
console.log('Environment:', process.env.NODE_ENV);
console.log('Frontend Path:', frontendPath);
console.log('Current Directory:', __dirname);
console.log('Current directory contents:', fs.readdirSync(__dirname));
console.log('===========================\n');

// Ensure the directory exists
if (!fs.existsSync(frontendPath)) {
    console.error(`Frontend path does not exist: ${frontendPath}`);
    fs.mkdirSync(frontendPath, { recursive: true });
}

// Serve static files with detailed logging
app.use(express.static(frontendPath, {
    maxAge: '1h',
    fallthrough: true,
    index: false,
    setHeaders: (res, path) => {
        console.log('Serving static file:', path);
    }
}));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/friends', friendRoutes);
app.use('/api/v1/gamified-tasks', gamifiedTaskRoutes);

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
listEndpoints(gamifiedTaskRoutes, '/api/v1/gamified-tasks');

// API 404 handler - Only for /api routes
app.all('/api/*', (req, res, next) => {
    console.log('\n=== 404 Route Handler ===');
    console.log(`${req.method} ${req.url} - Not Found`);
    console.log('======================\n');
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    console.log('\n=== Serving Frontend ===');
    console.log('Request URL:', req.url);
    
    const indexPath = path.join(frontendPath, 'index.html');
    console.log('Looking for index.html at:', indexPath);
    
    try {
        if (fs.existsSync(indexPath)) {
            console.log('Found index.html, serving...');
            res.sendFile(indexPath);
        } else {
            console.error('index.html not found!');
            console.log('Build directory contents:', fs.readdirSync(frontendPath));
            res.status(404).send('Frontend build not found. Please ensure the application is built correctly.');
        }
    } catch (error) {
        console.error('Error serving frontend:', error);
        console.error(error);
        res.status(500).send('Error serving frontend application.');
    }
});

// Global error handler
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Database connection successful'))
.catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
});

// Error handlers
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Error details:');
    console.error(err);
});

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Error details:');
    console.error(err);
});

module.exports = app;
