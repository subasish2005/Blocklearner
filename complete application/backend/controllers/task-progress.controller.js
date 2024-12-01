const mongoose = require('mongoose');
const GamifiedTask = require('../models/gamified-task.model');
const TaskProgress = require('../models/task-progress.model');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Web3Service = require('../services/web3.service');
const Activity = require('../models/activity.model'); // Assuming Activity model is defined in this file

exports.startTask = catchAsync(async (req, res, next) => {
    const task = await GamifiedTask.findById(req.params.taskId);
    if (!task) {
        return next(new AppError('No task found with that ID', 404));
    }

    // Check if user meets requirements
    if (req.user.level < task.requirements.level) {
        return next(new AppError('You do not meet the level requirement for this task', 403));
    }

    // Check prerequisites
    if (task.requirements.prerequisites?.length > 0) {
        const completedPrereqs = await TaskProgress.countDocuments({
            user: req.user.id,
            task: { $in: task.requirements.prerequisites },
            status: 'completed'
        });

        if (completedPrereqs !== task.requirements.prerequisites.length) {
            return next(new AppError('You have not completed all prerequisites for this task', 403));
        }
    }

    // Create or update task progress
    let progress = await TaskProgress.findOne({
        user: req.user.id,
        task: task._id
    });

    if (!progress) {
        progress = await TaskProgress.create({
            user: req.user.id,
            task: task._id,
            status: 'in_progress'
        });
    }

    await progress.startTask();

    res.status(200).json({
        status: 'success',
        data: { progress }
    });
});

exports.submitTaskProof = catchAsync(async (req, res, next) => {
    const { proof, proofType } = req.body;
    const progress = await TaskProgress.findOne({
        user: req.user.id,
        task: req.params.taskId
    });

    if (!progress) {
        return next(new AppError('No task progress found', 404));
    }

    const task = await GamifiedTask.findById(req.params.taskId);
    if (!task) {
        return next(new AppError('Task not found', 404));
    }

    // Handle automatic verification
    if (task.verification.type === 'automatic') {
        const verified = await verifyAutomaticTask(task, proof);
        if (verified) {
            await progress.verifyTask(null, true, 'Automatically verified');
            await handleRewards(progress, task);
        } else {
            await progress.verifyTask(null, false, 'Automatic verification failed');
        }
    } else {
        // Submit for manual verification
        await progress.submitTask({ proof, proofType });
    }

    res.status(200).json({
        status: 'success',
        data: { progress }
    });
});

exports.submitQuizAnswers = catchAsync(async (req, res, next) => {
    const { answers } = req.body;
    const progress = await TaskProgress.findOne({
        user: req.user.id,
        task: req.params.taskId
    });

    if (!progress) {
        return next(new AppError('No task progress found', 404));
    }

    const task = await GamifiedTask.findById(req.params.taskId);
    if (!task || task.type !== 'quiz') {
        return next(new AppError('Invalid quiz task', 404));
    }

    // Grade the quiz
    const results = task.verification.config.questions.map((q, i) => ({
        questionIndex: i,
        selectedAnswer: answers[i],
        isCorrect: answers[i] === q.correctAnswer
    }));

    const totalCorrect = results.filter(r => r.isCorrect).length;
    const percentageCorrect = (totalCorrect / results.length) * 100;
    const passed = percentageCorrect >= (task.verification.config.passingScore || 70);

    progress.progress.quizAnswers = results;
    await progress.verifyTask(null, passed, `Score: ${percentageCorrect}%`);

    if (passed) {
        await handleRewards(progress, task);
    }

    res.status(200).json({
        status: 'success',
        data: { 
            progress,
            results,
            score: percentageCorrect,
            passed
        }
    });
});

exports.getQuizResults = catchAsync(async (req, res, next) => {
    const progress = await TaskProgress.findOne({
        user: req.user.id,
        task: req.params.taskId
    }).populate('task');

    if (!progress) {
        return next(new AppError('No quiz results found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { 
            answers: progress.progress.quizAnswers,
            status: progress.status
        }
    });
});

exports.verifySubmission = catchAsync(async (req, res, next) => {
    const { success, feedback } = req.body;
    const progress = await TaskProgress.findOne({
        user: req.params.userId,
        task: req.params.taskId,
        status: 'submitted'
    }).populate({
        path: 'task',
        select: 'title points category'
    }).populate('user');

    if (!progress) {
        return next(new AppError('No submission found for verification', 404));
    }

    try {
        await progress.verifyTask(req.user.id, success, feedback);

        if (success) {
            // Update user's task completion count and points
            const updatedUser = await User.findByIdAndUpdate(progress.user._id, {
                $inc: { 
                    tasksCompleted: 1,
                    points: progress.task.points
                }
            }, { new: true });

            // Create activity log
            await Activity.create({
                user: progress.user._id,
                type: 'task_completed',
                task: progress.task._id,
                points: progress.task.points,
                metadata: {
                    taskTitle: progress.task.title,
                    category: progress.task.category
                }
            });
        }

        res.status(200).json({
            status: 'success',
            data: { progress }
        });
    } catch (error) {
        return next(new AppError(error.message || 'Error verifying task', 500));
    }
});

exports.getPendingVerifications = catchAsync(async (req, res) => {
    const pending = await TaskProgress.find({
        status: 'submitted'
    }).populate('user task');

    res.status(200).json({
        status: 'success',
        results: pending.length,
        data: { pending }
    });
});

exports.claimReward = catchAsync(async (req, res, next) => {
    const progress = await TaskProgress.findOne({
        user: req.user.id,
        task: req.params.taskId,
        status: 'completed'
    }).populate('task');

    if (!progress) {
        return next(new AppError('No completed task found to claim reward', 404));
    }

    const unclaimedRewards = progress.rewards.filter(r => !r.claimedAt);
    if (unclaimedRewards.length === 0) {
        return next(new AppError('All rewards for this task have been claimed', 400));
    }

    // Process each unclaimed reward
    for (const reward of unclaimedRewards) {
        switch (reward.type) {
            case 'nft':
                const txHash = await Web3Service.mintNFT(
                    req.user.walletAddress,
                    reward.nftMetadata
                );
                reward.transactionHash = txHash;
                break;
            case 'token':
                const transferTx = await Web3Service.transferTokens(
                    req.user.walletAddress,
                    reward.amount,
                    reward.tokenAddress
                );
                reward.transactionHash = transferTx;
                break;
            case 'role':
                // Handle Discord role assignment
                await handleDiscordRole(req.user.discordId, reward.roleId);
                break;
        }
        reward.claimedAt = new Date();
    }

    await progress.save();

    res.status(200).json({
        status: 'success',
        data: { 
            progress,
            claimedRewards: unclaimedRewards
        }
    });
});

exports.getUserRewards = catchAsync(async (req, res) => {
    const rewards = await TaskProgress.find({
        user: req.user.id,
        status: 'completed'
    }).populate('task');

    res.status(200).json({
        status: 'success',
        data: { rewards }
    });
});

exports.getUnclaimedRewards = catchAsync(async (req, res) => {
    const progress = await TaskProgress.find({
        user: req.user.id,
        status: 'completed',
        'rewards.claimedAt': { $exists: false }
    }).populate('task');

    res.status(200).json({
        status: 'success',
        data: { progress }
    });
});

exports.getAllUserProgress = catchAsync(async (req, res) => {
    const progress = await TaskProgress.find({
        user: req.user.id
    }).populate({
        path: 'task',
        select: 'title description type category difficulty points verification rewards requirements',
        options: { lean: true }
    }).lean();

    // Filter out any progress entries where the task no longer exists
    const validProgress = progress.filter(p => p.task);

    res.status(200).json({
        status: 'success',
        results: validProgress.length,
        data: { progress: validProgress }
    });
});

exports.getTaskProgress = catchAsync(async (req, res, next) => {
    const progress = await TaskProgress.findOne({
        user: req.user.id,
        task: req.params.taskId
    }).populate('task');

    if (!progress) {
        // If no progress exists, return empty progress data
        const task = await GamifiedTask.findById(req.params.taskId);
        if (!task) {
            return next(new AppError('Task not found', 404));
        }

        return res.status(200).json({
            status: 'success',
            data: {
                progress: {
                    user: req.user.id,
                    task: task,
                    status: 'not_started',
                    points: 0,
                    attempts: [],
                    streakCount: 0,
                    lastAttemptAt: null
                }
            }
        });
    }

    res.status(200).json({
        status: 'success',
        data: { progress }
    });
});

// Helper functions
const verifyAutomaticTask = async (task, proof) => {
    switch (task.verification.config.platform) {
        case 'discord':
            return await verifyDiscordTask(proof);
        case 'twitter':
            return await verifyTwitterTask(proof);
        case 'github':
            return await verifyGithubTask(proof);
        default:
            return false;
    }
};

const handleRewards = async (progress, task) => {
    // Calculate points based on task difficulty and user's streak
    let pointMultiplier = 1;
    if (progress.streakCount > 0) {
        pointMultiplier = 1 + (Math.min(progress.streakCount, 7) * 0.1); // Max 1.7x multiplier
    }

    const points = Math.round(task.points * pointMultiplier);

    // Add points to the current attempt
    const currentAttempt = progress.attempts[progress.attempts.length - 1];
    currentAttempt.points = points;

    // Add rewards
    progress.rewards.push(...task.rewards);

    // Update user's total points and level
    await User.findByIdAndUpdate(progress.user, {
        $inc: { 
            totalPoints: points,
            tasksCompleted: 1
        }
    });

    await progress.updateStreak();
    await progress.save();
};
