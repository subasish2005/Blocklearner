import PropTypes from 'prop-types';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import {
    Assignment as AssignmentIcon,
    People as PeopleIcon,
    EmojiEvents as EmojiEventsIcon,
    TrendingUp as TrendingUpIcon,
    Timeline as TimelineIcon,
    Speed as SpeedIcon
} from '@mui/icons-material';

const StatCard = ({ title, value, icon }) => (
    <Card sx={{ 
        height: '100%',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e0e0e0',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }
    }}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                    backgroundColor: '#e3f2fd',
                    borderRadius: '50%',
                    p: 1,
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {icon}
                </Box>
                <Typography variant="h6" component="div" sx={{ color: '#666' }}>
                    {title}
                </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ 
                textAlign: 'right',
                color: '#1976d2',
                fontWeight: 'bold'
            }}>
                {value}
            </Typography>
        </CardContent>
    </Card>
);

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]).isRequired,
    icon: PropTypes.element.isRequired
};

const TaskStats = ({ 
    globalStats = {
        tasks: {
            totalAttempts: 0,
            completedTasks: 0,
            totalPoints: 0,
            averageCompletionRate: 0
        },
        users: {
            totalUsers: 0,
            averageLevel: 0
        }
    } 
}) => {
    if (!globalStats?.tasks || !globalStats?.users) {
        return (
            <Box sx={{ p: 3, backgroundColor: 'white' }}>
                <Typography variant="h6">No statistics available</Typography>
            </Box>
        );
    }

    const { tasks, users } = globalStats;
    const stats = [
        {
            title: "Total Attempts",
            value: tasks.totalAttempts || 0,
            icon: <AssignmentIcon sx={{ color: '#1976d2' }} />
        },
        {
            title: "Completed Tasks",
            value: tasks.completedTasks || 0,
            icon: <PeopleIcon sx={{ color: '#1976d2' }} />
        },
        {
            title: "Total Points",
            value: tasks.totalPoints || 0,
            icon: <EmojiEventsIcon sx={{ color: '#1976d2' }} />
        },
        {
            title: "Completion Rate",
            value: `${tasks.averageCompletionRate || 0}%`,
            icon: <SpeedIcon sx={{ color: '#1976d2' }} />
        },
        {
            title: "Total Users",
            value: users.totalUsers || 0,
            icon: <TrendingUpIcon sx={{ color: '#1976d2' }} />
        },
        {
            title: "Average Level",
            value: users.averageLevel || 0,
            icon: <TimelineIcon sx={{ color: '#1976d2' }} />
        }
    ];

    return (
        <Box sx={{ p: 3, backgroundColor: 'white' }}>
            <Typography variant="h5" gutterBottom sx={{ 
                color: 'black', 
                fontWeight: 'bold', 
                mb: 4,
                borderBottom: '2px solid #1976d2',
                paddingBottom: '8px'
            }}>
                Global Statistics
            </Typography>

            <Grid container spacing={3}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <StatCard
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

TaskStats.propTypes = {
    globalStats: PropTypes.shape({
        tasks: PropTypes.shape({
            totalAttempts: PropTypes.number,
            completedTasks: PropTypes.number,
            totalPoints: PropTypes.number,
            averageCompletionRate: PropTypes.number
        }),
        users: PropTypes.shape({
            totalUsers: PropTypes.number,
            averageLevel: PropTypes.number
        })
    })
};

export default TaskStats;
