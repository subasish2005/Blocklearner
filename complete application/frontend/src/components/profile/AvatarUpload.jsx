import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FaCamera, FaSpinner } from 'react-icons/fa';
import { apiService } from '../../services/api.service';
import { API_BASE_URL } from '../../config/api.config';
import './AvatarUpload.css';

const AvatarUpload = ({ currentAvatarUrl, onAvatarUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    uploadAvatar(file);
  };

  const uploadAvatar = async (file) => {
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiService.uploadAvatar(formData);
      
      if (response.data.data.user.avatar) {
        const fullAvatarUrl = `${API_BASE_URL}${response.data.data.user.avatar}`;
        onAvatarUpdate(fullAvatarUrl);
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="avatar-upload-container">
      <div 
        className="avatar-wrapper"
        onClick={handleClick}
        style={{ cursor: loading ? 'wait' : 'pointer' }}
      >
        <img
          src={currentAvatarUrl || '/default-avatar.png'}
          alt="Profile"
          className="avatar-image"
        />
        <div className="avatar-overlay">
          {loading ? (
            <FaSpinner className="spinner" />
          ) : (
            <FaCamera className="camera-icon" />
          )}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      {error && <div className="avatar-error">{error}</div>}
    </div>
  );
};

AvatarUpload.propTypes = {
  currentAvatarUrl: PropTypes.string,
  onAvatarUpdate: PropTypes.func.isRequired
};

AvatarUpload.defaultProps = {
  currentAvatarUrl: '/default-avatar.png'
};

export default AvatarUpload;
