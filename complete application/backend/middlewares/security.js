const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const securityMiddleware = (app) => {
    // Set security HTTP headers using helmet
    app.use(helmet());

    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: process.env.RATE_LIMIT_MAX || 100, // Limit each IP to 100 requests per windowMs
        message: {
            error: 'Rate Limit Error',
            message: 'Too many requests from this IP, please try again later.'
        }
    });
    app.use('/api', limiter);

    // Specific rate limits for auth routes
    const authLimiter = rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5, // 5 attempts per hour
        message: {
            error: 'Rate Limit Error',
            message: 'Too many login attempts. Please try again later.'
        }
    });
    app.use('/api/v1/auth/login', authLimiter);
    app.use('/api/v1/auth/forgot-password', authLimiter);

    // Data sanitization against NoSQL query injection
    app.use(mongoSanitize());

    // Prevent parameter pollution
    app.use(hpp({
        whitelist: [
            'sort',
            'page',
            'limit',
            'fields',
            'status',
            'priority'
        ]
    }));

    // Custom XSS prevention middleware
    app.use((req, res, next) => {
        if (req.body) {
            for (let key in req.body) {
                if (typeof req.body[key] === 'string') {
                    // Replace potentially dangerous characters
                    req.body[key] = req.body[key]
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#x27;')
                        .replace(/\//g, '&#x2F;');
                }
            }
        }
        next();
    });

    // CORS configuration
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
        res.setHeader(
            'Access-Control-Allow-Methods',
            'GET, POST, PUT, DELETE, PATCH, OPTIONS'
        );
        res.setHeader(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization, X-Requested-With'
        );
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        
        // Handle preflight
        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }
        next();
    });

    // Additional security headers
    app.use((req, res, next) => {
        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        
        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // Enable XSS filter in browser
        res.setHeader('X-XSS-Protection', '1; mode=block');
        
        // Strict Transport Security
        if (process.env.NODE_ENV === 'production') {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }
        
        // Content Security Policy
        res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https:; font-src 'self' https:; style-src 'self' 'unsafe-inline' https:;");
        
        next();
    });
};

module.exports = securityMiddleware;
