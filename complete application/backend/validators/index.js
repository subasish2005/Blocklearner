const authValidation = require('./auth.validator');
const userValidation = require('./user.validator');
const notificationValidation = require('./notification.validation');
const taskValidation = require('./task.validation');

module.exports = {
    authValidation,
    userValidation,
    notificationValidation,
    taskValidation
};
