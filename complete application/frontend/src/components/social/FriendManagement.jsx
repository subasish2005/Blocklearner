import { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';
import FriendList from './FriendList';
import FriendRequests from './FriendRequests';
import SearchUsers from './SearchUsers';
import MutualFriends from './MutualFriends';
import './styles/FriendManagement.css';

const FriendManagement = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFriendsData();
  }, []);

  const fetchFriendsData = async () => {
    try {
      setLoading(true);
      const [friendsResponse, requestsResponse] = await Promise.all([
        apiService.getFriends(),
        apiService.getFriendRequests()
      ]);
      
      setFriends(friendsResponse.data.data.friends);
      setRequests(requestsResponse.data.data.requests);
      setError(null);
    } catch (err) {
      setError('Failed to load friend data');
      console.error('Error fetching friend data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleFriendRequest = async (userId, action) => {
    try {
      if (action === 'accept') {
        await apiService.acceptFriendRequest(userId);
      } else if (action === 'reject') {
        await apiService.rejectFriendRequest(userId);
      }
      fetchFriendsData(); // Refresh data after action
    } catch (err) {
      setError(`Failed to ${action} friend request`);
      console.error(`Error ${action}ing friend request:`, err);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await apiService.removeFriend(friendId);
      fetchFriendsData(); // Refresh friend list
    } catch (err) {
      setError('Failed to remove friend');
      console.error('Error removing friend:', err);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="friend-management-container">
      <div className="friend-management-header">
        <h2>Friend Management</h2>
        <div className="friend-management-tabs">
          <button
            className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => handleTabChange('friends')}
          >
            Friends ({friends.length})
          </button>
          <button
            className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => handleTabChange('requests')}
          >
            Requests ({requests.length})
          </button>
          <button
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => handleTabChange('search')}
          >
            Find Friends
          </button>
        </div>
      </div>

      <div className="friend-management-content">
        {activeTab === 'friends' && (
          <FriendList
            friends={friends}
            onRemoveFriend={handleRemoveFriend}
          />
        )}
        {activeTab === 'requests' && (
          <FriendRequests
            requests={requests}
            onAction={handleFriendRequest}
          />
        )}
        {activeTab === 'search' && (
          <SearchUsers
            currentFriends={friends}
            onRefresh={fetchFriendsData}
          />
        )}
      </div>

      <div className="friend-management-sidebar">
        <MutualFriends friends={friends} />
      </div>
    </div>
  );
};

export default FriendManagement;
