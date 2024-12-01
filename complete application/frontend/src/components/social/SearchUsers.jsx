import { useState } from 'react';
import PropTypes from 'prop-types';
import { apiService } from '../../services/api.service';
import UserCard from './UserCard';
import './styles/SearchUsers.css';

const SearchUsers = ({ currentFriends, onRefresh, onUserAction, onError }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await apiService.searchUsers(searchQuery.trim());
      const users = response.data.data.users;
      
      // Filter out current friends
      const filteredUsers = users.filter(user => 
        !currentFriends.some(friend => friend._id === user._id)
      );
      
      setSearchResults(filteredUsers);
    } catch (err) {
      onError('Failed to search users');
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await onUserAction('add', userId);
      // Update the search results to reflect the sent request
      setSearchResults(prevResults =>
        prevResults.map(user =>
          user._id === userId
            ? { ...user, requestSent: true }
            : user
        )
      );
      onRefresh(); // Refresh friend lists
    } catch (err) {
      onError('Failed to send friend request');
      console.error('Error sending friend request:', err);
    }
  };

  return (
    <div className="search-users-container">
      <div className="search-header">
        <h2>Find Friends</h2>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or username..."
            className="search-input"
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      <div className="search-results">
        {searchResults.length > 0 ? (
          searchResults.map(user => (
            <UserCard
              key={user._id}
              user={{
                _id: user._id,
                username: user.username || user.name,
                email: user.email,
                photoURL: user.avatar || user.photoURL,
                isOnline: user.isOnline,
                points: user.points || 0,
                achievements: user.achievements || []
              }}
              actionType={user.requestSent ? 'pending' : 'add'}
              onAction={() => handleSendRequest(user._id)}
              disabled={user.requestSent}
              showMutualFriends={false}
              showSocialFeatures={false}
            />
          ))
        ) : (
          <p className="no-results">
            {searchQuery ? 'No users found' : 'Start searching to find friends'}
          </p>
        )}
      </div>
    </div>
  );
};

SearchUsers.propTypes = {
  currentFriends: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      name: PropTypes.string,
      avatar: PropTypes.string
    })
  ).isRequired,
  onRefresh: PropTypes.func.isRequired,
  onUserAction: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
};

export default SearchUsers;
