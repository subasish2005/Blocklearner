const Joi = require('joi');

const taskValidation = {
    createTask: {
        body: Joi.object().keys({
            title: Joi.string().required().trim(),
            description: Joi.string().trim(),
            dueDate: Joi.date().greater('now'),
            priority: Joi.string().valid('low', 'medium', 'high'),
            category: Joi.string().valid('coding', 'quiz', 'project', 'exercise', 'other'),
            tags: Joi.array().items(Joi.string().trim()),
            difficulty: Joi.string().valid('easy', 'medium', 'hard'),
            points: Joi.number().min(0)
        })
    },

    getTasks: {
        query: Joi.object().keys({
            page: Joi.number().min(1),
            limit: Joi.number().min(1).max(100),
            sort: Joi.string(),
            status: Joi.string().valid('pending', 'in_progress', 'completed', 'failed'),
            priority: Joi.string().valid('low', 'medium', 'high'),
            category: Joi.string().valid('coding', 'quiz', 'project', 'exercise', 'other')
        })
    },

    updateTask: {
        params: Joi.object().keys({
            id: Joi.string().required()
        }),
        body: Joi.object().keys({
            title: Joi.string().trim(),
            description: Joi.string().trim(),
            dueDate: Joi.date().greater('now'),
            priority: Joi.string().valid('low', 'medium', 'high'),
            category: Joi.string().valid('coding', 'quiz', 'project', 'exercise', 'other'),
            tags: Joi.array().items(Joi.string().trim()),
            status: Joi.string().valid('pending', 'in_progress', 'completed', 'failed'),
            progress: Joi.number().min(0).max(100)
        })
    }
};

module.exports = taskValidation;
