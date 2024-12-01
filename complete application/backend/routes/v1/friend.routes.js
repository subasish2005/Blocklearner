const express = require('express');
const { protect } = require('../../middlewares/auth');
const friendController = require('../../controllers/friend.controller');
const { validateRequest } = require('../../middlewares/validate');

const router = express.Router();

// Protect all routes
router.use(protect);

// Friend suggestions and discovery
router.get('/suggestions', friendController.getFriendSuggestions);
router.get('/blocked', friendController.getBlockedUsers);
router.get('/activity/weekly', friendController.getWeeklyFriendActivity);
router.get('/mutual/:userId', friendController.getMutualFriends);

// Friend requests
router.get('/requests', friendController.getReceivedFriendRequests); 
router.get('/requests/sent', friendController.getSentFriendRequests);
router.post('/requests/:userId', friendController.sendFriendRequest); 
router.patch('/requests/:userId/respond', friendController.respondToFriendRequest);

// Friend management
router.get('/', friendController.getFriends);
router.delete('/:userId', friendController.removeFriend);
router.post('/block/:userId', friendController.blockUser);
router.delete('/block/:userId', friendController.unblockUser);

// Activity endpoints
router.get('/activities', friendController.getFriendActivities);
router.get('/activities/:userId', friendController.getFriendActivity);
router.post('/activities/:activityId/like', friendController.likeActivity); 
router.post('/activities/:activityId/comment', friendController.commentOnActivity);
router.delete('/activities/:activityId/comment/:commentId', friendController.deleteComment);

module.exports = router;
