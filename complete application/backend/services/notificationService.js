const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const { getIO } = require('../socket');
const { NotFoundError, ValidationError } = require('../utils/appError');

const notificationService = {
    async createNotification({ recipient, sender, type, title, message, link }) {
        try {
            // Validate recipient exists
            const recipientUser = await User.findById(recipient);
            if (!recipientUser) {
                throw new NotFoundError('Recipient user not found');
            }

            const notification = new Notification({
                recipient,
                sender,
                type,
                title,
                message,
                link
            });

            await notification.save();

            // Get socket instance
            const io = getIO();

            // Populate sender details
            await notification.populate('sender', 'name avatar');

            // Emit notification to recipient
            io.to(recipient.toString()).emit('newNotification', {
                notification: notification.toObject(),
                unreadCount: await this.getUnreadCount(recipient)
            });

            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    },

    async getUnreadNotifications(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new NotFoundError('User not found');
            }

            return await Notification.find({
                recipient: userId,
                read: false
            })
            .populate('sender', 'name avatar')
            .sort({ createdAt: -1 });
        } catch (error) {
            console.error('Error getting unread notifications:', error);
            throw error;
        }
    },

    async getAllNotifications(userId, page = 1, limit = 20) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new NotFoundError('User not found');
            }

            const skip = (page - 1) * limit;

            const [notifications, total] = await Promise.all([
                Notification.find({ recipient: userId })
                    .populate('sender', 'name avatar')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                Notification.countDocuments({ recipient: userId })
            ]);

            return {
                notifications,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error getting all notifications:', error);
            throw error;
        }
    },

    async markAsRead(notificationId, userId) {
        try {
            const notification = await Notification.findOne({
                _id: notificationId,
                recipient: userId
            });

            if (!notification) {
                throw new NotFoundError('Notification not found');
            }

            if (!notification.read) {
                notification.read = true;
                notification.readAt = new Date();
                await notification.save();

                // Get socket instance
                const io = getIO();

                // Emit updated unread count
                io.to(userId.toString()).emit('notificationUpdate', {
                    unreadCount: await this.getUnreadCount(userId)
                });
            }

            return notification;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    async markAllAsRead(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new NotFoundError('User not found');
            }

            const result = await Notification.updateMany(
                {
                    recipient: userId,
                    read: false
                },
                {
                    read: true,
                    readAt: new Date()
                }
            );

            if (result.modifiedCount > 0) {
                // Get socket instance
                const io = getIO();

                // Emit updated unread count (should be 0)
                io.to(userId.toString()).emit('notificationUpdate', {
                    unreadCount: 0
                });
            }

            return result;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },

    async getUnreadCount(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new NotFoundError('User not found');
            }

            return await Notification.countDocuments({
                recipient: userId,
                read: false
            });
        } catch (error) {
            console.error('Error getting unread notification count:', error);
            throw error;
        }
    },

    async deleteNotification(notificationId, userId) {
        try {
            const notification = await Notification.findOne({
                _id: notificationId,
                recipient: userId
            });

            if (!notification) {
                throw new NotFoundError('Notification not found');
            }

            await notification.remove();

            // Get socket instance
            const io = getIO();

            // Emit updated unread count
            io.to(userId.toString()).emit('notificationUpdate', {
                unreadCount: await this.getUnreadCount(userId)
            });

            return { success: true };
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }
};

module.exports = notificationService;
