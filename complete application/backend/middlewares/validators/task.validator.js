const Joi = require('joi');

const validateTaskCreation = (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().min(3).max(100).required(),
        description: Joi.string().min(10).max(1000).required(),
        dueDate: Joi.date().greater('now').required(),
        priority: Joi.string().valid('low', 'medium', 'high').required(),
        category: Joi.string().required(),
        assignedTo: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
        attachments: Joi.array().items(Joi.string()),
        tags: Joi.array().items(Joi.string())
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

const validateTaskUpdate = (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().min(3).max(100),
        description: Joi.string().min(10).max(1000),
        dueDate: Joi.date().greater('now'),
        priority: Joi.string().valid('low', 'medium', 'high'),
        status: Joi.string().valid('pending', 'in-progress', 'completed', 'cancelled'),
        category: Joi.string(),
        assignedTo: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
        attachments: Joi.array().items(Joi.string()),
        tags: Joi.array().items(Joi.string())
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

const validateTaskSubmission = (req, res, next) => {
    const schema = Joi.object({
        completionNotes: Joi.string().max(1000),
        attachments: Joi.array().items(Joi.string())
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
    validateTaskCreation,
    validateTaskUpdate,
    validateTaskSubmission
};
