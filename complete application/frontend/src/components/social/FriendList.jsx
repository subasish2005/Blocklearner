import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import './styles/FriendList.css';
import UserCard from './UserCard';

const FriendList = ({ friends = [], onFriendAction, onError }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredFriends = (friends || []).filter(friend => {
    if (!friend?.email) return false;
    
    const matchesSearch = searchQuery === '' || 
      (friend.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (friend.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filter === 'all' || friend.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleRemoveFriend = async (friendId) => {
    try {
      await onFriendAction('remove', friendId);
    } catch (err) {
      onError('Failed to remove friend');
      console.error('Error removing friend:', err);
    }
  };

  return (
    <div className="friend-list-container">
      <div className="friend-list-header">
        <h2>My Friends ({friends.length})</h2>
        <div className="friend-list-controls">
          <input
            type="text"
            placeholder="Search friends by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="friend-search-input"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="friend-filter-select"
          >
            <option value="all">All Friends</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      <motion.div 
        className="friend-list-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {filteredFriends.length > 0 ? (
          filteredFriends.map(friend => (
            <UserCard
              key={friend._id || friend.id}
              user={friend}
              actionType="remove"
              onAction={() => handleRemoveFriend(friend._id || friend.id)}
              showMutualFriends
            />
          ))
        ) : (
          <div className="no-friends-message">
            {searchQuery 
              ? 'No friends found matching your search'
              : 'You haven\'t added any friends yet'}
          </div>
        )}
      </motion.div>
    </div>
  );
};

FriendList.propTypes = {
  friends: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      id: PropTypes.string,
      email: PropTypes.string.isRequired,
      username: PropTypes.string,
      name: PropTypes.string,
      avatar: PropTypes.string,
      bio: PropTypes.string,
      level: PropTypes.number,
      points: PropTypes.number,
      status: PropTypes.string
    })
  ),
  onFriendAction: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
};

export default FriendList;
