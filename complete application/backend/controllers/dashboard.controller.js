const User = require('../models/user.model');
const TaskProgress = require('../models/task-progress.model');
const GamifiedTask = require('../models/gamified-task.model');
const Activity = require('../models/activity.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

// Get dashboard stats
exports.getDashboardStats = catchAsync(async (req, res, next) => {
    try {
        console.log('Received request for dashboard stats');
        
        // Check if user is authenticated
        if (!req.user || !req.user._id) {
            console.log('User not authenticated');
            return next(new AppError('User not authenticated', 401));
        }

        const userId = new mongoose.Types.ObjectId(req.user._id);
        console.log('Fetching stats for user:', userId);

        // Get task statistics
        const taskStats = await TaskProgress.aggregate([
            { 
                $match: { 
                    user: userId 
                } 
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalPoints: { $sum: '$points' }
                }
            }
        ]).exec();

        // Get user details with badges
        const userStats = await User.findById(userId)
            .select('points tasksCompleted badges')
            .populate('badges', 'name description icon')
            .exec();

        if (!userStats) {
            return next(new AppError('User not found', 404));
        }

        // Format task stats
        const stats = {
            tasks: {
                total: 0,
                not_started: 0,
                in_progress: 0,
                submitted: 0,
                verified: 0,
                rejected: 0,
                completed: 0
            },
            points: userStats.points || 0,
            tasksCompleted: userStats.tasksCompleted || 0,
            badges: userStats.badges || [],
            totalPoints: 0,
            completionRate: 0
        };

        // Calculate task stats
        taskStats.forEach(stat => {
            if (stat._id) {
                const status = stat._id.toLowerCase();
                if (stats.tasks.hasOwnProperty(status)) {
                    stats.tasks[status] = stat.count;
                    stats.tasks.total += stat.count;
                    if (status === 'completed') {
                        stats.tasksCompleted = stat.count;
                        stats.totalPoints += stat.totalPoints || 0;
                    }
                }
            }
        });

        // Calculate completion rate
        stats.completionRate = stats.tasks.total > 0
            ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
            : 0;

        // Get recent activity
        const recentActivity = await TaskProgress.find({
            user: userId,
            status: 'completed'
        })
        .sort('-updatedAt')
        .limit(5)
        .populate('task', 'title points')
        .select('task points progress.submission.verifiedAt updatedAt')
        .exec();

        stats.recentActivity = recentActivity.map(activity => ({
            title: activity.task?.title || 'Unknown Task',
            points: activity.points || 0,
            completedAt: activity.progress?.submission?.verifiedAt || activity.updatedAt
        }));

        res.status(200).json({
            status: 'success',
            data: {
                stats,
                taskProgress: recentActivity
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        next(new AppError('Error fetching dashboard stats', 500));
    }
});

// Get dashboard progress
exports.getDashboardProgress = catchAsync(async (req, res) => {
    try {
        const userId = req.user._id;

        // First, let's check if we have any tasks for this user
        const allTasks = await TaskProgress.find({ user: userId }).lean();
        console.log('User ID:', userId);
        console.log('All tasks for user:', JSON.stringify(allTasks, null, 2));

        // Get user's overall progress
        const progress = await TaskProgress.aggregate([
            { 
                $match: { 
                    user: userId 
                } 
            },
            {
                $group: {
                    _id: null,
                    completedTasks: {
                        $sum: { 
                            $cond: [
                                { $in: ["$status", ["completed", "verified"]] },
                                1,
                                0
                            ]
                        }
                    },
                    totalTasks: { $sum: 1 },
                    averageScore: { $avg: "$points" }
                }
            }
        ]);

        console.log('Aggregation result:', JSON.stringify(progress, null, 2));

        // Calculate progress percentage
        const result = progress[0] || {
            completedTasks: 0,
            totalTasks: 0,
            averageScore: 0
        };

        const progressPercentage = result.totalTasks > 0
            ? (result.completedTasks / result.totalTasks) * 100
            : 0;

        const finalResult = {
            ...result,
            progressPercentage: Math.round(progressPercentage)
        };

        console.log('Final result:', JSON.stringify(finalResult, null, 2));

        res.status(200).json({
            status: 'success',
            data: finalResult
        });
    } catch (error) {
        console.error('Error in getDashboardProgress:', error);
        throw error;
    }
});

// Get weekly activity
exports.getWeeklyActivity = catchAsync(async (req, res) => {
    try {
        const userId = req.user._id;
        const today = new Date();
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const weeklyActivity = await Activity.aggregate([
            {
                $match: {
                    user: userId,
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: weeklyActivity
        });
    } catch (error) {
        console.error('Error in getWeeklyActivity:', error);
        throw error;
    }
});

// Get recommended tasks
exports.getRecommendedTasks = catchAsync(async (req, res) => {
    try {
        const userId = req.user._id;

        // Get user's completed tasks
        const completedTasks = await TaskProgress.find({
            user: userId,
            status: 'completed'
        }).select('task');

        // Get completed task IDs
        const completedTaskIds = completedTasks.map(task => task.task);

        // Find tasks that user hasn't completed yet
        const recommendedTasks = await GamifiedTask.find({
            _id: { $nin: completedTaskIds },
            isActive: true,
            'requirements.level': { $lte: req.user.level || 0 }
        })
        .limit(5)
        .select('-__v');

        res.status(200).json({
            status: 'success',
            data: recommendedTasks
        });
    } catch (error) {
        console.error('Error in getRecommendedTasks:', error);
        throw error;
    }
});
