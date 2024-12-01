import { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';
import './AchievementProgress.css';

const AchievementProgress = () => {
    const [achievements, setAchievements] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            setLoading(true);
            const response = await apiService.getAchievementProgress();
            setAchievements(response.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch achievements');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="achievement-loading">
                <div className="achievement-spinner"></div>
                <p>Loading achievements...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="achievement-error">
                <p>{error}</p>
                <button onClick={fetchAchievements}>Retry</button>
            </div>
        );
    }

    return (
        <div className="achievement-progress-container">
            <div className="achievement-header">
                <h2>Achievement Progress</h2>
                <div className="achievement-summary">
                    <span className="total-achievements">
                        {achievements?.completed || 0} / {achievements?.total || 0} Completed
                    </span>
                    <div className="achievement-level">
                        Level {achievements?.level || 1}
                    </div>
                </div>
            </div>

            <div className="achievement-categories">
                {achievements?.categories?.map((category, index) => (
                    <div key={index} className="achievement-category">
                        <h3>{category.name}</h3>
                        <div className="category-achievements">
                            {category.achievements.map((achievement, achievementIndex) => (
                                <div 
                                    key={achievementIndex} 
                                    className={`achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                                >
                                    <div className="achievement-icon">
                                        {achievement.unlocked ? achievement.icon : '🔒'}
                                    </div>
                                    <div className="achievement-details">
                                        <h4>{achievement.name}</h4>
                                        <p>{achievement.description}</p>
                                        {achievement.progress && (
                                            <div className="achievement-progress">
                                                <div className="progress-bar">
                                                    <div 
                                                        className="progress-fill"
                                                        style={{ width: `${(achievement.progress.current / achievement.progress.required) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="progress-text">
                                                    {achievement.progress.current} / {achievement.progress.required}
                                                </span>
                                            </div>
                                        )}
                                        {achievement.unlocked && (
                                            <span className="unlock-date">
                                                Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {achievements?.recentUnlocks?.length > 0 && (
                <div className="recent-unlocks">
                    <h3>Recent Unlocks</h3>
                    <div className="unlocks-grid">
                        {achievements.recentUnlocks.map((unlock, index) => (
                            <div key={index} className="unlock-card">
                                <div className="unlock-icon">{unlock.icon}</div>
                                <div className="unlock-info">
                                    <h4>{unlock.name}</h4>
                                    <p>{unlock.description}</p>
                                    <span className="unlock-date">
                                        {new Date(unlock.unlockedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AchievementProgress;
