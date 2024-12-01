import PropTypes from 'prop-types';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import './widgets.css';

const UserProfileWidget = ({ userData }) => {
  if (!userData) {
    return (
      <div className="widget user-profile-widget">
        <div className="widget-header">
          <h3>User Profile</h3>
        </div>
        <div className="loading">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="widget user-profile-widget">
      <div className="user-profile-header">
        <div>
          <div className="user-info">
            <PersonIcon className="info-icon" />
            <div className="user-name">
              
              <p className="user-name">{userData.name}</p>
            </div>
          </div>
          <div className="user-info">
            <EmailIcon className="info-icon" />
            <div className="user-name">
              
              <p className="user-email">{userData.email}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="user-stats">
        <div className="user-stat-item">
          <div className="stat-icon-container purple">
            <EmojiEventsIcon className="stat-icon" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Level</p>
            <p className="stat-value">{userData.level || 1}</p>
          </div>
        </div>
        <div className="user-stat-item">
          <div className="stat-icon-container green">
            <TrendingUpIcon className="stat-icon" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Experience</p>
            <p className="stat-value">{userData.experience || 0} XP</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Prop-types validation
UserProfileWidget.propTypes = {
  userData: PropTypes.shape({
    avatar: PropTypes.string,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    level: PropTypes.number,
    experience: PropTypes.number,
  }),
};

export default UserProfileWidget;
