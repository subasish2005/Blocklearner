const Task = require('../models/task.model');
const User = require('../models/user.model');
const Badge = require('../models/badge.model');
const AppError = require('../utils/appError');
const { filterObj } = require('../utils/helpers');

// Create Task
exports.createTask = async (req, res, next) => {
    try {
        const filteredBody = filterObj(
            req.body,
            'title',
            'description',
            'dueDate',
            'priority',
            'category',
            'tags',
            'difficulty',
            'points'
        );
        
        // Validate dueDate
        if (filteredBody.dueDate && new Date(filteredBody.dueDate) < new Date()) {
            return next(new AppError('Due date cannot be in the past', 400));
        }

        filteredBody.creator = req.user.id;
        filteredBody.assignedTo = req.user.id; // Self-assign by default
        
        const task = await Task.create(filteredBody);

        res.status(201).json({
            status: 'success',
            data: { task }
        });
    } catch (error) {
        next(error);
    }
};

// Get All Tasks
exports.getAllTasks = async (req, res, next) => {
    try {
        // Build query
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(field => delete queryObj[field]);

        // Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        let query = Task.find(JSON.parse(queryStr))
            .populate('creator', 'name avatar')
            .populate('assignedTo', 'name avatar');

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        // Execute query
        const [tasks, total] = await Promise.all([
            query,
            Task.countDocuments(JSON.parse(queryStr))
        ]);

        res.status(200).json({
            status: 'success',
            results: tasks.length,
            total,
            data: { tasks }
        });
    } catch (error) {
        next(error);
    }
};

// Get My Tasks
exports.getMyTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find({
            $or: [
                { creator: req.user.id },
                { assignedTo: req.user.id }
            ]
        })
        .populate('creator', 'name avatar')
        .populate('assignedTo', 'name avatar')
        .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: tasks.length,
            data: { tasks }
        });
    } catch (error) {
        next(error);
    }
};

// Get Single Task
exports.getTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('creator', 'name avatar')
            .populate('assignedTo', 'name avatar');

        if (!task) {
            return next(new AppError('No task found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { task }
        });
    } catch (error) {
        next(error);
    }
};

// Update Task
exports.updateTask = async (req, res, next) => {
    try {
        const filteredBody = filterObj(
            req.body,
            'title',
            'description',
            'dueDate',
            'priority',
            'category',
            'tags',
            'status',
            'progress'
        );

        // Validate dueDate
        if (filteredBody.dueDate && new Date(filteredBody.dueDate) < new Date()) {
            return next(new AppError('Due date cannot be in the past', 400));
        }

        // If marking as completed
        if (filteredBody.status === 'completed' && !req.body.skipRewards) {
            filteredBody.completedAt = new Date();
            
            // Get the task to calculate points
            const task = await Task.findById(req.params.id);
            if (!task) {
                return next(new AppError('No task found with that ID', 404));
            }

            // Update user points and check for badges
            const user = await User.findById(req.user.id);
            user.points += task.points;
            user.tasksCompleted += 1;

            // Check for badges
            const badges = await Badge.find({
                type: 'task_completion',
                requirement: { $lte: user.tasksCompleted }
            });

            if (badges.length > 0) {
                user.badges.push(...badges.map(badge => badge._id));
            }

            await user.save();
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            filteredBody,
            {
                new: true,
                runValidators: true
            }
        ).populate('creator', 'name avatar')
         .populate('assignedTo', 'name avatar');

        if (!updatedTask) {
            return next(new AppError('No task found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { task: updatedTask }
        });
    } catch (error) {
        next(error);
    }
};

// Delete Task
exports.deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return next(new AppError('No task found with that ID', 404));
        }

        // Only creator can delete the task
        if (task.creator.toString() !== req.user.id) {
            return next(new AppError('You can only delete tasks that you created', 403));
        }

        await task.remove();

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
};

// Get Task Stats
exports.getTaskStats = async (req, res, next) => {
    try {
        const stats = await Task.aggregate([
            {
                $match: {
                    assignedTo: req.user._id
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalPoints: { $sum: '$points' }
                }
            }
        ]);

        const formattedStats = {
            total: 0,
            completed: 0,
            pending: 0,
            failed: 0,
            in_progress: 0,
            totalPoints: 0
        };

        stats.forEach(stat => {
            formattedStats[stat._id] = stat.count;
            formattedStats.total += stat.count;
            formattedStats.totalPoints += stat.totalPoints;
        });

        // Calculate completion rate
        formattedStats.completionRate = formattedStats.total > 0
            ? Math.round((formattedStats.completed / formattedStats.total) * 100)
            : 0;

        res.status(200).json({
            status: 'success',
            data: { stats: formattedStats }
        });
    } catch (error) {
        next(error);
    }
};
