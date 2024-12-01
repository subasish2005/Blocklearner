const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/user.model');
const { TokenError } = require('./utils/appError');

let io;

const initializeSocket = (server) => {
    io = socketIO(server, {
        path: '/ws',
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
            allowedHeaders: ["Authorization"]
        },
        transports: ['websocket', 'polling']
    });

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            // Get token from handshake auth or headers
            const token = socket.handshake.auth.token || 
                         socket.handshake.headers.authorization?.split(' ')[1];

            if (!token) {
                return next(new TokenError('No token provided'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('+active');
            
            if (!user || !user.active) {
                return next(new TokenError('User not found or inactive'));
            }

            // Store user data in socket
            socket.user = {
                _id: user._id,
                name: user.name,
                role: user.role
            };

            next();
        } catch (error) {
            console.error('Socket authentication error:', error);
            if (error.name === 'JsonWebTokenError') {
                return next(new TokenError('Invalid token'));
            }
            if (error.name === 'TokenExpiredError') {
                return next(new TokenError('Token expired'));
            }
            next(error);
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.name} (${socket.user._id})`);
        
        // Join user's personal room for private messages
        socket.join(socket.user._id.toString());

        // Join role-based room for role-specific broadcasts
        socket.join(`role:${socket.user.role}`);

        // Handle user status
        socket.on('status', (status) => {
            io.emit('userStatus', {
                userId: socket.user._id,
                status
            });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.name} (${socket.user._id})`);
            io.emit('userStatus', {
                userId: socket.user._id,
                status: 'offline'
            });
        });

        // Error handling
        socket.on('error', (error) => {
            console.error('Socket error:', error);
            socket.emit('error', {
                message: 'An error occurred',
                timestamp: new Date().toISOString()
            });
        });
    });

    // Handle server-side socket errors
    io.engine.on('connection_error', (error) => {
        console.error('Socket.io connection error:', error);
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = {
    initializeSocket,
    getIO
};
