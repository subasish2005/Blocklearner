import { useState, useEffect, useCallback } from 'react';
import { FaBell, FaTimes, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaSpinner } from 'react-icons/fa';
import { apiService } from '../../services/api.service';
import { io } from 'socket.io-client';
import './NotificationPanel.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const NotificationPanel = ({ isOpen, onClose, togglePanel }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getNotifications();
      const notificationData = response.data.notifications || [];
      
      // Transform notifications to include icons based on type
      const transformedNotifications = notificationData.map(notification => ({
        ...notification,
        icon: getNotificationIcon(notification.type),
        time: formatNotificationTime(notification.createdAt)
      }));
      
      setNotifications(transformedNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socketInstance = io(BACKEND_URL, {
      path: '/ws',
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('Notification WebSocket connected');
    });

    socketInstance.on('notification', (newNotification) => {
      setNotifications(prev => [{
        ...newNotification,
        icon: getNotificationIcon(newNotification.type),
        time: formatNotificationTime(newNotification.createdAt)
      }, ...prev]);
    });

    socketInstance.on('notification_read', (notificationId) => {
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Initial fetch of notifications
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'achievement':
        return <FaCheckCircle />;
      case 'alert':
        return <FaExclamationCircle />;
      default:
        return <FaInfoCircle />;
    }
  };

  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const markAsRead = async (id) => {
    try {
      await apiService.markNotificationRead(id);
      setNotifications(notifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      ));
      socket?.emit('notification_read', id);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await apiService.deleteNotification(id);
      setNotifications(notifications.filter(notif => notif.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'achievement':
        return '#00ff9d';
      case 'course':
        return '#00f3ff';
      case 'alert':
        return '#ff00ff';
      default:
        return '#7d12ff';
    }
  };

  return (
    <div className={`notification-panel ${isOpen ? 'open' : ''}`}>
      <div className="notification-header">
        <h3>
          <FaBell className="bell-icon" />
          Notifications
        </h3>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="notification-list">
        {loading ? (
          <div className="loading-container">
            <FaSpinner className="spinner" />
            <span>Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="no-notifications">
            No new notifications
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              style={{ '--type-color': getTypeColor(notification.type) }}
            >
              <div className="notification-icon" style={{ color: getTypeColor(notification.type) }}>
                {notification.icon}
              </div>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span className="notification-time">{notification.time}</span>
              </div>
              <div className="notification-actions">
                {!notification.read && (
                  <button
                    className="mark-read-button"
                    onClick={() => markAsRead(notification.id)}
                    title="Mark as read"
                  >
                    <FaCheckCircle />
                  </button>
                )}
                <button
                  className="delete-button"
                  onClick={() => deleteNotification(notification.id)}
                  title="Delete notification"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
