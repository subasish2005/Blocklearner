const Badge = require('../models/badge.model');
const User = require('../models/user.model');
const { ValidationError, NotFoundError } = require('./appError');
const { getIO } = require('../socket');

// Points System Configuration
const pointsSystem = {
    activities: {
        registration: 50,
        profileCompletion: 100,
        dailyLogin: 10,
        connectSocialMedia: 30,
        updateProfile: 20,
        achievementUnlock: 50,
        referralSignup: 100,
        taskCompletion: {
            easy: 20,
            medium: 50,
            hard: 100
        },
        streaks: {
            weekly: 50,
            monthly: 200
        }
    },
    levels: {
        1: 0,
        2: 100,
        3: 300,
        4: 600,
        5: 1000,
        6: 1500,
        7: 2100,
        8: 2800,
        9: 3600,
        10: 5000
    }
};

// Pre-defined badges with their requirements
const defaultBadges = [
    // Level Badges
    {
        name: 'Rookie',
        description: 'Welcome to the community! Earned upon registration.',
        icon: '🌟',
        category: 'level',
        pointsRequired: 0,
        color: '#4F46E5',
        tier: 'bronze',
        criteria: { type: 'registration' }
    },
    {
        name: 'Explorer',
        description: 'Reached 100 points! Your journey begins.',
        icon: '🗺️',
        category: 'level',
        pointsRequired: 100,
        color: '#4F46E5',
        tier: 'bronze',
        criteria: { type: 'points', value: 100 }
    },
    {
        name: 'Adventurer',
        description: 'Achieved 500 points! You\'re making progress.',
        icon: '⚔️',
        category: 'level',
        pointsRequired: 500,
        color: '#9333EA',
        tier: 'silver',
        criteria: { type: 'points', value: 500 }
    },
    {
        name: 'Master',
        description: 'Incredible! You\'ve reached 1000 points.',
        icon: '👑',
        category: 'level',
        pointsRequired: 1000,
        color: '#EAB308',
        tier: 'gold',
        criteria: { type: 'points', value: 1000 }
    },
    {
        name: 'Legend',
        description: 'Elite status achieved with 5000 points!',
        icon: '🏆',
        category: 'level',
        pointsRequired: 5000,
        color: '#14B8A6',
        tier: 'platinum',
        criteria: { type: 'points', value: 5000 }
    },
    // Achievement Badges
    {
        name: 'Profile Perfectionist',
        description: 'Completed all profile information',
        icon: '📝',
        category: 'achievement',
        pointsRequired: 50,
        color: '#4F46E5',
        tier: 'bronze',
        criteria: { type: 'profile', completeness: 100 }
    },
    {
        name: 'Social Butterfly',
        description: 'Connected all social media accounts',
        icon: '🦋',
        category: 'achievement',
        pointsRequired: 100,
        color: '#9333EA',
        tier: 'silver',
        criteria: { type: 'social', connections: ['google', 'github', 'linkedin'] }
    },
    {
        name: 'Consistent Contributor',
        description: 'Logged in for 7 consecutive days',
        icon: '🔥',
        category: 'achievement',
        pointsRequired: 200,
        color: '#EAB308',
        tier: 'gold',
        criteria: { type: 'streak', days: 7 }
    }
];

class BadgeUtils {
    // Calculate user level based on points
    static calculateLevel(points) {
        const levels = Object.entries(pointsSystem.levels)
            .sort((a, b) => b[1] - a[1]);

        for (const [level, requiredPoints] of levels) {
            if (points >= requiredPoints) {
                return {
                    currentLevel: parseInt(level),
                    nextLevel: parseInt(level) + 1,
                    currentLevelPoints: requiredPoints,
                    nextLevelPoints: pointsSystem.levels[parseInt(level) + 1] || null,
                    pointsToNextLevel: pointsSystem.levels[parseInt(level) + 1] 
                        ? pointsSystem.levels[parseInt(level) + 1] - points 
                        : 0
                };
            }
        }
        return {
            currentLevel: 1,
            nextLevel: 2,
            currentLevelPoints: 0,
            nextLevelPoints: pointsSystem.levels[2],
            pointsToNextLevel: pointsSystem.levels[2]
        };
    }

    // Check eligible badges based on user data
    static async checkEligibleBadges(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new NotFoundError('User not found');
            }

            const allBadges = await Badge.find();
            const eligibleBadges = [];

            for (const badge of allBadges) {
                const isEligible = await this.checkBadgeEligibility(user, badge);
                if (isEligible && !user.badges.some(b => b.badgeId.toString() === badge._id.toString())) {
                    eligibleBadges.push(badge);
                }
            }

            if (eligibleBadges.length > 0) {
                // Award new badges
                for (const badge of eligibleBadges) {
                    user.badges.push({
                        badgeId: badge._id,
                        dateEarned: new Date()
                    });

                    // Add points for achievement
                    await user.addPoints(pointsSystem.activities.achievementUnlock);

                    // Notify user via socket
                    const io = getIO();
                    io.to(user._id.toString()).emit('badgeEarned', {
                        badge: {
                            name: badge.name,
                            description: badge.description,
                            icon: badge.icon,
                            tier: badge.tier
                        },
                        points: pointsSystem.activities.achievementUnlock
                    });
                }

                await user.save();
            }

            return eligibleBadges;
        } catch (error) {
            console.error('Error checking eligible badges:', error);
            throw error;
        }
    }

    // Check if user is eligible for a specific badge
    static async checkBadgeEligibility(user, badge) {
        const { criteria } = badge;

        switch (criteria.type) {
            case 'points':
                return user.points >= criteria.value;
            
            case 'profile':
                return user.profileCompleteness >= criteria.completeness;
            
            case 'social':
                return criteria.connections.every(platform => 
                    user.socialConnections && user.socialConnections[platform]);
            
            case 'streak':
                return user.loginStreak >= criteria.days;
            
            case 'registration':
                return true;
            
            default:
                return false;
        }
    }

    // Initialize default badges in the database
    static async initializeDefaultBadges() {
        try {
            const existingBadges = await Badge.find();
            
            if (existingBadges.length === 0) {
                await Badge.insertMany(defaultBadges);
                console.log('Default badges initialized successfully');
            }
        } catch (error) {
            console.error('Error initializing default badges:', error);
            throw error;
        }
    }

    // Award points for an activity
    static async awardPoints(userId, activity, additionalPoints = 0) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new NotFoundError('User not found');
            }

            const points = pointsSystem.activities[activity] + additionalPoints;
            if (typeof points !== 'number') {
                throw new ValidationError(`Invalid activity type: ${activity}`);
            }

            await user.addPoints(points);
            await this.checkEligibleBadges(userId);

            return {
                pointsAwarded: points,
                newTotal: user.points,
                level: this.calculateLevel(user.points)
            };
        } catch (error) {
            console.error('Error awarding points:', error);
            throw error;
        }
    }
}

module.exports = BadgeUtils;
