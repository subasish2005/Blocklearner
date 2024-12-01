import PropTypes from 'prop-types';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PendingIcon from '@mui/icons-material/Pending';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import './widgets.css';

const TasksWidget = ({ tasks = [] }) => {
  if (!tasks) {
    return (
      <div className="widget tasks-widget">
        <div className="widget-header">
          <h3 className="progress-title">Tasks Overview</h3>
        </div>
        <div className="loading">
          Loading tasks...
        </div>
      </div>
    );
  }

  // Ensure tasks is an array and transform the data
  const validTasks = Array.isArray(tasks) ? tasks : [];
  
  // Calculate task statistics based on verification status and difficulty
  const completedTasks = validTasks.filter(task => 
    task.verification?.status === 'verified' || 
    task.verification?.status === 'completed'
  ).length;
  
  const pendingTasks = validTasks.filter(task => 
    !task.verification?.status || 
    task.verification?.status === 'pending' ||
    task.verification?.status === 'submitted'
  ).length;
  
  const urgentTasks = validTasks.filter(task => 
    task.difficulty === 'advanced' || 
    (task.timeConstraints?.endDate && new Date(task.timeConstraints.endDate) < new Date())
  ).length;

  const totalTasks = validTasks.length || 1; // Prevent division by zero

  // Calculate percentages safely
  const completedPercentage = Math.round((completedTasks / totalTasks) * 100);
  const pendingPercentage = Math.round((pendingTasks / totalTasks) * 100);
  const urgentPercentage = Math.round((urgentTasks / totalTasks) * 100);

  return (
    <div className="widget tasks-widget">
      <div className="widget-header">
        <h3 className="progress-title">Tasks Overview</h3>
      </div>
      <div className="progress-grid">
        <div className="progress-item">
          <div className="stat-icon-container green">
            <TaskAltIcon className="stat-icon" />
          </div>
          <div className="progress-info">
            <span className="progress-label">Tasks pending</span>
            <span className="progress-value">{completedTasks}</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${completedPercentage}%` }}
            />
          </div>
        </div>
        <div className="progress-item">
          <div className="stat-icon-container purple">
            <PendingIcon className="stat-icon" />
          </div>
          <div className="progress-info">
            <span className="progress-label">Tasks completed</span>
            <span className="progress-value">{pendingTasks}</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${pendingPercentage}%` }}
            />
          </div>
        </div>
        <div className="progress-item">
          <div className="stat-icon-container red">
            <PriorityHighIcon className="stat-icon" />
          </div>
          <div className="progress-info">
            <span className="progress-label">Urgent Tasks</span>
            <span className="progress-value">{urgentTasks}</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${urgentPercentage}%` }}
            />
          </div>
        </div>
      </div>
      <div className="tasks-summary">
        <p>Total Tasks: {totalTasks}</p>
      </div>
    </div>
  );
};

TasksWidget.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      verification: PropTypes.shape({
        status: PropTypes.string,
        type: PropTypes.string
      }),
      difficulty: PropTypes.string,
      timeConstraints: PropTypes.shape({
        endDate: PropTypes.string
      })
    })
  )
};

export default TasksWidget;