import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api.service';
import { Tabs, Tab, Box, CircularProgress } from '@mui/material';
import FriendList from '../../components/social/FriendList';
import FriendRequests from '../../components/social/FriendRequests';
import SearchUsers from '../../components/social/SearchUsers';
import MutualFriends from '../../components/social/MutualFriends';
import './Social.css';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
};

const ProtectedComponent = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = apiService.isAuthenticated();
      setIsAuthenticated(isAuth);
      if (!isAuth) {
        navigate('/login', { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  return isAuthenticated ? children : null;
};

const Social = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initializeSocialData = async () => {
      try {
        const isAuth = apiService.isAuthenticated();
        if (!isAuth) {
          navigate('/login', { 
            replace: true,
            state: { from: location.pathname }
          });
          return;
        }
        await fetchSocialData();
      } catch (err) {
        setError('Failed to initialize social data');
      } finally {
        setLoading(false);
      }
    };
    initializeSocialData();
  }, [navigate, location]);

  const fetchSocialData = async () => {
    try {
      setLoading(true);
      const [friendsResponse, requestsResponse] = await Promise.all([
        apiService.getFriends(),
        apiService.getFriendRequests()
      ]);
      
      // Extract data from responses and ensure proper structure
      const friendsData = friendsResponse.data?.data?.friends || [];
      const requestsData = requestsResponse.data?.data || [];
      
      console.log('Raw friend requests:', requestsData);

      // Transform the requests data to match expected structure
      const formattedRequests = requestsData.map(request => ({
        _id: request.id, // Map id to _id
        from: {
          ...request.from,
          _id: request.from.id || request.from._id // Handle both id formats
        },
        status: request.status || 'pending',
        createdAt: request.createdAt
      }));

      console.log('Formatted requests:', formattedRequests);
      
      setFriends(friendsData);
      setRequests(formattedRequests);
      setError(null);
    } catch (err) {
      console.error('Error fetching social data:', err);
      setError('Failed to load social data');
      setFriends([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleFriendAction = async (action, userId) => {
    try {
      switch (action) {
        case 'accept':
          await apiService.respondToFriendRequest(userId, 'accept');
          break;
        case 'reject':
          await apiService.respondToFriendRequest(userId, 'reject');
          break;
        case 'remove':
          await apiService.removeFriend(userId);
          break;
        case 'add':
          await apiService.sendFriendRequest(userId);
          break;
        default:
          break;
      }
      await fetchSocialData();
    } catch (err) {
      setError(`Failed to ${action} friend`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
      </div>
    );
  }

  return (
    <ProtectedComponent>
      <motion.div 
        className="social-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError(null)} className="error-close">×</button>
          </div>
        )}
        
        <div className="social-content">
          <div className="social-header">
            <h1>Welcome to BlockLearner</h1>
            <p>Connect with fellow learners and expand your network in the world of Web3.</p>
          </div>
          
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            className="social-tabs"
          >
            <Tab label={`Friends (${friends?.length || 0})`} />
            <Tab label={`Requests (${requests?.length || 0})`} />
            <Tab label="Find Friends" />
            <Tab label="Mutual Friends" />
          </Tabs>

          <TabPanel value={currentTab} index={0}>
            <FriendList 
              friends={friends} 
              onFriendAction={handleFriendAction}
              onError={setError}
            />
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <FriendRequests 
              requests={requests} 
              onRequestAction={handleFriendAction} 
            />
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            <SearchUsers 
              currentFriends={friends}
              onRefresh={fetchSocialData}
              onUserAction={handleFriendAction}
              onError={setError}
            />
          </TabPanel>

          <TabPanel value={currentTab} index={3}>
            <MutualFriends 
              friends={friends} 
              onAddFriend={(userId) => handleFriendAction('add', userId)}
            />
          </TabPanel>
        </div>
      </motion.div>
    </ProtectedComponent>
  );
};

export default Social;
