const express = require('express');
const { protect, restrictTo } = require('../../middlewares/auth');
const { validateRequest } = require('../../middlewares/validate');
const gamifiedTaskController = require('../../controllers/gamified-task.controller');
const taskProgressController = require('../../controllers/task-progress.controller');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Static routes (no parameters)
router.get('/', gamifiedTaskController.getAllTasks);
router.get('/available', gamifiedTaskController.getAvailableTasks);
router.get('/categories', gamifiedTaskController.getCategories);
router.get('/leaderboard', gamifiedTaskController.getLeaderboard);
router.get('/stats/global', gamifiedTaskController.getGlobalStats);

// Progress and rewards routes
router.get('/progress', taskProgressController.getAllUserProgress);
router.get('/progress/:taskId', taskProgressController.getTaskProgress);
router.get('/rewards', taskProgressController.getUserRewards);
router.get('/rewards/unclaimed', taskProgressController.getUnclaimedRewards);

// Category routes
router.get('/category/:category', gamifiedTaskController.getTasksByCategory);

// Quiz routes
router.get('/quiz/:taskId/results', taskProgressController.getQuizResults);
router.post('/quiz/:taskId/submit', taskProgressController.submitQuizAnswers);

// Task-specific routes
router.get('/stats/:userId', gamifiedTaskController.getUserStats);
router.get('/:taskId', gamifiedTaskController.getTaskById);
router.post('/:taskId/start', taskProgressController.startTask);
router.post('/:taskId/submit', taskProgressController.submitTaskProof);
router.post('/:taskId/claim-reward', taskProgressController.claimReward);

// Admin only routes
router.use(restrictTo('admin'));

router.post('/', gamifiedTaskController.createTask);
router.patch('/:taskId', gamifiedTaskController.updateTask);
router.delete('/:taskId', gamifiedTaskController.deleteTask);

// Admin verification routes
router.get('/admin/pending-verifications', taskProgressController.getPendingVerifications);
router.post('/admin/verify/:taskId/:userId', taskProgressController.verifySubmission);
router.get('/admin/analytics/:taskId', gamifiedTaskController.getTaskAnalytics);
router.patch('/admin/config/:taskId', gamifiedTaskController.updateTaskConfig);

module.exports = router;
