const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A notification must have a recipient']
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A notification must have a sender']
    },
    title: {
        type: String,
        required: [true, 'A notification must have a title']
    },
    message: {
        type: String,
        required: [true, 'A notification must have a message']
    },
    type: {
        type: String,
        enum: ['achievement', 'task', 'system', 'level_up', 'badge', 'friend_request', 'friend_accept', 'new_task', 'task_completed'],
        required: [true, 'A notification must have a type']
    },
    read: {
        type: Boolean,
        default: false
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    expiresAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, recipient: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
