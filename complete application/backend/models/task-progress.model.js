const mongoose = require('mongoose');

const taskProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GamifiedTask',
        required: true
    },
    points: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['not_started', 'in_progress', 'submitted', 'verified', 'rejected', 'completed'],
        default: 'not_started'
    },
    progress: {
        currentStep: Number,
        totalSteps: Number,
        quizAnswers: [{
            questionIndex: Number,
            selectedAnswer: Number,
            isCorrect: Boolean
        }],
        submission: {
            proof: String,
            proofType: {
                type: String,
                enum: ['screenshot', 'link', 'text', 'file']
            },
            submittedAt: Date,
            verifiedAt: Date,
            verifiedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    },
    attempts: [{
        startedAt: Date,
        completedAt: Date,
        success: Boolean,
        points: Number,
        feedback: String
    }],
    rewards: [{
        type: {
            type: String,
            enum: ['points', 'nft', 'token', 'badge', 'role']
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
        roleId: String,
        claimedAt: Date,
        transactionHash: String
    }],
    streakCount: {
        type: Number,
        default: 0
    },
    lastActivityAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
taskProgressSchema.index({ user: 1, task: 1 }, { unique: true });
taskProgressSchema.index({ status: 1 });
taskProgressSchema.index({ 'rewards.claimedAt': 1 });
taskProgressSchema.index({ lastActivityAt: 1 });

// Update lastActivityAt on any modification
taskProgressSchema.pre('save', function(next) {
    this.lastActivityAt = new Date();
    next();
});

// Methods to handle task progression
taskProgressSchema.methods.startTask = function() {
    const attempt = {
        startedAt: new Date(),
        success: false
    };
    this.attempts.push(attempt);
    this.status = 'in_progress';
    return this.save();
};

taskProgressSchema.methods.submitTask = function(submission) {
    this.progress.submission = {
        ...submission,
        submittedAt: new Date()
    };
    this.status = 'submitted';
    return this.save();
};

taskProgressSchema.methods.verifyTask = async function(verifierId, success, feedback) {
    // Ensure task is populated
    if (!this.populated('task')) {
        await this.populate({
            path: 'task',
            select: 'title points category'
        });
    }

    // Ensure we have task points
    if (!this.task || typeof this.task.points !== 'number') {
        throw new Error('Task points not properly configured');
    }

    const currentAttempt = {
        startedAt: this.updatedAt,
        completedAt: new Date(),
        success: success,
        feedback: feedback,
        points: success ? this.task.points : 0
    };

    if (success) {
        this.status = 'completed';
        this.points = this.task.points;
        this.progress.submission.verifiedAt = new Date();
        this.progress.submission.verifiedBy = verifierId;
    } else {
        this.status = 'rejected';
        this.points = 0;
    }

    this.attempts.push(currentAttempt);
    return this.save();
};

taskProgressSchema.methods.updateStreak = function() {
    // Update streak based on task completion
    const lastAttempt = this.attempts[this.attempts.length - 1];
    if (lastAttempt && lastAttempt.success) {
        this.streakCount += 1;
    } else {
        this.streakCount = 0;
    }
    return this.save();
};

const TaskProgress = mongoose.model('TaskProgress', taskProgressSchema);

module.exports = TaskProgress;
