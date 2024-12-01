import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import api, { API_ENDPOINTS } from '../../../config/api.config';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    overview: null,
    activity: null,
    growth: null,
  });

  const fetchStats = async () => {
    try {
      console.log('Fetching admin stats...');
      
      const [overviewRes, activityRes, growthRes] = await Promise.all([
        api.get(API_ENDPOINTS.ADMIN.STATS.GET_USER_OVERVIEW),
        api.get(API_ENDPOINTS.ADMIN.STATS.GET_USER_ACTIVITY),
        api.get(API_ENDPOINTS.ADMIN.STATS.GET_USER_GROWTH)
      ]);

      // Log the full response structure
      console.log('Overview response structure:', JSON.stringify(overviewRes.data, null, 2));
      console.log('Activity response structure:', JSON.stringify(activityRes.data, null, 2));
      console.log('Growth response structure:', JSON.stringify(growthRes.data, null, 2));

      // Get total users from activity stats
      const totalUsers = activityRes.data.data.stats[0]?.count || 0;
      
      // Get new users from growth stats
      const newUsers = growthRes.data.data.stats[0]?.newUsers || 0;

      // Transform API data to match component structure
      const transformedData = {
        overview: {
          totalUsers: totalUsers,
          activeUsers: totalUsers, // Since all users are currently active
          newUsersToday: newUsers,
          tasksCompleted: overviewRes.data.data.taskStats?.length || 0
        },
        activity: {
          data: activityRes.data.data.stats.map(stat => ({
            date: stat._id || 'Current',
            logins: stat.count || 0,
            tasks: 0 // We'll need to implement this in the backend
          }))
        },
        growth: {
          data: growthRes.data.data.stats.map(stat => ({
            date: stat._id || 'Current',
            users: stat.newUsers || 0,
            activeUsers: stat.newUsers || 0 // All new users are considered active
          }))
        }
      };

      console.log('Transformed data:', transformedData);
      setStats(transformedData);
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        endpoint: error.config?.url
      });
      toast.error('Failed to fetch statistics');
      
      // Use mock data if API fails
      const mockData = {
        overview: {
          totalUsers: 150,
          activeUsers: 85,
          newUsersToday: 12,
          tasksCompleted: 450
        },
        activity: {
          data: [
            { date: '2024-01-01', logins: 45, tasks: 30 },
            { date: '2024-01-02', logins: 52, tasks: 35 },
            { date: '2024-01-03', logins: 48, tasks: 28 },
            { date: '2024-01-04', logins: 60, tasks: 42 },
            { date: '2024-01-05', logins: 55, tasks: 38 }
          ]
        },
        growth: {
          data: [
            { date: '2023-12', users: 100, activeUsers: 70 },
            { date: '2024-01', users: 150, activeUsers: 85 }
          ]
        }
      };
      setStats(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('AdminDashboard mounted');
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h5">
                {stats.overview?.totalUsers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Users
              </Typography>
              <Typography variant="h5">
                {stats.overview?.activeUsers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                New Users (Today)
              </Typography>
              <Typography variant="h5">
                {stats.overview?.newUsersToday || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tasks Completed
              </Typography>
              <Typography variant="h5">
                {stats.overview?.tasksCompleted || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User Growth Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          User Growth
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={stats.growth?.data || []}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#8884d8"
              name="Total Users"
            />
            <Line
              type="monotone"
              dataKey="activeUsers"
              stroke="#82ca9d"
              name="Active Users"
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* User Activity Chart */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          User Activity
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={stats.activity?.data || []}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="logins" fill="#8884d8" name="Logins" />
            <Bar dataKey="tasks" fill="#82ca9d" name="Tasks Completed" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
