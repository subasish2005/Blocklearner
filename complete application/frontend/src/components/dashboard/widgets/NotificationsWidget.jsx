import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { FiBell, FiInfo, FiX, FiCheck, FiTrash2 } from 'react-icons/fi';
import './widgets.css';

const NotificationsWidget = ({ notifications, onMarkAsRead, onRemove, onDismiss }) => {
  return (
    <div className="notifications-widget">
      <div className="progress-header">
        <h3 className="progress-title">Recent Notifications</h3>
        <FiBell className="notifications-icon" />
      </div>
      <div className="notification-list custom-scrollbar">
        {notifications.map((notification) => (
          <div
            key={notification._id}
            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
          >
            <div className="notification-content">
              <div className="notification-icon">
                <FiInfo />
              </div>
              <div className="notification-text">
                <p className="notification-title">{notification.title}</p>
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                </span>
              </div>
              <div className="notification-actions">
                {!notification.read && (
                  <button
                    className="action-button mark-read"
                    onClick={() => onMarkAsRead(notification._id)}
                    title="Mark as read"
                  >
                    <FiCheck />
                  </button>
                )}
                <button
                  className="action-button dismiss"
                  onClick={() => onDismiss(notification._id)}
                  title="Dismiss"
                >
                  <FiX />
                </button>
                <button
                  className="action-button remove"
                  onClick={() => onRemove(notification._id)}
                  title="Remove"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="notification-item">
            <p className="notification-text">No new notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

NotificationsWidget.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      read: PropTypes.bool.isRequired,
    })
  ).isRequired,
  onMarkAsRead: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

export default NotificationsWidget;