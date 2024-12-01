const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const notificationRoutes = require('./notification.routes');
const taskRoutes = require('./gamified-tasks.routes');
const friendRoutes = require('./friend.routes');

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/tasks', taskRoutes);
router.use('/friends', friendRoutes);

// API Documentation
router.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the API',
        version: '1.0.0',
        documentation: '/api/v1/docs',
        endpoints: {
            auth: '/api/v1/auth',
            users: '/api/v1/users',
            notifications: '/api/v1/notifications',
            tasks: '/api/v1/tasks',
            friends: '/api/v1/friends'
        }
    });
});

module.exports = router;
