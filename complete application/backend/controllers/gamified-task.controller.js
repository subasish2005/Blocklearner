const GamifiedTask = require('../models/gamified-task.model');
const TaskProgress = require('../models/task-progress.model');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createTask = catchAsync(async (req, res) => {
    const task = await GamifiedTask.create({
        ...req.body,
        createdBy: req.user.id
    });

    res.status(201).json({
        status: 'success',
        data: { task }
    });
});

exports.getAllTasks = catchAsync(async (req, res) => {
    const tasks = await GamifiedTask.find({ isActive: true })
        .sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: tasks.length,
        data: { tasks }
    });
});

exports.getAvailableTasks = catchAsync(async (req, res) => {
    // Get user's level and completed tasks
    const userProgress = await TaskProgress.find({ 
        user: req.user.id,
        status: 'completed'
    }).select('task');
    
    const completedTaskIds = userProgress.map(p => p.task);
    
    // Find tasks that:
    // 1. Are active
    // 2. User meets level requirement
    // 3. User hasn't completed (unless task is repeatable)
    // 4. User has completed all prerequisites
    const tasks = await GamifiedTask.find({
        isActive: true,
        'requirements.level': { $lte: req.user.level || 0 },
        $or: [
            { _id: { $nin: completedTaskIds } },
            { 'timeConstraints.repeatInterval': { $ne: 'none' } }
        ]
    }).sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: tasks.length,
        data: { tasks }
    });
});

exports.getTaskById = catchAsync(async (req, res, next) => {
    const task = await GamifiedTask.findById(req.params.taskId);

    if (!task) {
        return next(new AppError('No task found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { task }
    });
});

exports.updateTask = catchAsync(async (req, res, next) => {
    const task = await GamifiedTask.findByIdAndUpdate(
        req.params.taskId,
        {
            ...req.body,
            updatedBy: req.user.id
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!task) {
        return next(new AppError('No task found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { task }
    });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
    const task = await GamifiedTask.findByIdAndDelete(req.params.taskId);

    if (!task) {
        return next(new AppError('No task found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getCategories = catchAsync(async (req, res) => {
    const categories = await GamifiedTask.distinct('category');

    res.status(200).json({
        status: 'success',
        data: { categories }
    });
});

exports.getTasksByCategory = catchAsync(async (req, res) => {
    const tasks = await GamifiedTask.find({
        category: req.params.category,
        isActive: true
    }).sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: tasks.length,
        data: { tasks }
    });
});

exports.getLeaderboard = catchAsync(async (req, res) => {
    const leaderboard = await User.aggregate([
        {
            $lookup: {
                from: 'taskprogresses',
                localField: '_id',
                foreignField: 'user',
                as: 'progress'
            }
        },
        {
            $project: {
                username: 1,
                name: 1,
                level: 1,
                avatar: 1,
                totalPoints: { $sum: '$progress.points' },
                completedTasks: {
                    $size: {
                        $filter: {
                            input: '$progress',
                            as: 'prog',
                            cond: { $eq: ['$$prog.status', 'completed'] }
                        }
                    }
                },
                lastActive: { $max: '$progress.updatedAt' }
            }
        },
        { $sort: { totalPoints: -1, completedTasks: -1 } },
        { $limit: 100 }
    ]);

    res.status(200).json({
        status: 'success',
        data: { leaderboard }
    });
});

exports.getUserStats = catchAsync(async (req, res) => {
    const userId = req.params.userId;

    const stats = await TaskProgress.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalPoints: { $sum: '$points' },
                completedTasks: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                totalAttempts: { $sum: 1 },
                streakCount: { $max: '$streakCount' }
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: { stats: stats[0] || {} }
    });
});

exports.getGlobalStats = catchAsync(async (req, res) => {
    const [taskStats, userStats] = await Promise.all([
        // Task statistics
        TaskProgress.aggregate([
            {
                $group: {
                    _id: null,
                    totalAttempts: { $sum: 1 },
                    completedTasks: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    totalPoints: { $sum: '$points' },
                    averageCompletionRate: {
                        $avg: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    }
                }
            }
        ]),
        // User statistics
        User.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    averageLevel: { $avg: '$level' },
                    maxLevel: { $max: '$level' }
                }
            }
        ])
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            tasks: taskStats[0] || {
                totalAttempts: 0,
                completedTasks: 0,
                totalPoints: 0,
                averageCompletionRate: 0
            },
            users: userStats[0] || {
                totalUsers: 0,
                averageLevel: 0,
                maxLevel: 0
            }
        }
    });
});

exports.getTaskAnalytics = catchAsync(async (req, res, next) => {
    const taskId = req.params.taskId;

    const analytics = await TaskProgress.aggregate([
        { $match: { task: mongoose.Types.ObjectId(taskId) } },
        {
            $group: {
                _id: null,
                totalAttempts: { $sum: 1 },
                completions: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                averageAttempts: { $avg: { $size: '$attempts' } },
                totalPoints: { $sum: '$points' }
            }
        }
    ]);

    if (!analytics.length) {
        return next(new AppError('No analytics found for this task', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { analytics: analytics[0] }
    });
});

exports.updateTaskConfig = catchAsync(async (req, res, next) => {
    const task = await GamifiedTask.findByIdAndUpdate(
        req.params.taskId,
        {
            verification: req.body.verification,
            requirements: req.body.requirements,
            timeConstraints: req.body.timeConstraints,
            points: req.body.points,
            updatedBy: req.user.id
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!task) {
        return next(new AppError('No task found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { task }
    });
});
