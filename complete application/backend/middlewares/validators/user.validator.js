const Joi = require('joi');

const validateProfileUpdate = (req, res, next) => {
    const schema = Joi.object({
        firstName: Joi.string().min(2).max(50),
        lastName: Joi.string().min(2).max(50),
        bio: Joi.string().max(500),
        location: Joi.string().max(100),
        website: Joi.string().uri().allow(''),
        socialLinks: Joi.object({
            twitter: Joi.string().allow(''),
            facebook: Joi.string().allow(''),
            linkedin: Joi.string().allow(''),
            github: Joi.string().allow('')
        })
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

const validatePasswordChange = (req, res, next) => {
    const schema = Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(6).required(),
        confirmPassword: Joi.ref('newPassword')
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
    validateProfileUpdate,
    validatePasswordChange
};
