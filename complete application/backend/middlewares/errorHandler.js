const AppError = require('../utils/AppError');

// Error logging utility
const logError = (err, req) => {
    console.error({
        timestamp: new Date().toISOString(),
        error: {
            name: err.name,
            message: err.message,
            stack: err.stack,
            statusCode: err.statusCode
        },
        request: {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userId: req.user ? req.user.id : 'anonymous'
        }
    });
};

// Handle Mongoose validation errors
const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map(error => error.message);
    return new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
};

// Handle Mongoose duplicate key errors
const handleDuplicateKeyError = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    return new AppError(`Duplicate field value: ${value}. Please use another value.`, 400);
};

// Handle Mongoose cast errors
const handleCastError = (err) => {
    return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

// Handle JWT Errors
const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again.', 401);

// Handle Rate Limit Errors
const handleTooManyRequests = (err) => {
    const retryAfter = err.headers['retry-after'] || 60;
    return new AppError(`Too many requests. Please try again in ${retryAfter} seconds.`, 429);
};

// Development Error Response
const sendErrorDev = (err, req, res) => {
    logError(err, req);
    res.status(err.statusCode || 500).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

// Production Error Response
const sendErrorProd = (err, req, res) => {
    logError(err, req);
    
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥:', err);
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
    });
};

// Main error handling middleware
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        if (error.name === 'CastError') error = handleCastError(error);
        if (error.code === 11000) error = handleDuplicateKeyError(error);
        if (error.name === 'ValidationError') error = handleValidationError(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
        if (error.statusCode === 429) error = handleTooManyRequests(error);

        sendErrorProd(error, req, res);
    }
};

module.exports = errorHandler;
