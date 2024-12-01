const express = require('express');
const passport = require('passport');
const { validateRequest } = require('../../middlewares/validate');
const userController = require('../../controllers/user.controller');
const { protect, restrictTo } = require('../../middlewares/auth');
const { uploadAvatar } = require('../../middlewares/upload');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Routes accessible by logged-in users
router.get('/me', userController.getMe);
router.patch(
    '/update-me',
    validateRequest(userController.updateUserValidation),
    userController.updateMe
);
router.delete('/delete-me', userController.deleteMe);
router.patch(
    '/settings',
    validateRequest(userController.updateSettingsValidation),
    userController.updateSettings
);

// Avatar upload route
router.post('/upload-avatar', uploadAvatar, userController.uploadAvatar);

// Profile routes
router.get('/profile/:userId', userController.getProfile);
router.patch(
    '/profile/social-links',
    validateRequest(userController.updateSocialLinksValidation),
    userController.updateSocialLinks
);
router.patch(
    '/profile/bio',
    validateRequest(userController.updateBioValidation),
    userController.updateBio
);

// Achievement and activity routes
router.get('/achievements/progress', userController.getAchievementProgress);
router.get('/activity-log', userController.getActivityLog);

// Security routes
router.get('/security-log', userController.getSecurityLog);

// Get user achievements
router.get('/achievements/:userId', userController.getUserAchievements);

// Badge and points routes
router.get('/badges', userController.getBadges);
router.get('/points-history', userController.getPointsHistory);
router.get('/leaderboard', userController.getLeaderboard);

// Search users
router.get('/search', userController.searchUsers);

// Admin only routes
router.use(restrictTo('admin'));

router.route('/')
    .get(userController.getAllUsers)
    .post(validateRequest(userController.createUserValidation), userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .patch(validateRequest(userController.updateUserValidation), userController.updateUser)
    .delete(userController.deleteUser);

router.patch(
    '/:id/status',
    validateRequest(userController.updateUserStatusValidation),
    userController.updateUserStatus
);

router.patch(
    '/:id/role',
    validateRequest(userController.updateUserRoleValidation),
    userController.updateUserRole
);

// Statistics routes (admin only)
router.get('/stats/overview', userController.getUserStats);
router.get('/stats/activity', userController.getUserActivity);
router.get('/stats/growth', userController.getUserGrowth);

module.exports = router;
