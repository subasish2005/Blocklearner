import  { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';
import './DashboardProgress.css';

const DashboardProgress = () => {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                setLoading(true);
                const response = await apiService.getDashboardProgress();
                console.log('Progress response:', response.data);
                // The data is directly in response.data, no need to access .data again
                setProgress(response.data);
            } catch (err) {
                console.error('Error fetching progress:', err);
                setError(err.message || 'Failed to fetch progress data');
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, []);

    if (loading) {
        return (
            <div className="dashboard-progress-widget">
                <h3>Task Progress</h3>
                <div className="loading">
                    Loading progress data...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-progress-widget error">
                <h3>Task Progress</h3>
                <p>Error: {error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    // Check if progress exists and has the required properties
    if (!progress || typeof progress.progressPercentage === 'undefined') {
        return (
            <div className="dashboard-progress-widget">
                <h3>Task Progress</h3>
                <p>No progress data available</p>
            </div>
        );
    }

    return (
        <div className="dashboard-progress-widget">
            <h3>Task Progress</h3>
            <div className="progress-stats">
                <div className="stat-item">
                    <span className="stat-label">Completed Tasks</span>
                    <span className="stat-value">{progress.completedTasks}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Total Tasks</span>
                    <span className="stat-value">{progress.totalTasks}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Average Score</span>
                    <span className="stat-value">{Math.round(progress.averageScore || 0)}</span>
                </div>
            </div>
            <div className="progress-bar-container">
                <div className="progress-label">
                    <span>Overall Progress</span>
                    <span>{Math.round(progress.progressPercentage)}%</span>
                </div>
                <div className="progress-bar-wrapper">
                    <div 
                        className="progress-bar-fill"
                        style={{ width: `${progress.progressPercentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default DashboardProgress;
