require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const http = require('http');
const { initializeSocket } = require('./socket');
const app = require('./app');

// Verify critical environment variables
const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'JWT_REFRESH_SECRET',
    'JWT_REFRESH_EXPIRES_IN'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`${envVar} is not defined in environment variables`);
        process.exit(1);
    }
}

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`
🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}
👉 API Documentation: http://localhost:${PORT}/api/v1/docs
📝 API Version: 1.0.0
    `);
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Performing graceful shutdown...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
