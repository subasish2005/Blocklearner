import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { FiLogOut, FiUser, FiHome, FiCheckSquare, FiChevronDown, FiSettings } from 'react-icons/fi';
import { HoverBorderGradient } from '../customcomponents/hover boarder gradient/HoverBorderGradient';
import UserProfileWidget from './widgets/UserProfileWidget';
import TasksWidget from './widgets/TasksWidget';
import NotificationsWidget from './widgets/NotificationsWidget';
import StatsWidget from './widgets/StatsWidget';
import DashboardProgress from './DashboardProgress';
import './Dashboard.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [socket, setSocket] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  const toggleAdminMenu = () => {
    setIsAdminMenuOpen(!isAdminMenuOpen);
  };

  // Socket.IO connection handler
  const setupSocketConnection = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token available for socket connection');
      return;
    }

    const socketInstance = io(BACKEND_URL, {
      path: '/ws',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      console.log('Socket.IO connected successfully');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    socketInstance.on('notification', (data) => {
      setNotifications(prev => [data, ...prev]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [userResponse, notifResponse, taskResponse, statsResponse] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/v1/users/me`, config),
        axios.get(`${BACKEND_URL}/api/v1/notifications/my`, config),
        axios.get(`${BACKEND_URL}/api/v1/tasks`, config),
        axios.get(`${BACKEND_URL}/api/v1/dashboard/stats`, config)
      ]);

      // Extract and transform the stats data
      const statsData = statsResponse.data.data.stats;
      const transformedStats = {
        tasks: statsData.tasks || {},
        points: statsData.points || 0,
        tasksCompleted: statsData.tasksCompleted || 0,
        badges: statsData.badges || [],
        totalPoints: statsData.totalPoints || 0,
        completionRate: statsData.completionRate || 0,
        recentActivity: statsData.recentActivity || []
      };

      setUserData(userResponse.data.data.user);
      setNotifications(notifResponse.data.data.notifications || []);
      setTasks(taskResponse.data.data.tasks || []);
      setStats(transformedStats);

      setupSocketConnection();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
      
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  }, [navigate, setupSocketConnection]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/home', { replace: true });
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleTasks = () => {
    navigate('/tasks');
  };
  const handletasks = () => {
    navigate('/admin/tasks');
  };
  
  const handleusers = () => {
    navigate('/admin/users');
  };
  
  const statistics = () => {
    navigate('/admin/dashboard');
  };
  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.patch(
        `${BACKEND_URL}/api/v1/notifications/${notificationId}/read`,
        {} ,
        config
      );

      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleRemoveNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(
        `${BACKEND_URL}/api/v1/notifications/${notificationId}`,
        config
      );

      setNotifications(prev =>
        prev.filter(notif => notif._id !== notificationId)
      );
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  const handleDismissNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.patch(
        `${BACKEND_URL}/api/v1/notifications/${notificationId}/dismiss`,
        {} ,
        config
      );

      setNotifications(prev =>
        prev.filter(notif => notif._id !== notificationId)
      );
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <p className="error-message">{error}</p>
          <button onClick={handleRefresh} className="refresh-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-container">
          <div className="header-content">
            <div className="header-left">
              <h1 className="dashboard-title">Dashboard</h1>
            </div>
            <div className="header-buttons">
              <HoverBorderGradient onClick={handleHome} className="header-button home">
                <FiHome />
                Home
              </HoverBorderGradient>
              <HoverBorderGradient onClick={handleTasks} className="header-button tasks">
                <FiCheckSquare />
                Tasks
              </HoverBorderGradient>
              <HoverBorderGradient onClick={handleProfile} className="header-button profile">
                <FiUser />
                Profile
              </HoverBorderGradient>
              <HoverBorderGradient onClick={handleLogout} className="header-button logout">
                <FiLogOut />
                Logout
              </HoverBorderGradient>
              {userData?.role === 'admin' && (
                <div className="admin-dropdown">
                  <HoverBorderGradient 
                    onClick={toggleAdminMenu} 
                    className={`header-button admin-toggle ${isAdminMenuOpen ? 'open' : ''}`}
                  >
                    <FiSettings />
                    <span>Admin Options</span>
                    <FiChevronDown />
                  </HoverBorderGradient>
                  {isAdminMenuOpen && (
                    <div className="admin-dropdown-content">
                      <HoverBorderGradient onClick={handletasks} className="header-button">
                        <FiLogOut />
                        <span>Tasks Control</span>
                      </HoverBorderGradient>
                      <HoverBorderGradient onClick={handleusers} className="header-button">
                        <FiLogOut />
                        <span>Users</span>
                      </HoverBorderGradient>
                      <HoverBorderGradient onClick={statistics} className="header-button">
                        <FiLogOut />
                        <span>Statistics</span>
                      </HoverBorderGradient>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* Left Column */}
          <div className="dashboard-left">
            <UserProfileWidget userData={userData} />
            <StatsWidget stats={stats} />
            <DashboardProgress />
            <TasksWidget tasks={tasks} />
          </div>

          {/* Right Column */}
          <div className="dashboard-right">
            <NotificationsWidget
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onRemove={handleRemoveNotification}
              onDismiss={handleDismissNotification}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
