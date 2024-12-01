import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';
import './SecurityLog.css';

const SecurityLog = () => {
    const [securityLogs, setSecurityLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        eventType: 'all',
        severity: 'all',
        period: '30days'
    });

    useEffect(() => {
        fetchSecurityLogs();
    }, [filters]);

    const fetchSecurityLogs = async () => {
        try {
            setLoading(true);
            const response = await apiService.getSecurityLog(filters.period);
            
            // Log the response to debug
            console.log('Security Log Response:', response);
            
            // Get the logs array from the nested response structure
            const logs = response?.data?.data?.logs || [];
            console.log('Parsed logs:', logs);
            
            // Transform the logs to match the component's expected format
            const formattedLogs = logs.map(log => ({
                id: log._id,
                type: log.type,
                title: getEventTitle(log.type),
                description: log.content || getEventDescription(log),
                timestamp: log.createdAt,
                severity: getEventSeverity(log.type),
                ipAddress: log.metadata?.ipAddress || 'Unknown',
                location: log.metadata?.location || 'Unknown',
                deviceInfo: log.metadata?.userAgent || 'Unknown'
            }));
            
            console.log('Formatted logs:', formattedLogs);
            setSecurityLogs(formattedLogs);
        } catch (err) {
            console.error('Error fetching security logs:', err);
            setError(err.message || 'Failed to fetch security logs');
        } finally {
            setLoading(false);
        }
    };

    const getEventTitle = (type) => {
        const titles = {
            login: 'Login Activity',
            login_failed: 'Failed Login Attempt',
            logout: 'Logout Activity',
            password_change: 'Password Changed',
            email_change: 'Email Updated',
            profile_update: 'Profile Updated',
            settings_update: 'Settings Changed'
        };
        return titles[type] || 'Security Event';
    };

    const getEventDescription = (log) => {
        const descriptions = {
            login: 'Successfully logged in to account',
            login_failed: `Failed login attempt - ${log.metadata?.reason || 'unknown reason'}`,
            logout: 'Successfully logged out of account',
            password_change: 'Password was successfully changed',
            email_change: 'Email address was updated',
            profile_update: 'Profile information was updated',
            settings_update: 'Account settings were modified'
        };
        return descriptions[log.type] || 'Security event occurred';
    };

    const getEventSeverity = (type) => {
        const severities = {
            login: 'info',
            login_failed: 'high',
            logout: 'info',
            password_change: 'medium',
            email_change: 'medium',
            profile_update: 'low',
            settings_update: 'low'
        };
        return severities[type] || 'info';
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const getSeverityClass = (severity) => {
        const classes = {
            high: 'severity-high',
            medium: 'severity-medium',
            low: 'severity-low',
            info: 'severity-info'
        };
        return classes[severity] || classes.info;
    };

    const getEventIcon = (eventType) => {
        const icons = {
            login: '🔐',
            login_failed: '⚠️',
            logout: '👋',
            password_change: '🔑',
            email_change: '✉️',
            profile_update: '👤',
            settings_update: '⚙️',
            default: '🛡️'
        };
        return icons[eventType] || icons.default;
    };

    if (loading) {
        return (
            <div className="security-loading">
                <div className="security-spinner"></div>
                <p>Loading security logs...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="security-error">
                <p>{error}</p>
                <button onClick={fetchSecurityLogs}>Retry</button>
            </div>
        );
    }

    return (
        <div className="security-log-container">
            <div className="security-header">
                <h2>Security Log</h2>
                <div className="security-filters">
                    <select 
                        value={filters.eventType} 
                        onChange={(e) => handleFilterChange('eventType', e.target.value)}
                    >
                        <option value="all">All Events</option>
                        <option value="login">Login Activities</option>
                        <option value="login_failed">Failed Logins</option>
                        <option value="logout">Logouts</option>
                        <option value="password_change">Password Changes</option>
                        <option value="email_change">Email Changes</option>
                        <option value="profile_update">Profile Updates</option>
                        <option value="settings_update">Settings Changes</option>
                    </select>

                    <select 
                        value={filters.severity} 
                        onChange={(e) => handleFilterChange('severity', e.target.value)}
                    >
                        <option value="all">All Severities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                        <option value="info">Info</option>
                    </select>

                    <select 
                        value={filters.period} 
                        onChange={(e) => handleFilterChange('period', e.target.value)}
                    >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                    </select>
                </div>
            </div>

            <div className="security-events">
                {securityLogs.length === 0 ? (
                    <div className="no-events">
                        <p>No security events found for the selected filters.</p>
                    </div>
                ) : (
                    securityLogs.map((event) => (
                        <div key={event.id} className={`security-event ${getSeverityClass(event.severity)}`}>
                            <div className="event-icon">
                                {getEventIcon(event.type)}
                            </div>
                            <div className="event-content">
                                <div className="event-header">
                                    <h4>{event.title}</h4>
                                    <span className="event-time">
                                        {new Date(event.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <p className="event-description">{event.description}</p>
                                <div className="event-details">
                                    {event.ipAddress && event.ipAddress !== 'Unknown' && (
                                        <span className="event-ip">IP: {event.ipAddress}</span>
                                    )}
                                    {event.location && event.location !== 'Unknown' && (
                                        <span className="event-location">{event.location}</span>
                                    )}
                                    {event.deviceInfo && event.deviceInfo !== 'Unknown' && (
                                        <span className="event-device">{event.deviceInfo}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SecurityLog;
