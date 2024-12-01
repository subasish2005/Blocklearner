// Calculate similarity score between two users based on various factors
exports.calculateSimilarityScore = (user1, user2) => {
    let score = 0;

    // Compare interests (if available)
    if (user1.interests && user2.interests) {
        const commonInterests = user1.interests.filter(interest => 
            user2.interests.includes(interest)
        ).length;
        score += commonInterests * 2; // Weight of 2 for each common interest
    }

    // Compare location (if available)
    if (user1.location && user2.location && user1.location === user2.location) {
        score += 3; // Weight of 3 for same location
    }

    // Compare level
    const levelDifference = Math.abs((user1.level || 1) - (user2.level || 1));
    score += Math.max(5 - levelDifference, 0); // Up to 5 points for close levels

    // Compare achievements (if available)
    if (user1.achievements && user2.achievements) {
        const commonAchievements = user1.achievements.filter(ach1 => 
            user2.achievements.some(ach2 => ach1.category === ach2.category && ach1.completed && ach2.completed)
        ).length;
        score += commonAchievements; // Weight of 1 for each common achievement category
    }

    return score;
};
