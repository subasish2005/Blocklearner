const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const AppError = require('../utils/appError');
const { filterObj } = require('../utils/helpers');
const Activity = require('../models/activity.model');

// Send friend request
module.exports.sendFriendRequest = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const fromUserId = req.user.id;

        // Debug logs
        console.log('From User ID:', fromUserId);
        console.log('To User ID:', userId);

        // Check if target user exists
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return next(new AppError('User not found', 404));
        }

        console.log('Target user found:', targetUser.name);
        
        // Check specific conditions
        if (!targetUser.friendshipSettings?.allowFriendRequests) {
            return next(new AppError('User is not accepting friend requests at this time', 400));
        }

        if (targetUser.isBlocked(fromUserId)) {
            return next(new AppError('Unable to send friend request', 400));
        }

        if (targetUser.isFriend(fromUserId)) {
            return next(new AppError('You are already friends with this user', 400));
        }

        if (targetUser.hasFriendRequest(fromUserId)) {
            return next(new AppError('A friend request is already pending', 400));
        }

        // Add friend request
        targetUser.friendRequests.push({
            from: fromUserId,
            status: 'pending'
        });
        await targetUser.save();

        // Create notification
        await Notification.create({
            recipient: userId,
            sender: fromUserId,
            title: 'New Friend Request',
            message: `${req.user.name} sent you a friend request`,
            type: 'friend_request'
        });

        res.status(200).json({
            status: 'success',
            message: 'Friend request sent successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Respond to friend request
module.exports.respondToFriendRequest = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { action } = req.body;

        if (!['accept', 'reject'].includes(action)) {
            return next(new AppError('Invalid action. Must be either accept or reject', 400));
        }

        const currentUser = await User.findById(req.user.id);
        const requestingUser = await User.findById(userId);

        if (!currentUser || !requestingUser) {
            return next(new AppError('User not found', 404));
        }

        // Find the friend request
        const friendRequest = currentUser.friendRequests.find(
            req => req.from.toString() === userId && req.status === 'pending'
        );

        if (!friendRequest) {
            return next(new AppError('Friend request not found', 404));
        }

        if (action === 'accept') {
            // Add each user to the other's friends list
            currentUser.friends.push(userId);
            requestingUser.friends.push(currentUser._id);

            // Create notification for request acceptance
            await Notification.create({
                recipient: userId,
                sender: currentUser._id,
                title: 'Friend Request Accepted',
                message: `${currentUser.name} accepted your friend request`,
                type: 'friend_accept'
            });
        }

        // Update request status
        friendRequest.status = action === 'accept' ? 'accepted' : 'rejected';

        // Save both users
        await Promise.all([currentUser.save(), requestingUser.save()]);

        res.status(200).json({
            status: 'success',
            message: `Friend request ${action}ed successfully`
        });
    } catch (error) {
        next(error);
    }
};

// Get friend list
module.exports.getFriends = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('friends', 'username email avatar walletAddress level points status bio location socialLinks');

        res.status(200).json({
            status: 'success',
            data: {
                friends: user.friends
            }
        });
    } catch (error) {
        next(error);
    }
};

// Remove friend
module.exports.removeFriend = async (req, res, next) => {
    try {
        const { userId } = req.params;
        console.log('Removing friend - User ID:', userId);
        console.log('Current user ID:', req.user.id);

        const currentUser = await User.findById(req.user.id);
        const friendUser = await User.findById(userId);

        console.log('Current user found:', !!currentUser);
        console.log('Friend user found:', !!friendUser);

        if (!currentUser || !friendUser) {
            return next(new AppError('User not found', 404));
        }

        // Check if they are actually friends
        const areFriends = currentUser.friends.some(friend => friend.toString() === userId);
        console.log('Are they friends?', areFriends);

        if (!areFriends) {
            return next(new AppError('You are not friends with this user', 400));
        }

        // Remove from each other's friend lists
        currentUser.friends = currentUser.friends.filter(
            friend => friend.toString() !== userId
        );
        friendUser.friends = friendUser.friends.filter(
            friend => friend.toString() !== currentUser._id.toString()
        );

        // Save both users
        await Promise.all([currentUser.save(), friendUser.save()]);

        // Create notification
        await Notification.create({
            recipient: userId,
            sender: currentUser._id,
            title: 'Friend Removed',
            message: 'A user has removed you from their friends list',
            type: 'system'
        });

        res.status(200).json({
            status: 'success',
            message: 'Friend removed successfully'
        });
    } catch (error) {
        console.error('Error in removeFriend:', error);
        next(error);
    }
};

// Block user
module.exports.blockUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const user = await User.findById(req.user.id);
        const targetUser = await User.findById(userId);

        if (!targetUser) {
            return next(new AppError('User not found', 404));
        }

        await user.blockUser(userId, reason);

        res.status(200).json({
            status: 'success',
            message: 'User blocked successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Unblock user
module.exports.unblockUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(req.user.id);
        const targetUser = await User.findById(userId);

        if (!targetUser) {
            return next(new AppError('User not found', 404));
        }

        await user.unblockUser(userId);

        res.status(200).json({
            status: 'success',
            message: 'User unblocked successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Get mutual friends
module.exports.getMutualFriends = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const currentUser = await User.findById(req.user.id);
        const otherUser = await User.findById(userId);

        if (!currentUser || !otherUser) {
            return next(new AppError('User not found', 404));
        }

        const mutualFriends = currentUser.friends.filter(friend =>
            otherUser.friends.includes(friend)
        );

        res.status(200).json({
            status: 'success',
            data: {
                mutualFriends
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get friend requests
module.exports.getFriendRequests = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'friendRequests.from',
                select: '_id name username avatar bio location joinDate occupation education'
            });

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Filter only pending requests and format the response
        const pendingRequests = user.friendRequests
            .filter(request => request.status === 'pending')
            .map(request => ({
                _id: request._id,
                from: request.from,
                status: request.status,
                createdAt: request.createdAt
            }));

        res.status(200).json({
            status: 'success',
            data: pendingRequests
        });
    } catch (error) {
        next(error);
    }
};

// Update friendship settings
module.exports.updateFriendshipSettings = async (req, res, next) => {
    try {
        const allowedFields = ['allowFriendRequests', 'showMutualFriends', 'showActivity'];
        const filteredBody = filterObj(req.body, ...allowedFields);

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { friendshipSettings: { ...filteredBody } },
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            status: 'success',
            data: {
                friendshipSettings: user.friendshipSettings
            }
        });
    } catch (error) {
        next(error);
    }
};

// Discover users
module.exports.discoverUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, interests, level } = req.query;
        const skip = (page - 1) * limit;

        // Build query
        const query = {
            _id: { $ne: req.user.id },
            'friendshipSettings.allowDiscovery': true
        };

        // Add interest filter if provided
        if (interests) {
            query.interests = { $in: interests.split(',') };
        }

        // Add level filter if provided
        if (level) {
            query.level = level;
        }

        // Exclude friends and blocked users
        const currentUser = await User.findById(req.user.id);
        query._id = {
            $ne: req.user.id,
            $nin: [...currentUser.friends, ...currentUser.blockedUsers]
        };

        const users = await User.find(query)
            .select('username email avatar walletAddress level points interests bio')
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Get total count for pagination
        const total = await User.countDocuments(query);

        res.status(200).json({
            status: 'success',
            data: {
                users,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get friend suggestions
module.exports.getFriendSuggestions = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('friends')
            .select('friends interests location level achievements');

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Get all users except current user and their friends
        const allUsers = await User.find({
            _id: { 
                $nin: [
                    req.user.id,
                    ...user.friends.map(friend => friend._id),
                    ...(user.blockedUsers || [])
                ]
            },
            active: true
        }).select('username name avatar interests location level achievements friends');

        // Calculate similarity scores and sort by relevance
        const suggestedFriends = allUsers.map(potentialFriend => {
            const similarityScore = calculateSimilarityScore(user, potentialFriend);
            return {
                user: {
                    _id: potentialFriend._id,
                    username: potentialFriend.username,
                    name: potentialFriend.name,
                    avatar: potentialFriend.avatar,
                    level: potentialFriend.level
                },
                mutualFriends: potentialFriend.friends.filter(friend => 
                    user.friends.some(userFriend => userFriend._id.equals(friend))
                ).length,
                similarityScore
            };
        });

        // Sort by similarity score and limit to 10 suggestions
        suggestedFriends.sort((a, b) => b.similarityScore - a.similarityScore);
        const topSuggestions = suggestedFriends.slice(0, 10);

        res.status(200).json({
            status: 'success',
            data: topSuggestions
        });
    } catch (error) {
        next(error);
    }
};

// Search users
module.exports.searchUsers = async (req, res, next) => {
    try {
        const { query, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        if (!query) {
            return next(new AppError('Search query is required', 400));
        }

        const currentUser = await User.findById(req.user.id);

        // Build search query
        const searchQuery = {
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { walletAddress: { $regex: query, $options: 'i' } }
            ],
            'friendshipSettings.allowDiscovery': true,
            _id: { 
                $ne: req.user.id,
                $nin: currentUser.blockedUsers
            }
        };

        // Type filter
        if (req.query.type) {
            searchQuery.type = req.query.type;
        }

        // Date range filter
        if (req.query.startDate || req.query.endDate) {
            searchQuery.createdAt = {};
            if (req.query.startDate) {
                searchQuery.createdAt.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                searchQuery.createdAt.$lte = new Date(req.query.endDate);
            }
        }

        // Find activities from the user and their friends
        const activities = await Activity.find(searchQuery)
            .populate('user', 'username email avatar')
            .populate('relatedUsers', 'username email avatar')
            .populate('comments.user', 'username avatar')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .lean();

        // Get total count for pagination
        const total = await Activity.countDocuments(searchQuery);

        // Add liked status and username fallbacks
        const processedActivities = activities.map(activity => {
            // Add liked status
            const activityObj = {
                ...activity,
                liked: activity.likes.includes(req.user.id),
                likesCount: activity.likes.length,
                commentsCount: activity.comments.length
            };
            
            // Add username fallback for main user
            if (activityObj.user) {
                activityObj.user.username = activityObj.user.username || activityObj.user.username;
            }

            // Add username fallback for related users
            if (activityObj.relatedUsers) {
                activityObj.relatedUsers = activityObj.relatedUsers.map(user => ({
                    ...user,
                    username: user.username || user.username
                }));
            }

            return activityObj;
        });

        res.status(200).json({
            status: 'success',
            data: {
                activities: processedActivities,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    hasMore: skip + activities.length < total
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Cancel friend request
module.exports.cancelFriendRequest = async (req, res, next) => {
    try {
        const { userId } = req.params;
        
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return next(new AppError('User not found', 404));
        }

        // Find and remove the friend request
        const requestIndex = targetUser.friendRequests.findIndex(
            req => req.from.toString() === req.user.id && req.status === 'pending'
        );

        if (requestIndex === -1) {
            return next(new AppError('No pending friend request found', 404));
        }

        targetUser.friendRequests.splice(requestIndex, 1);
        await targetUser.save();

        res.status(200).json({
            status: 'success',
            message: 'Friend request cancelled successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Get blocked users
module.exports.getBlockedUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const user = await User.findById(req.user.id)
            .populate({
                path: 'blockedUsers.user',
                select: 'username name avatar'
            })
            .select('blockedUsers');

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        const totalBlocked = user.blockedUsers?.length || 0;
        const blockedUsers = user.blockedUsers
            .slice(skip, skip + limit)
            .map(blocked => ({
                user: blocked.user,
                reason: blocked.reason,
                blockedAt: blocked.blockedAt
            }));

        res.status(200).json({
            status: 'success',
            data: {
                blockedUsers,
                pagination: {
                    total: totalBlocked,
                    pages: Math.ceil(totalBlocked / limit),
                    page,
                    limit
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get friend activities
module.exports.getFriendActivities = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get the user and their friends
        const user = await User.findById(req.user.id)
            .populate('friends');

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Get all friend IDs including the user
        const friendIds = [...user.friends.map(friend => friend._id), req.user.id];

        // Build query
        const query = {
            user: { $in: friendIds },
            isPublic: true
        };

        // Type filter
        if (req.query.type) {
            query.type = req.query.type;
        }

        // Date range filter
        if (req.query.startDate || req.query.endDate) {
            query.createdAt = {};
            if (req.query.startDate) {
                query.createdAt.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                query.createdAt.$lte = new Date(req.query.endDate);
            }
        }

        // Find activities from the user and their friends
        const activities = await Activity.find(query)
            .populate('user', 'username email avatar')
            .populate('relatedUsers', 'username email avatar')
            .populate('comments.user', 'username avatar')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .lean();

        // Get total count for pagination
        const total = await Activity.countDocuments(query);

        // Add liked status and username fallbacks
        const processedActivities = activities.map(activity => {
            // Add liked status
            const activityObj = {
                ...activity,
                liked: activity.likes.includes(req.user.id),
                likesCount: activity.likes.length,
                commentsCount: activity.comments.length
            };
            
            // Add username fallback for main user
            if (activityObj.user) {
                activityObj.user.username = activityObj.user.username || activityObj.user.username;
            }

            // Add username fallback for related users
            if (activityObj.relatedUsers) {
                activityObj.relatedUsers = activityObj.relatedUsers.map(user => ({
                    ...user,
                    username: user.username || user.username
                }));
            }

            return activityObj;
        });

        res.status(200).json({
            status: 'success',
            data: {
                activities: processedActivities,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    hasMore: skip + activities.length < total
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get single friend's activity
module.exports.getFriendActivity = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Check if the user is a friend
        const currentUser = await User.findById(req.user.id);
        if (!currentUser.friends.includes(userId)) {
            return next(new AppError('Not authorized to view this user\'s activity', 403));
        }

        // Get the user's latest activity
        const activity = await Activity.findOne({ user: userId })
            .sort('-createdAt')
            .populate('user', 'username avatar')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username avatar'
                }
            });

        res.status(200).json({
            status: 'success',
            data: {
                lastActivity: activity || null
            }
        });
    } catch (error) {
        next(error);
    }
};

// Like/Unlike friend's activity
module.exports.toggleActivityLike = async (req, res, next) => {
    try {
        const { activityId } = req.params;
        const activity = await Activity.findById(activityId);
        
        if (!activity) {
            return next(new AppError('Activity not found', 404));
        }

        // Check if user has access to this activity
        const user = await User.findById(req.user.id);
        const hasAccess = activity.isPublic || 
                         activity.user.equals(req.user.id) || 
                         user.friends.includes(activity.user);

        if (!hasAccess) {
            return next(new AppError('Not authorized to interact with this activity', 403));
        }

        const likeIndex = activity.likes.indexOf(req.user.id);
        if (likeIndex === -1) {
            activity.likes.push(req.user.id);
        } else {
            activity.likes.splice(likeIndex, 1);
        }

        await activity.save();

        res.status(200).json({
            status: 'success',
            data: {
                liked: likeIndex === -1,
                likesCount: activity.likes.length
            }
        });
    } catch (error) {
        next(error);
    }
};

// Comment on friend's activity
module.exports.commentOnActivity = async (req, res, next) => {
    try {
        const { activityId } = req.params;
        const { content } = req.body;

        if (!content) {
            return next(new AppError('Comment content is required', 400));
        }

        const activity = await Activity.findById(activityId);
        if (!activity) {
            return next(new AppError('Activity not found', 404));
        }

        // Check if user has access to this activity
        const user = await User.findById(req.user.id);
        const hasAccess = activity.isPublic || 
                         activity.user.equals(req.user.id) || 
                         user.friends.includes(activity.user);

        if (!hasAccess) {
            return next(new AppError('Not authorized to interact with this activity', 403));
        }

        // Add comment
        activity.comments.push({
            user: req.user.id,
            content: content
        });

        await activity.save();

        // Populate the newly added comment
        const populatedActivity = await Activity.findById(activityId)
            .populate('comments.user', 'username avatar');

        res.status(200).json({
            status: 'success',
            data: {
                comments: populatedActivity.comments,
                commentsCount: populatedActivity.comments.length
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get friendship settings
module.exports.getFriendshipSettings = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .select('friendshipSettings');

        res.status(200).json({
            status: 'success',
            data: {
                settings: user.friendshipSettings
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get friend suggestions based on common interests, mutual friends, and activity
module.exports.getFriendSuggestions = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('friends')
            .select('friends interests location level achievements');

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Get all users except current user and their friends
        const allUsers = await User.find({
            _id: { 
                $nin: [
                    req.user.id,
                    ...user.friends.map(friend => friend._id),
                    ...(user.blockedUsers || [])
                ]
            },
            active: true
        }).select('username name avatar interests location level achievements friends');

        // Calculate similarity scores and sort by relevance
        const suggestedFriends = allUsers.map(potentialFriend => {
            const similarityScore = calculateSimilarityScore(user, potentialFriend);
            return {
                user: {
                    _id: potentialFriend._id,
                    username: potentialFriend.username,
                    name: potentialFriend.name,
                    avatar: potentialFriend.avatar,
                    level: potentialFriend.level
                },
                mutualFriends: potentialFriend.friends.filter(friend => 
                    user.friends.some(userFriend => userFriend._id.equals(friend))
                ).length,
                similarityScore
            };
        });

        // Sort by similarity score and limit to 10 suggestions
        suggestedFriends.sort((a, b) => b.similarityScore - a.similarityScore);
        const topSuggestions = suggestedFriends.slice(0, 10);

        res.status(200).json({
            status: 'success',
            data: topSuggestions
        });
    } catch (error) {
        next(error);
    }
};

// Get blocked users with pagination
module.exports.getBlockedUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const user = await User.findById(req.user.id)
            .populate({
                path: 'blockedUsers.user',
                select: 'username name avatar'
            })
            .select('blockedUsers');

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        const totalBlocked = user.blockedUsers?.length || 0;
        const blockedUsers = user.blockedUsers
            .slice(skip, skip + limit)
            .map(blocked => ({
                user: blocked.user,
                reason: blocked.reason,
                blockedAt: blocked.blockedAt
            }));

        res.status(200).json({
            status: 'success',
            data: {
                blockedUsers,
                pagination: {
                    total: totalBlocked,
                    pages: Math.ceil(totalBlocked / limit),
                    page,
                    limit
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get weekly friend activity
module.exports.getWeeklyFriendActivity = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('friends')
            .select('friends');

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Get activities of friends from the past week
        const friendActivities = await Activity.find({
            user: { $in: user.friends.map(friend => friend._id) },
            createdAt: { $gte: oneWeekAgo }
        })
        .populate('user', 'username name avatar')
        .sort('-createdAt')
        .limit(50);

        // Group activities by day
        const groupedActivities = friendActivities.reduce((acc, activity) => {
            const date = activity.createdAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push({
                id: activity._id,
                type: activity.type,
                description: activity.description,
                user: activity.user,
                metadata: activity.metadata,
                createdAt: activity.createdAt
            });
            return acc;
        }, {});

        // Convert to array and sort by date
        const activityFeed = Object.entries(groupedActivities)
            .map(([date, activities]) => ({
                date,
                activities
            }))
            .sort((a, b) => b.date.localeCompare(a.date));

        res.status(200).json({
            status: 'success',
            data: activityFeed
        });
    } catch (error) {
        next(error);
    }
};

// Like friend's activity
module.exports.likeActivity = async (req, res, next) => {
    try {
        const { activityId } = req.params;
        
        const activity = await Activity.findById(activityId);
        if (!activity) {
            return next(new AppError('Activity not found', 404));
        }

        // Check if user has already liked
        const alreadyLiked = activity.likes.includes(req.user.id);
        
        if (alreadyLiked) {
            // Unlike
            activity.likes = activity.likes.filter(userId => !userId.equals(req.user.id));
        } else {
            // Like
            activity.likes.push(req.user.id);
            
            // Create notification for activity owner if it's not the user themselves
            if (!activity.user.equals(req.user.id)) {
                await Notification.create({
                    recipient: activity.user,
                    sender: req.user.id,
                    type: 'like',
                    reference: activity._id,
                    message: 'liked your activity'
                });
            }
        }

        await activity.save();

        res.status(200).json({
            status: 'success',
            data: {
                likes: activity.likes.length,
                liked: !alreadyLiked
            }
        });
    } catch (error) {
        next(error);
    }
};

// Comment on friend's activity
module.exports.commentOnActivity = async (req, res, next) => {
    try {
        const { activityId } = req.params;
        const { content } = req.body;

        if (!content) {
            return next(new AppError('Comment content is required', 400));
        }

        const activity = await Activity.findById(activityId);
        if (!activity) {
            return next(new AppError('Activity not found', 404));
        }

        const comment = {
            user: req.user.id,
            content,
            createdAt: new Date()
        };

        activity.comments.push(comment);
        await activity.save();

        // Create notification for activity owner if it's not the user themselves
        if (!activity.user.equals(req.user.id)) {
            await Notification.create({
                recipient: activity.user,
                sender: req.user.id,
                type: 'comment',
                reference: activity._id,
                message: 'commented on your activity'
            });
        }

        // Populate user details for the new comment
        const populatedActivity = await Activity.findById(activityId)
            .populate('comments.user', 'username name avatar');

        const newComment = populatedActivity.comments[populatedActivity.comments.length - 1];

        res.status(201).json({
            status: 'success',
            data: newComment
        });
    } catch (error) {
        next(error);
    }
};

// Get received friend requests
module.exports.getReceivedFriendRequests = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'friendRequests.from',
                select: 'username name avatar'
            })
            .select('friendRequests');

        const receivedRequests = user.friendRequests
            .filter(request => request.status === 'pending')
            .map(request => ({
                id: request._id,
                from: {
                    id: request.from._id,
                    username: request.from.username,
                    name: request.from.name,
                    avatar: request.from.avatar,
                    level: request.from.level
                },
                createdAt: request.createdAt
            }));

        res.status(200).json({
            status: 'success',
            data: receivedRequests
        });
    } catch (error) {
        next(error);
    }
};

// Get sent friend requests
module.exports.getSentFriendRequests = async (req, res, next) => {
    try {
        const sentRequests = await User.find({
            'friendRequests.from': req.user.id,
            'friendRequests.status': 'pending'
        })
        .select('username name avatar level friendRequests')
        .lean();

        const formattedRequests = sentRequests.map(user => ({
            id: user.friendRequests.find(req => req.from.toString() === req.user.id)._id,
            to: {
                _id: user._id,
                username: user.username,
                name: user.name,
                avatar: user.avatar,
                level: user.level
            },
            createdAt: user.friendRequests.find(req => req.from.toString() === req.user.id).createdAt
        }));

        res.status(200).json({
            status: 'success',
            data: formattedRequests
        });
    } catch (error) {
        next(error);
    }
};

// Delete comment on activity
module.exports.deleteComment = async (req, res, next) => {
    try {
        const { activityId, commentId } = req.params;
        
        const activity = await Activity.findById(activityId);
        if (!activity) {
            return next(new AppError('Activity not found', 404));
        }

        // Find the comment
        const comment = activity.comments.id(commentId);
        if (!comment) {
            return next(new AppError('Comment not found', 404));
        }

        // Check if user is authorized to delete the comment
        if (!comment.user.equals(req.user.id) && !activity.user.equals(req.user.id)) {
            return next(new AppError('Not authorized to delete this comment', 403));
        }

        // Remove the comment
        comment.remove();
        await activity.save();

        res.status(200).json({
            status: 'success',
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
