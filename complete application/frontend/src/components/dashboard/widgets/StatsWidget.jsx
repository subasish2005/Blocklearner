
import PropTypes from 'prop-types';
import { FaStar, FaTrophy, FaChartLine } from 'react-icons/fa';
import './widgets.css';

const StatsWidget = ({ stats }) => {
  if (!stats) {
    return (
      <div className="widget stats-widget">
        <div className="widget-header">
          <h3>Your Stats</h3>
        </div>
        <div className="loading">
          Loading stats...
        </div>
      </div>
    );
  }

  const {
    points = 0,
    tasksCompleted = 0,
    completionRate = 0,
    tasks = {}
  } = stats;

  const totalTasks = tasks.total || 0;
  const pendingTasks = tasks.pending || 0;

  return (
    <div className="widget stats-widget">
      <div className="widget-header">
        <h3>Your Stats</h3>
      </div>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-icon-container gold">
            <FaStar className="stat-icon" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Points Earned</span>
            <span className="stat-value">{points}</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-container purple">
            <FaTrophy className="stat-icon" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Tasks Completed</span>
            <span className="stat-value">{tasksCompleted}</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon-container blue">
            <FaChartLine className="stat-icon" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Completion Rate</span>
            <span className="stat-value">{completionRate}%</span>
          </div>
        </div>
      </div>
      <div className="stats-summary">
        <p>Total Tasks: {totalTasks}</p>
        <p>Pending Tasks: {pendingTasks}</p>
      </div>
    </div>
  );
};

StatsWidget.propTypes = {
  stats: PropTypes.shape({
    points: PropTypes.number,
    tasksCompleted: PropTypes.number,
    completionRate: PropTypes.number,
    tasks: PropTypes.shape({
      total: PropTypes.number,
      pending: PropTypes.number
    })
  })
};

export default StatsWidget;
