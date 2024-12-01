import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUserPlus, 
  FaUserMinus, 
  FaUserFriends,
  FaShieldAlt,
  FaUnlock,
  FaGem
} from 'react-icons/fa';
import PropTypes from 'prop-types';
import { 
  Card,
  Avatar,
  Typography,
  Button,

  Chip,
  Box,
  Stack,

} from '@mui/material';
import { apiService } from '../../services/api.service';

const UserCard = ({ 
  user, 
  actionType, 
  onAction, 
  disabled, 
  showMutualFriends
}) => {
  const [mutualCount, setMutualCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(user.isBlocked);

  useEffect(() => {
    if (showMutualFriends && user._id) {
      fetchMutualFriendsCount();
    }
  }, [user._id, showMutualFriends]);

  const fetchMutualFriendsCount = async () => {
    try {
      const response = await apiService.getMutualFriends(user._id);
      setMutualCount(response.data.data.mutualFriends.length);
    } catch (err) {
      console.error('Error fetching mutual friends:', err);
    }
  };

  const handleBlock = async () => {
    try {
      if (isBlocked) {
        await apiService.unblockUser(user._id);
        setIsBlocked(false);
      } else {
        await apiService.blockUser(user._id);
        setIsBlocked(true);
      }
    } catch (err) {
      console.error('Error toggling block status:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        elevation={2}
        sx={{
          width: 320,
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
          }
        }}
      >
        {/* Online Status Indicator */}
        {user.isOnline && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: 'success.main',
              border: '2px solid #fff',
              boxShadow: '0 0 0 2px rgba(76, 175, 80, 0.2)'
            }}
          />
        )}

        {/* User Info Section */}
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Avatar
            src={user.avatar ? `${import.meta.env.VITE_API_URL}${user.avatar}` : null}
            alt={user.name || user.email}
            sx={{
              width: 96,
              height: 96,
              mx: 'auto',
              mb: 2,
              border: '4px solid #fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          />
          <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
            {user.name || user.email}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              height: 40
            }}
          >
            {user.bio || 'No bio available'}
          </Typography>

          {/* Stats Section */}
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Chip
              icon={<FaGem style={{ fontSize: '0.9rem' }} />}
              label={`${user.points || 0} Points`}
              variant="outlined"
              size="small"
            />
            {showMutualFriends && mutualCount > 0 && (
              <Chip
                icon={<FaUserFriends style={{ fontSize: '0.9rem' }} />}
                label={`${mutualCount} Mutual`}
                variant="outlined"
                size="small"
              />
            )}
          </Stack>
        </Box>

        {/* Action Buttons Section */}
        <Box
          sx={{
            px: 3,
            pb: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          {actionType === 'remove' ? (
            <>
              <Button 
                variant="outlined"
                color="error"
                startIcon={<FaUserMinus />}
                onClick={onAction}
                fullWidth
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  borderWidth: 1.5,
                  '&:hover': {
                    borderWidth: 1.5,
                    backgroundColor: 'error.lighter'
                  }
                }}
              >
                Unfriend
              </Button>
              <Button
                variant="outlined"
                color={isBlocked ? "success" : "warning"}
                startIcon={isBlocked ? <FaUnlock /> : <FaShieldAlt />}
                onClick={handleBlock}
                fullWidth
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  borderWidth: 1.5,
                  '&:hover': {
                    borderWidth: 1.5,
                    backgroundColor: isBlocked ? 'success.lighter' : 'warning.lighter'
                  }
                }}
              >
                {isBlocked ? 'Unblock User' : 'Block User'}
              </Button>
            </>
          ) : actionType === 'add' ? (
            <Button 
              variant="contained"
              color="primary"
              startIcon={<FaUserPlus />}
              onClick={onAction}
              disabled={disabled}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }
              }}
            >
              Add Friend
            </Button>
          ) : actionType === 'pending' ? (
            <Button 
              variant="outlined"
              disabled
              startIcon={<FaUserFriends />}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              Request Sent
            </Button>
          ) : null}
        </Box>
      </Card>
    </motion.div>
  );
};

UserCard.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    name: PropTypes.string,
    avatar: PropTypes.string,
    bio: PropTypes.string,
    isBlocked: PropTypes.bool,
    isOnline: PropTypes.bool,
    points: PropTypes.number,
    level: PropTypes.number
  }).isRequired,
  actionType: PropTypes.oneOf(['add', 'remove', 'pending']).isRequired,
  onAction: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  showMutualFriends: PropTypes.bool
};

export default UserCard;
