const Joi = require('joi');
const { validationResult } = require('express-validator');
const AppError = require('../utils/appError');

/**
 * Validate request data against a Joi schema
 * @param {Object} schema - Joi validation schema
 */
exports.validate = (schema) => (req, res, next) => {
    if (!schema) return next();

    const validationFields = ['params', 'query', 'body'];
    const validationOptions = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    };

    const errors = validationFields.reduce((acc, field) => {
        if (schema[field]) {
            const { error } = schema[field].validate(req[field], validationOptions);
            if (error) {
                acc[field] = error.details.map(detail => detail.message);
            }
        }
        return acc;
    }, {});

    if (Object.keys(errors).length > 0) {
        return next(new AppError('Validation error', 400, errors));
    }

    next();
};

/**
 * Validate request using express-validator
 * @param {Array} validations - Array of express-validator validation chains
 */
exports.validateRequest = (validations) => {
    return async (req, res, next) => {
        try {
            if (!validations || !Array.isArray(validations)) {
                console.warn('No validations provided or invalid validation array');
                return next();
            }

            // Run all validations
            await Promise.all(validations.map(validation => validation.run(req)));

            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map(err => ({
                    field: err.param,
                    message: err.msg
                }));
                return next(new AppError('Validation error', 400, { errors: errorMessages }));
            }

            next();
        } catch (error) {
            console.error('Validation Error:', error);
            next(new AppError('Validation failed', 500));
        }
    };
};
