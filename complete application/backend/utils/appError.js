class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Authentication Errors
class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Not authorized to access this resource') {
        super(message, 403);
    }
}

class TokenError extends AppError {
    constructor(message = 'Invalid or expired token') {
        super(message, 401);
    }
}

// Validation Errors
class ValidationError extends AppError {
    constructor(message = 'Validation failed', errors = {}) {
        super(message, 400);
        this.errors = errors;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            errors: this.errors
        };
    }
}

// Resource Errors
class NotFoundError extends AppError {
    constructor(resource = 'Resource', message = null) {
        super(message || `${resource} not found`, 404);
        this.resource = resource;
    }
}

class ConflictError extends AppError {
    constructor(message = 'Resource conflict', resource = null) {
        super(message, 409);
        this.resource = resource;
    }
}

// Rate Limiting Errors
class RateLimitError extends AppError {
    constructor(message = 'Too many requests', retryAfter = null) {
        super(message, 429);
        this.retryAfter = retryAfter;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            ...(this.retryAfter && { retryAfter: this.retryAfter })
        };
    }
}

// Database Errors
class DatabaseError extends AppError {
    constructor(message = 'Database operation failed', operation = null) {
        super(message, 500);
        this.operation = operation;
    }
}

// Export the base AppError class directly
module.exports = AppError;

// Also export specific error types if needed
module.exports.AuthenticationError = AuthenticationError;
module.exports.AuthorizationError = AuthorizationError;
module.exports.TokenError = TokenError;
module.exports.ValidationError = ValidationError;
module.exports.NotFoundError = NotFoundError;
module.exports.ConflictError = ConflictError;
module.exports.RateLimitError = RateLimitError;
module.exports.DatabaseError = DatabaseError;

// Export a function that creates a new AppError instance
module.exports.createAppError = (message, statusCode) => {
    return new AppError(message, statusCode);
};
