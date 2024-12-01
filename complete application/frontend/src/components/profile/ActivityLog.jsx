import { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';
import './ActivityLog.css';

const ActivityLog = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        type: 'all',
        period: '7days'
    });
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchActivities();
    }, [filters, page]);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const response = await apiService.getActivityLog({
                page,
                limit: 10,
                type: filters.type !== 'all' ? filters.type : undefined,
                period: filters.period
            });
            
            if (page === 1) {
                setActivities(response.data.activities);
            } else {
                setActivities(prev => [...prev, ...response.data.activities]);
            }
            
            setHasMore(response.data.hasMore);
        } catch (err) {
            setError(err.message || 'Failed to fetch activity log');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setPage(1);
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    const getActivityIcon = (type) => {
        const icons = {
            login: '🔐',
            achievement: '🏆',
            friend: '👥',
            task: '✅',
            security: '🛡️',
            profile: '👤',
            default: '📝'
        };
        return icons[type] || icons.default;
    };

    return (
        <div className="activity-log-container">
            <div className="activity-header">
                <h2>Activity Log</h2>
                <div className="activity-filters">
                    <select 
                        value={filters.type} 
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                        <option value="all">All Activities</option>
                        <option value="login">Logins</option>
                        <option value="achievement">Achievements</option>
                        <option value="friend">Friend Activity</option>
                        <option value="task">Tasks</option>
                        <option value="security">Security</option>
                        <option value="profile">Profile Updates</option>
                    </select>

                    <select 
                        value={filters.period} 
                        onChange={(e) => handleFilterChange('period', e.target.value)}
                    >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="activity-error">
                    <p>{error}</p>
                    <button onClick={() => fetchActivities()}>Retry</button>
                </div>
            )}

            <div className="activity-timeline">
                {activities.map((activity, index) => (
                    <div key={index} className="activity-item">
                        <div className="activity-icon">
                            {getActivityIcon(activity.type)}
                        </div>
                        <div className="activity-content">
                            <div className="activity-info">
                                <span className="activity-title">{activity.title}</span>
                                <span className="activity-time">
                                    {new Date(activity.timestamp).toLocaleString()}
                                </span>
                            </div>
                            <p className="activity-description">{activity.description}</p>
                            {activity.metadata && (
                                <div className="activity-metadata">
                                    {Object.entries(activity.metadata).map(([key, value]) => (
                                        <span key={key} className="metadata-item">
                                            {key}: {value}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="activity-loading">
                    <div className="activity-spinner"></div>
                    <p>Loading activities...</p>
                </div>
            )}

            {!loading && hasMore && (
                <button 
                    className="load-more-button"
                    onClick={loadMore}
                >
                    Load More
                </button>
            )}
        </div>
    );
};

export default ActivityLog;
