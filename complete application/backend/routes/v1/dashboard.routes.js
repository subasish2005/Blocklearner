const express = require('express');
const { protect } = require('../../middlewares/auth');
const dashboardController = require('../../controllers/dashboard.controller');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get dashboard data
router.get('/stats', dashboardController.getDashboardStats);
router.get('/activity', dashboardController.getWeeklyActivity);
router.get('/recommended', dashboardController.getRecommendedTasks);
router.get('/progress', dashboardController.getDashboardProgress);


module.exports = router;
