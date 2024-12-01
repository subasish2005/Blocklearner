const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['achievement', 'level', 'special', 'engagement', 'skill'],
        required: true
    },
    pointsRequired: {
        type: Number,
        required: true,
        min: 0
    },
    requirements: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    color: {
        type: String,
        default: '#4F46E5' // Default indigo color
    },
    tier: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
        required: true
    },
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    seasonal: {
        type: Boolean,
        default: false
    },
    seasonStart: Date,
    seasonEnd: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
badgeSchema.index({ category: 1, tier: 1 });
badgeSchema.index({ pointsRequired: 1 });
badgeSchema.index({ active: 1, seasonal: 1 });

// Virtuals
badgeSchema.virtual('isAvailable').get(function() {
    if (!this.active) return false;
    if (!this.seasonal) return true;
    
    const now = new Date();
    return (!this.seasonStart || now >= this.seasonStart) && 
           (!this.seasonEnd || now <= this.seasonEnd);
});

// Methods
badgeSchema.methods.checkRequirements = function(user) {
    if (!this.isAvailable) return false;
    if (user.points < this.pointsRequired) return false;

    // Check custom requirements
    for (const [key, value] of this.requirements) {
        switch (key) {
            case 'minLevel':
                if (user.level < value) return false;
                break;
            case 'tasksCompleted':
                if (user.completedTasks < value) return false;
                break;
            case 'friendCount':
                if (user.friends.length < value) return false;
                break;
            // Add more requirement checks as needed
        }
    }

    return true;
};

// Statics
badgeSchema.statics.getAvailableBadges = async function() {
    const now = new Date();
    return this.find({
        active: true,
        $or: [
            { seasonal: false },
            {
                seasonal: true,
                seasonStart: { $lte: now },
                seasonEnd: { $gte: now }
            }
        ]
    });
};

const Badge = mongoose.model('Badge', badgeSchema);

module.exports = Badge;
