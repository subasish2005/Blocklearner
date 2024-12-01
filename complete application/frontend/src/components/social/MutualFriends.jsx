import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { apiService } from '../../services/api.service';
import './styles/MutualFriends.css';
import UserCard from './UserCard';

const MutualFriends = ({ friends = [], onAddFriend }) => {
  const [mutualFriends, setMutualFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMutualFriends = async () => {
      setLoading(true);
      try {
        // Get mutual friends for each friend
        const mutualPromises = friends.map(friend => 
          apiService.getMutualFriends(friend._id)
        );
        
        const mutualResults = await Promise.all(mutualPromises);
        
        // Combine and deduplicate mutual friends
        const allMutualFriends = mutualResults.flatMap(result => 
          result.data.data.mutualFriends
        );
        
        // Remove duplicates based on _id
        const uniqueMutualFriends = Array.from(
          new Map(allMutualFriends.map(friend => [friend._id, friend]))
        ).map(([_, friend]) => friend);

        setMutualFriends(uniqueMutualFriends);
        setError(null);
      } catch (err) {
        console.error('Error fetching mutual friends:', err);
        setError('Failed to load mutual friends');
      } finally {
        setLoading(false);
      }
    };

    if (friends.length > 0) {
      fetchMutualFriends();
    }
  }, [friends]);

  if (loading) {
    return (
      <div className="mutual-friends-loading">
        <p>Loading mutual friends...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mutual-friends-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!mutualFriends.length) {
    return (
      <div className="no-mutual-friends">
        <p>No mutual friends found</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="mutual-friends-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mutual-friends-grid">
        {mutualFriends.map(friend => (
          <UserCard
            key={friend._id}
            user={friend}
            actionType="add"
            onAction={() => onAddFriend(friend._id)}
            showMutualCount
          />
        ))}
      </div>
    </motion.div>
  );
};

MutualFriends.propTypes = {
  friends: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      username: PropTypes.string,
      email: PropTypes.string,
      avatar: PropTypes.string,
    })
  ).isRequired,
  onAddFriend: PropTypes.func.isRequired,
};

export default MutualFriends;
