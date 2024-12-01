import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import './styles/TaskAnalytics.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const TaskAnalytics = ({ tasks }) => {
    const [timeRange, setTimeRange] = useState('week');
    const [analyticsData, setAnalyticsData] = useState(null);

    useEffect(() => {
        if (!tasks || tasks.length === 0) return;

        // Process tasks data for analytics
        const processedData = {
            completionRates: processCompletionRates(tasks),
            taskEngagement: processTaskEngagement(tasks),
            categoryDistribution: processCategoryDistribution(tasks),
            difficultyBreakdown: processDifficultyBreakdown(tasks),
            timeToComplete: processTimeToComplete(tasks)
        };

        setAnalyticsData(processedData);
    }, [tasks, timeRange]);

    const processCompletionRates = (tasks) => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString('en-US', { weekday: 'short' });
        }).reverse();

        return last7Days.map(date => {
            const dayTasks = tasks.filter(task => {
                const taskDate = new Date(task.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
                return taskDate === date;
            });

            return {
                date,
                completions: dayTasks.filter(task => task.status === 'completed').length,
                attempts: dayTasks.length
            };
        });
    };

    const processTaskEngagement = (tasks) => {
        return tasks.slice(0, 5).map(task => ({
            task: task.title,
            views: task.views || 0,
            starts: task.attempts || 0,
            completions: task.completions || 0
        }));
    };

    const processCategoryDistribution = (tasks) => {
        const categories = {};
        tasks.forEach(task => {
            const category = task.category || 'Uncategorized';
            categories[category] = (categories[category] || 0) + 1;
        });

        return Object.entries(categories).map(([category, value]) => ({
            category,
            value
        }));
    };

    const processDifficultyBreakdown = (tasks) => {
        const difficulties = {
            Easy: 0,
            Medium: 0,
            Hard: 0
        };

        tasks.forEach(task => {
            if (task.difficulty) {
                difficulties[task.difficulty] = (difficulties[task.difficulty] || 0) + 1;
            }
        });

        return Object.entries(difficulties).map(([difficulty, value]) => ({
            difficulty,
            value
        }));
    };

    const processTimeToComplete = (tasks) => {
        return tasks.slice(0, 5)
            .filter(task => task.averageCompletionTime)
            .map(task => ({
                task: task.title,
                time: task.averageCompletionTime
            }));
    };

    if (!analyticsData) {
        return (
            <Box sx={{ p: 3, backgroundColor: 'white' }}>
                <Typography variant="h6">No analytics data available</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, backgroundColor: 'white' }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
            }}>
                <Typography variant="h5" sx={{
                    color: 'black',
                    fontWeight: 'bold',
                    borderBottom: '2px solid #1976d2',
                    paddingBottom: '8px'
                }}>
                    Task Analytics
                </Typography>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Time Range</InputLabel>
                    <Select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        label="Time Range"
                    >
                        <MenuItem value="day">Last 24 Hours</MenuItem>
                        <MenuItem value="week">Last Week</MenuItem>
                        <MenuItem value="month">Last Month</MenuItem>
                        <MenuItem value="year">Last Year</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3}>
                {/* Completion Rates */}
                <Grid item xs={12} md={6}>
                    <Card sx={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e0e0e0',
                        borderRadius: '10px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{
                                color: 'black',
                                fontWeight: 'bold',
                                borderBottom: '2px solid #1976d2',
                                paddingBottom: '8px',
                                mb: 3
                            }}>
                                Completion Rates
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={analyticsData.completionRates}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="completions"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        name="Completions"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="attempts"
                                        stroke="#82ca9d"
                                        strokeWidth={2}
                                        name="Attempts"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Task Engagement */}
                <Grid item xs={12} md={6}>
                    <Card sx={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e0e0e0',
                        borderRadius: '10px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{
                                color: 'black',
                                fontWeight: 'bold',
                                borderBottom: '2px solid #1976d2',
                                paddingBottom: '8px',
                                mb: 3
                            }}>
                                Task Engagement
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={analyticsData.taskEngagement}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="task" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar
                                        dataKey="views"
                                        fill="#8884d8"
                                        name="Views"
                                    />
                                    <Bar
                                        dataKey="starts"
                                        fill="#82ca9d"
                                        name="Starts"
                                    />
                                    <Bar
                                        dataKey="completions"
                                        fill="#ffc658"
                                        name="Completions"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Category Distribution */}
                <Grid item xs={12} md={6}>
                    <Card sx={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e0e0e0',
                        borderRadius: '10px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{
                                color: 'black',
                                fontWeight: 'bold',
                                borderBottom: '2px solid #1976d2',
                                paddingBottom: '8px',
                                mb: 3
                            }}>
                                Category Distribution
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={analyticsData.categoryDistribution}
                                        dataKey="value"
                                        nameKey="category"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {analyticsData.categoryDistribution.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Difficulty Breakdown */}
                <Grid item xs={12} md={6}>
                    <Card sx={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e0e0e0',
                        borderRadius: '10px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{
                                color: 'black',
                                fontWeight: 'bold',
                                borderBottom: '2px solid #1976d2',
                                paddingBottom: '8px',
                                mb: 3
                            }}>
                                Difficulty Breakdown
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={analyticsData.difficultyBreakdown}
                                        dataKey="value"
                                        nameKey="difficulty"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {analyticsData.difficultyBreakdown.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

TaskAnalytics.propTypes = {
    tasks: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        status: PropTypes.string,
        category: PropTypes.string,
        difficulty: PropTypes.oneOf(['Easy', 'Medium', 'Hard']),
        createdAt: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Date)
        ]),
        views: PropTypes.number,
        attempts: PropTypes.number,
        completions: PropTypes.number,
        averageCompletionTime: PropTypes.number,
        // Analytics specific fields
        completionRate: PropTypes.number,
        engagement: PropTypes.shape({
            views: PropTypes.number,
            starts: PropTypes.number,
            completions: PropTypes.number
        }),
        timeMetrics: PropTypes.shape({
            averageTime: PropTypes.number,
            fastestTime: PropTypes.number,
            slowestTime: PropTypes.number
        })
    })).isRequired
};

export default TaskAnalytics;
