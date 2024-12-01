const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/notification.controller');
const authController = require('../../controllers/auth.controller');

// Protect all routes
router.use(authController.protect);

// Get my notifications with pagination and filters
router.get('/my', notificationController.getMyNotifications);

// Get unread notification count
router.get('/unread-count', notificationController.getUnreadCount);

// Get notification preferences
router.get('/preferences', notificationController.getNotificationPreferences);

// Update notification preferences
router.patch('/preferences', notificationController.updateNotificationPreferences);

// Mark notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', notificationController.markAllAsRead);

// Delete a notification
router.delete('/:id', notificationController.deleteNotification);

// Clear old notifications
router.delete('/clear-old', notificationController.clearOldNotifications);

module.exports = router;
