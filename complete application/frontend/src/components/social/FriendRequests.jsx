import  { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import './styles/FriendRequests.css';
import { FaUserPlus, FaUserMinus, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { MdWork, MdSchool } from 'react-icons/md';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

const FriendRequests = ({ requests = [], onRequestAction }) => {
    const [requestsState, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    // const [error, setError] = useState(null);
    const [expandedRequest, setExpandedRequest] = useState(null);

    useEffect(() => {
        // Filter out any invalid requests
        const validRequests = requests.filter(request => 
            request && request.from && (request.from._id || request.from.id)
        );
        setRequests(validRequests);
    }, [requests]);

    const handleAcceptRequest = async (userId) => {
        if (!userId) {
            toast.error('Invalid user ID');
            return;
        }

        try {
            setLoading(true);
            await onRequestAction('accept', userId);
            toast.success('Friend request accepted');
            setRequests(prevRequests => prevRequests.filter(req => 
                (req.from._id || req.from.id) !== userId
            ));
        } catch (err) {
            console.error('Accept error:', err);
            toast.error('Failed to accept friend request');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectRequest = async (userId) => {
        if (!userId) {
            toast.error('Invalid user ID');
            return;
        }

        try {
            setLoading(true);
            await onRequestAction('reject', userId);
            toast.success('Friend request rejected');
            setRequests(prevRequests => prevRequests.filter(req => 
                (req.from._id || req.from.id) !== userId
            ));
        } catch (err) {
            console.error('Reject error:', err);
            toast.error('Failed to reject friend request');
        } finally {
            setLoading(false);
        }
    };

    const toggleRequestDetails = (userId) => {
        setExpandedRequest(expandedRequest === userId ? null : userId);
    };

    if (!Array.isArray(requestsState)) {
        console.error('Invalid requests data:', requestsState);
        return null;
        }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="friend-requests"
        >
            <h2 className="request-header">
                <FaUserPlus className="header-icon" />
                Friend Requests
                {requestsState.length > 0 && (
                    <span className="request-count">
                        {requestsState.length}
                    </span>
                )}
            </h2>
            
            {requestsState.length === 0 ? (
                <motion.div 
                    className="no-requests"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <p className="no-requests-text">
                        No pending friend requests
                    </p>
                </motion.div>
            ) : (
                <div className="request-grid">
                    {requestsState.map((request) => {
                        const sender = request.from;
                        if (!sender || (!sender._id && !sender.id)) return null;

                        const senderId = sender._id || sender.id;
                        const senderName = sender.name || sender.username || 'Unknown User';
                        const senderAvatar = sender.avatar || '/default-avatar.png';
                        const isExpanded = expandedRequest === senderId;
                        
                        return (
                            <motion.div
                                key={senderId}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ y: -4 }}
                                className={`request-item ${isExpanded ? 'expanded' : ''}`}
                                onClick={() => toggleRequestDetails(senderId)}
                            >
                                <div className="request-content">
                                    <div className="avatar-container">
                                        <img
                                            src={senderAvatar}
                                            alt={senderName}
                                            className="request-avatar"
                                            onError={(e) => {
                                                e.target.src = '/default-avatar.png';
                                            }}
                                        />
                                        {sender.isOnline && (
                                            <span className="online-indicator"></span>
                                        )}
                                    </div>
                                    <div className="request-details">
                                        <div className="request-header-content">
                                            <div>
                                                <h3 className="request-name">{senderName}</h3>
                                                <p className="username">@{sender.username}</p>
                                            </div>
                                            <span className="timestamp">
                                                {request.createdAt && formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>

                                        {sender.bio && (
                                            <p className="bio">
                                                {sender.bio}
                                            </p>
                                        )}

                                        <div className="info-grid">
                                            {sender.location && (
                                                <div className="info-item">
                                                    <FaMapMarkerAlt className="info-icon" />
                                                    <span className="info-text">{sender.location}</span>
                                                </div>
                                            )}
                                            {sender.joinDate && (
                                                <div className="info-item">
                                                    <FaCalendarAlt className="info-icon" />
                                                    <span className="info-text">Joined {formatDistanceToNow(new Date(sender.joinDate), { addSuffix: true })}</span>
                                                </div>
                                            )}
                                        </div>

                                        {isExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="expanded-info"
                                            >
                                                {sender.occupation && (
                                                    <div className="info-item">
                                                        <MdWork className="info-icon" />
                                                        <span className="info-text">{sender.occupation}</span>
                                                    </div>
                                                )}
                                                {sender.education && (
                                                    <div className="info-item">
                                                        <MdSchool className="info-icon" />
                                                        <span className="info-text">{sender.education}</span>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}

                                        <div className="request-actions">
                                            <motion.button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAcceptRequest(senderId);
                                                }}
                                                className="accept-button"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                disabled={loading}
                                            >
                                                <FaUserPlus className="button-icon" />
                                                Accept
                                            </motion.button>
                                            <motion.button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRejectRequest(senderId);
                                                }}
                                                className="reject-button"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                disabled={loading}
                                            >
                                                <FaUserMinus className="button-icon" />
                                                Decline
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

FriendRequests.propTypes = {
    requests: PropTypes.arrayOf(
        PropTypes.shape({
        _id: PropTypes.string,
        from: PropTypes.shape({
            _id: PropTypes.string,
            id: PropTypes.string,
            name: PropTypes.string,
            username: PropTypes.string,
                avatar: PropTypes.string,
            bio: PropTypes.string,
            location: PropTypes.string,
            joinDate: PropTypes.string,
            occupation: PropTypes.string,
            education: PropTypes.string,
            isOnline: PropTypes.bool
            }).isRequired,
            status: PropTypes.string,
        createdAt: PropTypes.string
        })
    ),
    onRequestAction: PropTypes.func.isRequired
};

export default FriendRequests;
