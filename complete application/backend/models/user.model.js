const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userBadgeSchema = new mongoose.Schema({
    badgeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge',
        required: true
    },
    dateEarned: {
        type: Date,
        default: Date.now
    },
    displayed: {
        type: Boolean,
        default: true
    }
});

const achievementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    category: {
        type: String,
        required: true,
        enum: ['general', 'social', 'content', 'special']
    },
    progress: {
        current: {
            type: Number,
            default: 0
        },
        target: {
            type: Number,
            required: true
        }
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: Date,
    points: {
        type: Number,
        default: 0
    }
});

const activityLogSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['login', 'achievement', 'friend', 'content', 'profile', 'other']
    },
    description: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true,
        maxLength: [30, 'Username cannot be more than 30 characters']
    },
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true,
        maxLength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId && !this.githubId && this.isNew;
        },
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: function() {
            return !this.googleId && !this.githubId && this.isNew && this.password;
        },
        validate: {
            validator: function(el) {
                return !this.password || el === this.password;
            },
            message: 'Passwords do not match'
        }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    githubId: {
        type: String,
        unique: true,
        sparse: true
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    emailVerified: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    loginAttempts: {
        type: Number,
        default: 0,
        select: false
    },
    locked: {
        type: Boolean,
        default: false,
        select: false
    },
    lockUntil: {
        type: Date,
        select: false
    },
    avatar: {
        type: String,
        default: 'default.jpg'
    },
    bio: {
        type: String,
        default: '',
        maxLength: [500, 'Bio cannot be more than 500 characters']
    },
    location: String,
    website: String,
    level: {
        type: Number,
        default: 1
    },
    points: {
        type: Number,
        default: 0
    },
    badges: [userBadgeSchema],
    achievements: [achievementSchema],
    activityLog: [activityLogSchema],
    walletAddress: {
        type: String,
        unique: true,
        sparse: true
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    friendRequests: [{
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    blockedUsers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: String,
        blockedAt: {
            type: Date,
            default: Date.now
        }
    }],
    notificationPreferences: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        pushNotifications: {
            type: Boolean,
            default: true
        },
        notifyOnNewMessage: {
            type: Boolean,
            default: true
        },
        notifyOnFriendRequest: {
            type: Boolean,
            default: true
        },
        notifyOnFriendAccept: {
            type: Boolean,
            default: true
        },
        notifyOnMention: {
            type: Boolean,
            default: true
        },
        digestFrequency: {
            type: String,
            enum: ['never', 'daily', 'weekly'],
            default: 'daily'
        }
    },
    friendshipSettings: {
        allowFriendRequests: {
            type: Boolean,
            default: true
        },
        showMutualFriends: {
            type: Boolean,
            default: true
        },
        showActivity: {
            type: Boolean,
            default: true
        }
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            }
        }
    },
    socialLinks: {
        github: String,
        linkedin: String,
        twitter: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate tasks
userSchema.virtual('tasks', {
    ref: 'Task',
    foreignField: 'creator',
    localField: '_id'
});

// Virtual populate assigned tasks
userSchema.virtual('assignedTasks', {
    ref: 'Task',
    foreignField: 'assignedTo',
    localField: '_id'
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ githubId: 1 });
userSchema.index({ points: -1 });
userSchema.index({ 'friendRequests.from': 1, 'friendRequests.status': 1 });
userSchema.index({ username: 1 });

// Pre-save middleware
userSchema.pre('save', async function(next) {
    // Only run if password is modified
    if (!this.isModified('password')) return next();

    // Hash password
    this.password = await bcrypt.hash(this.password, 12);

    // Remove passwordConfirm field
    this.passwordConfirm = undefined;

    next();
});

userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();

    // Set passwordChangedAt
    this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after password change
    next();
});

// Query middleware
userSchema.pre(/^find/, function(next) {
    // This points to the current query
    this.find({ active: { $ne: false } });
    next();
});

// Instance methods
userSchema.methods.correctPassword = async function(candidatePassword) {
    try {
        if (!this.password) {
            return false;
        }
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

userSchema.methods.createEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');

    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    return verificationToken;
};

userSchema.methods.addPoints = async function(points) {
    this.points += points;

    // Level up logic (every 1000 points)
    const newLevel = Math.floor(this.points / 1000) + 1;
    if (newLevel > this.level) {
        this.level = newLevel;
    }

    await this.save();
    return this.points;
};

// Friend management methods
userSchema.methods.addFriend = async function(friendId) {
    if (!this.friends.includes(friendId)) {
        this.friends.push(friendId);
        await this.save();
    }
};

userSchema.methods.removeFriend = async function(friendId) {
    this.friends = this.friends.filter(id => id.toString() !== friendId.toString());
    await this.save();
};

userSchema.methods.blockUser = async function(userId, reason = '') {
    if (!this.isBlocked(userId)) {
        this.blockedUsers.push({
            user: userId,
            reason,
            blockedAt: Date.now()
        });
        // Remove from friends if they were friends
        await this.removeFriend(userId);
        // Remove any pending friend requests
        this.friendRequests = this.friendRequests.filter(
            req => req.from.toString() !== userId.toString()
        );
        await this.save();
    }
};

userSchema.methods.unblockUser = async function(userId) {
    this.blockedUsers = this.blockedUsers.filter(
        block => block.user.toString() !== userId.toString()
    );
    await this.save();
};

userSchema.methods.isBlocked = function(userId) {
    return this.blockedUsers.some(block => block.user.toString() === userId.toString());
};

userSchema.methods.hasFriendRequest = function(userId) {
    return this.friendRequests.some(
        req => req.from.toString() === userId.toString() && req.status === 'pending'
    );
};

userSchema.methods.isFriend = function(userId) {
    return this.friends.some(friend => friend.toString() === userId.toString());
};

userSchema.methods.getMutualFriends = async function(userId) {
    const otherUser = await this.model('User').findById(userId).select('friends');
    if (!otherUser) return [];
    
    const mutualFriends = this.friends.filter(friendId => 
        otherUser.friends.some(otherFriendId => 
            otherFriendId.toString() === friendId.toString()
        )
    );
    
    return mutualFriends;
};

userSchema.methods.canReceiveFriendRequest = function(fromUserId) {
    // Ensure friendshipSettings exists and has default values
    if (!this.friendshipSettings) {
        this.friendshipSettings = {
            allowFriendRequests: true,
            showMutualFriends: true,
            showActivity: true
        };
    }
    
    const canReceive = 
        this.friendshipSettings.allowFriendRequests &&
        !this.isBlocked(fromUserId) &&
        !this.isFriend(fromUserId) &&
        !this.hasFriendRequest(fromUserId);
    
    console.log('Can receive friend request check:', {
        allowRequests: this.friendshipSettings.allowFriendRequests,
        isBlocked: this.isBlocked(fromUserId),
        isFriend: this.isFriend(fromUserId),
        hasPendingRequest: this.hasFriendRequest(fromUserId),
        finalResult: canReceive
    });
    
    return canReceive;
};

userSchema.methods.updateLastLogin = async function() {
    this.lastLogin = Date.now();
    this.failedLoginAttempts = 0;
    this.lockUntil = undefined;
    await this.save();
};

userSchema.methods.handleFailedLogin = async function() {
    this.failedLoginAttempts += 1;
    if (this.failedLoginAttempts >= 5) {
        this.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
    }
    await this.save();
};

userSchema.methods.resetFailedLoginAttempts = async function() {
    this.failedLoginAttempts = 0;
    this.lockUntil = undefined;
    await this.save();
};

// Profile management
userSchema.methods.updateProfileCompleteness = function() {
    const fields = ['name', 'email', 'avatar', 'bio', 'location', 'website'];
    const completedFields = fields.filter(field => this[field]);
    this.profileCompleteness = Math.round((completedFields.length / fields.length) * 100);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
