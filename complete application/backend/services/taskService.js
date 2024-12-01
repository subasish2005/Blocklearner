const Task = require('../models/task.model');
const User = require('../models/user.model');
const { getIO } = require('../socket');
const { NotFoundError, AuthorizationError, ValidationError } = require('../utils/appError');

class TaskService {
    // Create a new task (moderator only)
    async createTask(taskData, moderatorId) {
        try {
            const moderator = await User.findById(moderatorId);
            if (!moderator || !['admin', 'moderator'].includes(moderator.role)) {
                throw new AuthorizationError('Only moderators can create tasks');
            }

            const task = new Task({
                ...taskData,
                createdBy: moderatorId
            });
            await task.save();

            // Get socket instance
            const io = getIO();

            // Notify all users about new task
            io.emit('newTask', {
                message: `New task available: ${task.title}`,
                taskId: task._id,
                task: {
                    _id: task._id,
                    title: task.title,
                    points: task.points,
                    deadline: task.deadline
                }
            });

            return task;
        } catch (error) {
            throw error;
        }
    }

    // Get all tasks with filters
    async getTasks(filters = {}, userId) {
        try {
            const query = { ...filters };
            const tasks = await Task.find(query)
                .populate('createdBy', 'name')
                .sort({ createdAt: -1 });

            // Add completion status for the requesting user
            const tasksWithStatus = tasks.map(task => {
                const userSubmission = task.completedBy.find(
                    completion => completion.user.toString() === userId?.toString()
                );
                return {
                    ...task.toObject(),
                    isCompleted: !!userSubmission,
                    userSubmission: userSubmission || null
                };
            });

            return tasksWithStatus;
        } catch (error) {
            throw error;
        }
    }

    // Submit task completion
    async submitTask(taskId, userId, submission) {
        try {
            const task = await Task.findById(taskId);
            if (!task) {
                throw new NotFoundError('Task not found');
            }

            const user = await User.findById(userId);
            if (!user) {
                throw new NotFoundError('User not found');
            }

            // Check if task deadline has passed
            if (task.deadline && new Date(task.deadline) < new Date()) {
                throw new ValidationError('Task deadline has passed');
            }

            // Check if user has already submitted
            const existingSubmission = task.completedBy.find(
                completion => completion.user.toString() === userId.toString()
            );

            if (existingSubmission) {
                throw new ValidationError('You have already submitted this task');
            }

            // Add submission
            task.completedBy.push({
                user: userId,
                submission,
                submittedAt: new Date()
            });

            await task.save();

            // Award points to user
            await user.addPoints(task.points);

            // Get socket instance
            const io = getIO();

            // Notify moderators about new submission
            io.to('role:moderator').to('role:admin').emit('taskSubmission', {
                message: `New submission for task: ${task.title}`,
                taskId: task._id,
                userId: user._id,
                userName: user.name
            });

            return task;
        } catch (error) {
            throw error;
        }
    }

    // Review task submission (moderator only)
    async reviewSubmission(taskId, userId, { approved, feedback }, moderatorId) {
        try {
            const moderator = await User.findById(moderatorId);
            if (!moderator || !['admin', 'moderator'].includes(moderator.role)) {
                throw new AuthorizationError('Only moderators can review submissions');
            }

            const task = await Task.findById(taskId);
            if (!task) {
                throw new NotFoundError('Task not found');
            }

            const submission = task.completedBy.find(
                completion => completion.user.toString() === userId.toString()
            );

            if (!submission) {
                throw new NotFoundError('Submission not found');
            }

            // Update submission
            submission.reviewed = true;
            submission.approved = approved;
            submission.feedback = feedback;
            submission.reviewedBy = moderatorId;
            submission.reviewedAt = new Date();

            await task.save();

            // Get socket instance
            const io = getIO();

            // Notify user about review
            io.to(userId.toString()).emit('taskReviewed', {
                message: `Your submission for "${task.title}" has been reviewed`,
                taskId: task._id,
                approved,
                feedback
            });

            return task;
        } catch (error) {
            throw error;
        }
    }

    // Get user's task submissions
    async getUserSubmissions(userId) {
        try {
            const tasks = await Task.find({
                'completedBy.user': userId
            }).populate('createdBy', 'name');
            return tasks;
        } catch (error) {
            throw error;
        }
    }

    // Get task statistics
    async getTaskStats() {
        try {
            const stats = await Task.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalPoints: { $sum: '$points' }
                    }
                }
            ]);
            return stats;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new TaskService();
