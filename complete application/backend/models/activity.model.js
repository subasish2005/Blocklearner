const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false // Not required for failed login attempts
        },
        type: {
            type: String,
            required: true,
            enum: [
                // Security activities
                'login',
                'login_failed',
                'logout',
                'oauth_login',
                'oauth_login_failed',
                'password_change',
                'email_change',
                'profile_update',
                'settings_update',
                'account_created',
                'email_verified',
                'password_reset',
                'password_reset_requested',
                'account_deactivated',
                'account_reactivated',
                'two_factor_enabled',
                'two_factor_disabled',
                
                // Social activities
                'friend_request',
                'friend_accept',
                'post',
                'comment',
                'like',
                
                // Achievement activities
                'task_complete',
                'badge_earned',
                'level_up',
                'achievement_unlocked',
                'points_earned'
            ]
        },
        content: {
            type: String,
            required: true
        },
        metadata: {
            type: Object,
            required: false
        },
        relatedUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        isPublic: {
            type: Boolean,
            default: false
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Create indexes for better query performance
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ 'relatedUsers': 1 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
