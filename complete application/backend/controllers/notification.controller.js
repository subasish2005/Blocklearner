const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const AppError = require('../utils/appError');

exports.createNotification = async (req, res, next) => {
    try {
        const { recipient, type, title, message, metadata } = req.body;

        // Check if recipient exists
        const user = await User.findById(recipient);
        if (!user) {
            return next(new AppError('Recipient not found', 404));
        }

        const notification = await Notification.create({
            recipient,
            sender: req.user.id,
            type,
            title,
            message,
            metadata
        });

        res.status(201).json({
            status: 'success',
            data: { notification }
        });
    } catch (error) {
        next(error);
    }
};

exports.getMyNotifications = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const query = {
            recipient: req.user.id,
            ...(req.query.read !== undefined && { read: req.query.read === 'true' })
        };

        const notifications = await Notification.find(query)
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .populate('sender', 'name email avatar');

        const total = await Notification.countDocuments(query);

        res.status(200).json({
            status: 'success',
            results: notifications.length,
            total,
            data: { notifications }
        });
    } catch (error) {
        next(error);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            recipient: req.user.id
        });

        if (!notification) {
            return next(new AppError('Notification not found', 404));
        }

        notification.read = true;
        notification.readAt = Date.now();
        await notification.save();

        res.status(200).json({
            status: 'success',
            data: { notification }
        });
    } catch (error) {
        next(error);
    }
};

exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            {
                recipient: req.user.id,
                read: false
            },
            {
                read: true,
                readAt: Date.now()
            }
        );

        res.status(200).json({
            status: 'success',
            message: 'All notifications marked as read'
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipient: req.user.id
        });

        if (!notification) {
            return next(new AppError('Notification not found', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        next(new AppError('Failed to delete notification', 500));
    }
};

exports.getUnreadCount = async (req, res, next) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user.id,
            read: false
        });

        res.status(200).json({
            status: 'success',
            data: { count }
        });
    } catch (error) {
        next(error);
    }
};

exports.clearOldNotifications = async (req, res, next) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        await Notification.deleteMany({
            recipient: req.user.id,
            read: true,
            createdAt: { $lt: thirtyDaysAgo }
        });

        res.status(200).json({
            status: 'success',
            message: 'Old notifications cleared successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.getNotificationPreferences = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('notificationPreferences');
        
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                preferences: user.notificationPreferences
            }
        });
    } catch (error) {
        console.error('Error getting notification preferences:', error);
        next(new AppError('Failed to get notification preferences', 500));
    }
};

exports.updateNotificationPreferences = async (req, res, next) => {
    try {
        // Validate the update data
        const allowedFields = [
            'emailNotifications',
            'pushNotifications',
            'notifyOnNewMessage',
            'notifyOnFriendRequest',
            'notifyOnFriendAccept',
            'notifyOnMention',
            'digestFrequency'
        ];

        const updateData = {};
        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key)) {
                updateData[`notificationPreferences.${key}`] = req.body[key];
            }
        });

        if (Object.keys(updateData).length === 0) {
            return next(new AppError('No valid fields to update', 400));
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { 
                new: true, 
                runValidators: true 
            }
        ).select('notificationPreferences');

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                preferences: user.notificationPreferences
            }
        });
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        next(new AppError('Failed to update notification preferences', 500));
    }
};
