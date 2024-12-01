import  { useState, useEffect } from 'react';
import { FaBell, FaEnvelope, FaComment, FaUserFriends, FaAt, FaClock, FaSave, FaSpinner } from 'react-icons/fa';
import { apiService } from '../../services/api.service';
import './NotificationPreferences.css';
import { toast } from 'react-toastify';

const NotificationPreferences = () => {
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        pushNotifications: true,
        notifyOnNewMessage: true,
        notifyOnFriendRequest: true,
        notifyOnFriendAccept: true,
        notifyOnMention: true,
        digestFrequency: 'daily'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const response = await apiService.getNotificationPreferences();
            if (response.data?.preferences) {
                setPreferences(response.data.preferences);
            }
        } catch (error) {
            console.error('Error fetching preferences:', error);
            toast.error('Failed to load notification preferences');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
        setHasChanges(true);
    };

    const handleFrequencyChange = (event) => {
        setPreferences(prev => ({
            ...prev,
            digestFrequency: event.target.value
        }));
        setHasChanges(true);
    };

    const savePreferences = async () => {
        setSaving(true);
        try {
            await apiService.updateNotificationPreferences(preferences);
            toast.success('Notification preferences updated successfully');
            setHasChanges(false);
        } catch (error) {
            console.error('Error saving preferences:', error);
            toast.error('Failed to update notification preferences');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="notification-preferences-loading">
                <FaSpinner className="spinner" />
                <p>Loading preferences...</p>
            </div>
        );
    }

    return (
        <div className="notification-preferences">
            <div className="preferences-header">
                <h2><FaBell /> Notification Preferences</h2>
                <p>Customize how you want to receive notifications</p>
            </div>

            <div className="preferences-section">
                <h3>General Settings</h3>
                <div className="preference-item">
                    <div className="preference-info">
                        <FaEnvelope className="preference-icon" />
                        <div>
                            <h4>Email Notifications</h4>
                            <p>Receive notifications via email</p>
                        </div>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={preferences.emailNotifications}
                            onChange={() => handleToggle('emailNotifications')}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="preference-item">
                    <div className="preference-info">
                        <FaBell className="preference-icon" />
                        <div>
                            <h4>Push Notifications</h4>
                            <p>Receive push notifications in your browser</p>
                        </div>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={preferences.pushNotifications}
                            onChange={() => handleToggle('pushNotifications')}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </div>

            <div className="preferences-section">
                <h3>Notification Types</h3>
                <div className="preference-item">
                    <div className="preference-info">
                        <FaComment className="preference-icon" />
                        <div>
                            <h4>New Messages</h4>
                            <p>Get notified when you receive new messages</p>
                        </div>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={preferences.notifyOnNewMessage}
                            onChange={() => handleToggle('notifyOnNewMessage')}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="preference-item">
                    <div className="preference-info">
                        <FaUserFriends className="preference-icon" />
                        <div>
                            <h4>Friend Requests</h4>
                            <p>Get notified about new friend requests</p>
                        </div>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={preferences.notifyOnFriendRequest}
                            onChange={() => handleToggle('notifyOnFriendRequest')}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="preference-item">
                    <div className="preference-info">
                        <FaUserFriends className="preference-icon" />
                        <div>
                            <h4>Friend Accepts</h4>
                            <p>Get notified when someone accepts your friend request</p>
                        </div>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={preferences.notifyOnFriendAccept}
                            onChange={() => handleToggle('notifyOnFriendAccept')}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="preference-item">
                    <div className="preference-info">
                        <FaAt className="preference-icon" />
                        <div>
                            <h4>Mentions</h4>
                            <p>Get notified when someone mentions you</p>
                        </div>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={preferences.notifyOnMention}
                            onChange={() => handleToggle('notifyOnMention')}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </div>

            <div className="preferences-section">
                <h3>Digest Frequency</h3>
                <div className="preference-item">
                    <div className="preference-info">
                        <FaClock className="preference-icon" />
                        <div>
                            <h4>Summary Emails</h4>
                            <p>How often would you like to receive summary emails?</p>
                        </div>
                    </div>
                    <select
                        className="frequency-select"
                        value={preferences.digestFrequency}
                        onChange={handleFrequencyChange}
                    >
                        <option value="never">Never</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                    </select>
                </div>
            </div>

            <div className="preferences-actions">
                <button 
                    className="save-button" 
                    onClick={savePreferences}
                    disabled={saving || !hasChanges}
                >
                    {saving ? (
                        <>
                            <FaSpinner className="spinner" /> Saving...
                        </>
                    ) : (
                        <>
                            <FaSave /> Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default NotificationPreferences;
