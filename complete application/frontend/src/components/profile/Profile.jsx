import { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import { apiService } from '../../services/api.service';
import { API_BASE_URL } from '../../config/api.config';
import { 
  FaUser, 
  FaEnvelope, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaSpinner,
  FaPhone,
  FaMapMarkerAlt,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaCog,
  FaBell,
  FaChartLine,
  FaTrophy,
  FaHistory,
  FaShieldAlt
} from 'react-icons/fa';
import AvatarUpload from './AvatarUpload';
import AchievementProgress from './AchievementProgress';
import ActivityLog from './ActivityLog';
import SecurityLog from './SecurityLog';
import NotificationPanel from '../notifications/NotificationPanel';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeSection, setActiveSection] = useState('profile');
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    bio: '',
    role: 'student',
    joinedDate: '',
    phoneNumber: '',
    location: '',
    avatarUrl: '',
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: ''
    }
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!apiService.isAuthenticated()) {
          navigate('/login');
          return;
        }

        setLoading(true);
        setError('');
        
        const response = await apiService.getUserProfile();
        const userData = response.data.user || response.data;
        
        setProfileData(prevData => ({
          ...prevData,
          displayName: userData.name || userData.displayName || 'BlockLearner User',
          email: userData.email,
          bio: userData.bio || 'No bio yet',
          role: userData.role || 'student',
          joinedDate: new Date(userData.createdAt || userData.joinedDate).toLocaleDateString(),
          phoneNumber: userData.phoneNumber || '',
          location: userData.location || '',
          avatarUrl: userData.avatar ? `${API_BASE_URL}${userData.avatar}` : '',
          socialLinks: userData.socialLinks || prevData.socialLinks,
      
        }));
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error.response?.data?.message || 'Failed to load profile data');
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      const updateData = {
        name: profileData.displayName,
        email: profileData.email,
        bio: profileData.bio,
        socialLinks: profileData.socialLinks,
        preferences: profileData.preferences
      };

      const result = await apiService.updateUserProfile(updateData);
      
      if (result.status === 'success') {
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        
        setProfileData(prevData => ({
          ...prevData,
          ...result.data.user
        }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await apiService.deleteMe();
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      setError(error.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const renderProfileDetails = () => (
    <div className="profile-details">
      <div className="profile-header">
        <AvatarUpload 
          currentAvatarUrl={profileData.avatarUrl}
          onAvatarUpdate={(newAvatarUrl) => {
            setProfileData(prev => ({
              ...prev,
              avatarUrl: newAvatarUrl
            }));
          }}
        />
        <h2>Basic Information</h2>
        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                <FaSave /> Save Changes
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                <FaTimes /> Cancel
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              <FaEdit /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="profile-form">
        <div className="form-group">
          <label><FaUser /> Display Name</label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.displayName}
              onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
              placeholder="Enter your name"
            />
          ) : (
            <div>{profileData.displayName}</div>
          )}
        </div>

        <div className="form-group">
          <label><FaEnvelope /> Email</label>
          {isEditing ? (
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              placeholder="Enter your email"
            />
          ) : (
            <div>{profileData.email}</div>
          )}
        </div>

        <div className="form-group full-width">
          <label><FaEdit /> Bio</label>
          {isEditing ? (
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              placeholder="Tell us about yourself"
            />
          ) : (
            <div>{profileData.bio}</div>
          )}
        </div>

        <div className="form-group">
          <label><FaPhone /> Phone Number</label>
          {isEditing ? (
            <input
              type="tel"
              value={profileData.phoneNumber}
              onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
              placeholder="Enter your phone number"
            />
          ) : (
            <div>{profileData.phoneNumber || 'Not provided'}</div>
          )}
        </div>

        <div className="form-group">
          <label><FaMapMarkerAlt /> Location</label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
              placeholder="Enter your location"
            />
          ) : (
            <div>{profileData.location || 'Not provided'}</div>
          )}
        </div>

        <div className="form-group full-width">
          <label>Social Links</label>
          <div className="social-links">
            <div className="form-group">
              <label><FaGithub /> GitHub</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.socialLinks.github}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    socialLinks: { ...profileData.socialLinks, github: e.target.value }
                  })}
                  placeholder="GitHub profile URL"
                />
              ) : (
                <a href={profileData.socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-link">
                   click here to go to github
                </a>
              )}
            </div>

            <div className="form-group">
              <label><FaLinkedin /> LinkedIn</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.socialLinks.linkedin}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    socialLinks: { ...profileData.socialLinks, linkedin: e.target.value }
                  })}
                  placeholder="LinkedIn profile URL"
                />
              ) : (
                <a href={profileData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                 click here to go to LinkedIn
                </a>
              )}
            </div>

            <div className="form-group">
              <label><FaTwitter /> Twitter</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.socialLinks.twitter}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    socialLinks: { ...profileData.socialLinks, twitter: e.target.value }
                  })}
                  placeholder="Twitter profile URL"
                />
              ) : (
                <a href={profileData.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-link">
                 click here to go to Twitter
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );

  const renderNotifications = () => (
    <div className="profile-details">
      <div className="profile-header">
        <h2>Notifications</h2>
      </div>

      <div className="notification-settings">
        <div className="form-group">
          <label>Email Notifications</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="emailNotif"
              checked={profileData.preferences?.emailNotifications}
              onChange={(e) => setProfileData(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  emailNotifications: e.target.checked
                }
              }))}
            />
            <label htmlFor="emailNotif" className="toggle-label"></label>
          </div>
          <p className="setting-description">Receive email notifications about your progress and achievements</p>
        </div>

        <div className="form-group">
          <label>Push Notifications</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="pushNotif"
              checked={profileData.preferences?.pushNotifications}
              onChange={(e) => setProfileData(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  pushNotifications: e.target.checked
                }
              }))}
            />
            <label htmlFor="pushNotif" className="toggle-label"></label>
          </div>
          <p className="setting-description">Receive browser notifications for important updates</p>
        </div>

        <div className="form-group">
          <label>Weekly Digest</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="weeklyDigest"
              checked={profileData.preferences?.weeklyDigest}
              onChange={(e) => setProfileData(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  weeklyDigest: e.target.checked
                }
              }))}
            />
            <label htmlFor="weeklyDigest" className="toggle-label"></label>
          </div>
          <p className="setting-description">Receive a weekly summary of your learning progress</p>
        </div>

        <div className="save-notification-settings">
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? <FaSpinner className="spinner" /> : 'Save Notification Settings'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="profile-details">
      <div className="profile-header">
        <h2>Settings</h2>
      </div>

      <div className="settings-section">
        <div className="danger-zone">
          <h3>Danger Zone</h3>
          <div className="danger-action">
            <div>
              <h4>Delete Account</h4>
              <p>Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            {showDeleteConfirm ? (
              <div className="confirm-delete">
                <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                <div className="confirm-actions">
                  <button className="btn btn-danger" onClick={handleDeleteAccount} disabled={loading}>
                    {loading ? <FaSpinner className="spinner" /> : 'Yes, Delete My Account'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                Delete Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="profile-details">
      <div className="profile-header">
        <h2>Achievements</h2>
      </div>
      <AchievementProgress />
    </div>
  );

  const renderActivityLog = () => (
    <div className="profile-details">
      <div className="profile-header">
        <h2>Activity Log</h2>
      </div>
      <ActivityLog />
    </div>
  );

  const renderSecurityLog = () => (
    <div className="profile-details">
      <div className="profile-header">
        <h2>Security Log</h2>
      </div>
      <SecurityLog />
    </div>
  );

 

  const isAdmin = profileData.role === 'admin';

  const toggleNotificationPanel = () => {
    setIsNotificationPanelOpen(!isNotificationPanelOpen);
  };

  if (loading && !profileData.email) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <span>Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="profile-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Profile</h2>
        </div>
        <div className="sidebar-content">
          <button
            className={`sidebar-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            <FaUser /> Profile
          </button>
          <button
            className={`sidebar-item ${activeSection === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveSection('achievements')}
          >
            <FaTrophy /> Achievements
          </button>
          <button
            className={`sidebar-item ${activeSection === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveSection('activity')}
          >
            <FaHistory /> Activity Log
          </button>
          {isAdmin && (
            <button
              className={`sidebar-item ${activeSection === 'security' ? 'active' : ''}`}
              onClick={() => setActiveSection('security')}
            >
              <FaShieldAlt /> Security Log
            </button>
          )}
          <button
            className={`sidebar-item ${isNotificationPanelOpen ? 'active' : ''}`}
            onClick={toggleNotificationPanel}
          >
            <FaBell /> Notifications
          </button>
          {isAdmin && (
            <button
              className={`sidebar-item ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveSection('settings')}
            >
              <FaCog /> Settings
            </button>
          )}
          <button
            className="sidebar-item"
            onClick={handleDashboardClick}
          >
            <FaChartLine /> Dashboard
          </button>
        </div>
      </div>

      <div className="profile-content">
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        {activeSection === 'profile' && renderProfileDetails()}
        {activeSection === 'achievements' && renderAchievements()}
        {activeSection === 'activity' && renderActivityLog()}
        {activeSection === 'security' && isAdmin && renderSecurityLog()}
        {activeSection === 'notifications' && renderNotifications()}
        {activeSection === 'settings' && isAdmin && renderSettings()}
      </div>

      <NotificationPanel 
        isOpen={isNotificationPanelOpen}
        onClose={toggleNotificationPanel}
        togglePanel={toggleNotificationPanel}
      />
    </div>
  );
};

export default Profile;
