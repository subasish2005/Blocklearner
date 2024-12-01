import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { FaHeart, FaRegHeart, FaComment, FaReply, FaTrophy } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { apiService } from '../../services/api.service';
import Avatar from '../common/Avatar';
import './styles/WeeklyActivityFeed.css';

const WeeklyActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  useEffect(() => {
    fetchWeeklyActivity();
  }, [page]);

  const fetchWeeklyActivity = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/v1/dashboard/activity');
      
      if (response.data?.data?.weeklyActivity) {
        const activities = response.data.data.weeklyActivity;
        
        // Group activities by date
        const groupedActivities = activities.reduce((acc, activity) => {
          const date = format(parseISO(activity._id), 'yyyy-MM-dd');
          if (!acc[date]) {
            acc[date] = {
              date,
              points: activity.points,
              tasksCompleted: activity.tasksCompleted,
              achievements: activity.achievements,
              activities: []
            };
          }
          return acc;
        }, {});

        // Convert to array and sort by date
        const sortedActivities = Object.entries(groupedActivities)
          .map(([date, data]) => ({
            date,
            ...data
          }))
          .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

        setActivities(sortedActivities);
        setHasMore(activities.length === 10);
      } else {
        setActivities([]);
        setHasMore(false);
      }
    } catch (error) {
      setError('Failed to fetch activity feed');
      toast.error('Failed to load activity feed');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleLike = async (activityId) => {
    try {
      const response = await apiService.likeActivity(activityId);
      if (response.data && response.data.success) {
        setActivities(prevActivities => 
          prevActivities.map(day => ({
            ...day,
            activities: day.activities.map(activity => 
              activity._id === activityId
                ? {
                    ...activity,
                    liked: !activity.liked,
                    likesCount: activity.liked ? activity.likesCount - 1 : activity.likesCount + 1
                  }
                : activity
            )
          }))
        );
      }
    } catch (err) {
      console.error('Error liking activity:', err);
      toast.error('Failed to like activity');
    }
  };

  const handleComment = async (activityId) => {
    const comment = commentInputs[activityId];
    if (!comment?.trim()) return;

    try {
      const response = await apiService.commentOnActivity(activityId, comment);
      if (response.data && response.data.success) {
        setActivities(prevActivities => 
          prevActivities.map(day => ({
            ...day,
            activities: day.activities.map(activity => 
              activity._id === activityId
                ? {
                    ...activity,
                    comments: [...activity.comments, response.data.comment],
                    commentsCount: activity.commentsCount + 1
                  }
                : activity
            )
          }))
        );
        
        setCommentInputs(prev => ({ ...prev, [activityId]: '' }));
        toast.success('Comment added successfully');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      toast.error('Failed to post comment');
    }
  };

  const toggleComments = (activityId) => {
    setExpandedComments(prev => ({
      ...prev,
      [activityId]: !prev[activityId]
    }));
  };

  const renderActivitySummary = (activity) => (
    <div className="activity-summary">
      <div className="activity-stats">
        <span>Points Earned: {activity.points}</span>
        <span>Tasks Completed: {activity.tasksCompleted}</span>
      </div>
      {activity.achievements > 0 && (
        <div className="achievement-stat">
          <FaTrophy /> {activity.achievements} Achievement{activity.achievements !== 1 ? 's' : ''} Earned
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="activity-feed-container">
      {activities.map((day) => (
        <motion.div
          key={day.date}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="activity-day"
        >
          <h3 className="day-header">
            {format(parseISO(day.date), 'EEEE, MMMM d')}
          </h3>
          
          <div className="space-y-4">
            {renderActivitySummary(day)}
            {day.activities.map(activity => (
              <motion.div
                key={activity._id}
                className="activity-card"
                whileHover={{ scale: 1.01 }}
              >
                <div className="activity-header">
                  <Avatar
                    src={activity.user?.avatar}
                    alt={activity.user?.username || 'User'}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium">{activity.user?.username || 'User'}</h4>
                    <span className="text-sm text-gray-500">
                      {format(parseISO(activity.createdAt), 'h:mm a')}
                    </span>
                  </div>
                </div>

                <div className="activity-content">
                  {activity.content || activity.description}
                </div>

                <div className="activity-footer">
                  <button 
                    className={`interaction-button ${activity.liked ? 'liked' : ''}`}
                    onClick={() => handleLike(activity._id)}
                  >
                    {activity.liked ? <FaHeart /> : <FaRegHeart />}
                    <span>{activity.likesCount || 0}</span>
                  </button>

                  <button 
                    className="interaction-button"
                    onClick={() => toggleComments(activity._id)}
                  >
                    <FaComment />
                    <span>{activity.commentsCount || 0}</span>
                  </button>
                </div>

                <AnimatePresence>
                  {expandedComments[activity._id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 space-y-3"
                    >
                      {activity.comments?.map(comment => (
                        <div
                          key={comment._id}
                          className="flex items-start space-x-3 bg-gray-50 dark:bg-gray-700 p-3 rounded"
                        >
                          <Avatar
                            src={comment.user?.avatar}
                            alt={comment.user?.username || 'User'}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <h5 className="font-medium text-sm">
                              {comment.user?.username || 'User'}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <input
                          type="text"
                          value={commentInputs[activity._id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({
                            ...prev,
                            [activity._id]: e.target.value
                          }))}
                          placeholder="Write a comment..."
                          className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleComment(activity._id)}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          <FaReply />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
      
      {!loading && !error && activities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No activities to show
        </div>
      )}

      {hasMore && !loading && !error && (
        <div className="text-center py-4">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Load More
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default WeeklyActivityFeed;
