const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['automatic', 'manual', 'quiz'],
        required: true
    },
    config: {
        // For automatic verification (e.g., social media checks)
        platform: {
            type: String,
            enum: ['discord', 'twitter', 'telegram', 'github', 'other']
        },
        // For quiz verification
        questions: [{
            question: String,
            options: [String],
            correctAnswer: Number,
            points: Number
        }],
        // For manual verification
        requiredProof: {
            type: String,
            enum: ['screenshot', 'link', 'text', 'file']
        },
        instructions: String
    }
});

const rewardSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['points', 'nft', 'token', 'badge', 'role'],
        required: true
    },
    amount: Number,
    tokenAddress: String,
    nftMetadata: {
        contractAddress: String,
        tokenId: String,
        chain: String
    },
    badgeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge'
    },
    roleId: String
});

const milestoneSchema = new mongoose.Schema({
    title: String,
    description: String,
    requiredTasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GamifiedTask'
    }],
    reward: rewardSchema
});

const gamifiedTaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A task must have a title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'A task must have a description'],
        trim: true
    },
    type: {
        type: String,
        enum: ['simple', 'quiz', 'submission', 'feedback', 'milestone'],
        required: true
    },
    category: {
        type: String,
        enum: ['onboarding', 'social', 'community', 'technical', 'feedback', 'special'],
        required: true
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    points: {
        type: Number,
        required: true,
        min: 0
    },
    verification: verificationSchema,
    rewards: [rewardSchema],
    requirements: {
        level: {
            type: Number,
            default: 0
        },
        roles: [String],
        prerequisites: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GamifiedTask'
        }]
    },
    timeConstraints: {
        startDate: Date,
        endDate: Date,
        repeatInterval: {
            type: String,
            enum: ['none', 'daily', 'weekly', 'monthly']
        }
    },
    engagement: {
        totalAttempts: {
            type: Number,
            default: 0
        },
        successfulCompletions: {
            type: Number,
            default: 0
        },
        averageCompletionTime: Number
    },
    milestones: [milestoneSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
gamifiedTaskSchema.index({ category: 1, type: 1, isActive: 1 });
gamifiedTaskSchema.index({ 'requirements.level': 1 });
gamifiedTaskSchema.index({ 'timeConstraints.startDate': 1, 'timeConstraints.endDate': 1 });

const GamifiedTask = mongoose.model('GamifiedTask', gamifiedTaskSchema);

module.exports = GamifiedTask;
