const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createNotification = {
    body: Joi.object().keys({
        recipient: Joi.string().custom(objectId).required(),
        type: Joi.string().valid('achievement', 'task', 'system', 'level_up', 'badge', 'friend_request', 'friend_accept', 'new_task', 'task_completed').required(),
        title: Joi.string().required(),
        message: Joi.string().required(),
        metadata: Joi.object(),
        expiresAt: Joi.date()
    })
};

const getNotifications = {
    query: Joi.object().keys({
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100),
        read: Joi.boolean(),
        type: Joi.string().valid('achievement', 'task', 'system', 'level_up', 'badge', 'friend_request', 'friend_accept', 'new_task', 'task_completed')
    })
};

const updateNotification = {
    params: Joi.object().keys({
        id: Joi.string().custom(objectId).required()
    })
};

module.exports = {
    createNotification,
    getNotifications,
    updateNotification
};
