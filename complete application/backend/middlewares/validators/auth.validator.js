const Joi = require('joi');

const validateRegistration = (req, res, next) => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.ref('password'),
        firstName: Joi.string().min(2).max(50),
        lastName: Joi.string().min(2).max(50)
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            error: 'Validation Error',
            message: error.details[0].message
        });
    }
    next();
};

const validateLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            error: 'Validation Error',
            message: error.details[0].message
        });
    }
    next();
};

const validatePasswordReset = (req, res, next) => {
    const schema = Joi.object({
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.ref('password')
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            error: 'Validation Error',
            message: error.details[0].message
        });
    }
    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validatePasswordReset
};
