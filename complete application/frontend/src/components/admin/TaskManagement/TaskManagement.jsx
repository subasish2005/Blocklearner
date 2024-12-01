import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Tabs, Tab, Button, Paper, Container, CircularProgress } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import TaskVerification from './TaskVerification';
import TaskAnalytics from './TaskAnalytics';
import TaskStats from './TaskStats';
import api, { API_ENDPOINTS } from '../../../config/api.config';
import toast from 'react-hot-toast';
import './styles/TaskManagement.css';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`task-tabpanel-${index}`}
            aria-labelledby={`task-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Paper elevation={0} sx={{ p: 3, bgcolor: 'transparent' }}>
                    {children}
                </Paper>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    value: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
};

// Define prop types for child components
TaskList.propTypes = {
    tasks: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        category: PropTypes.string,
        points: PropTypes.number,
        type: PropTypes.string,
        verification: PropTypes.shape({
            type: PropTypes.string,
            config: PropTypes.shape({
                requiredProof: PropTypes.string,
                instructions: PropTypes.string
            })
        })
    })).isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

TaskForm.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialData: PropTypes.shape({
        _id: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
        category: PropTypes.string,
        points: PropTypes.number,
        type: PropTypes.string,
        verification: PropTypes.shape({
            type: PropTypes.string,
            config: PropTypes.shape({
                requiredProof: PropTypes.string,
                instructions: PropTypes.string
            })
        })
    }),
    isEdit: PropTypes.bool.isRequired,
    categories: PropTypes.arrayOf(PropTypes.string).isRequired
};

TaskVerification.propTypes = {
    verifications: PropTypes.arrayOf(PropTypes.shape({
        task: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired
        }).isRequired,
        user: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired
        }).isRequired,
        proof: PropTypes.string,
        status: PropTypes.string
    })).isRequired,
    onVerify: PropTypes.func.isRequired
};

TaskAnalytics.propTypes = {
    tasks: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        category: PropTypes.string,
        points: PropTypes.number,
        completions: PropTypes.number
    })).isRequired
};

TaskStats.propTypes = {
    globalStats: PropTypes.shape({
        totalTasks: PropTypes.number,
        completedTasks: PropTypes.number,
        totalPoints: PropTypes.number,
        averageCompletion: PropTypes.number
    })
};

function TaskManagement() {
    const [value, setValue] = useState(0);
    const [tasks, setTasks] = useState([]);
    const [verifications, setVerifications] = useState([]);
    const [globalStats, setGlobalStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [categories, setCategories] = useState(['onboarding', 'social', 'community', 'technical', 'feedback', 'special']);

    // Fetch all required data
    const fetchData = async () => {
        try {
            setIsLoading(true);
            console.log('Fetching data from endpoints:', {
                tasks: API_ENDPOINTS.GAMIFIED_TASKS.GET_ALL,
                verifications: API_ENDPOINTS.GAMIFIED_TASKS.ADMIN.GET_PENDING_VERIFICATIONS,
                stats: API_ENDPOINTS.GAMIFIED_TASKS.GET_GLOBAL_STATS
            });

            const [tasksRes, verificationsRes, statsRes] = await Promise.all([
                api.get(API_ENDPOINTS.GAMIFIED_TASKS.GET_ALL),
                api.get(API_ENDPOINTS.GAMIFIED_TASKS.ADMIN.GET_PENDING_VERIFICATIONS),
                api.get(API_ENDPOINTS.GAMIFIED_TASKS.GET_GLOBAL_STATS)
            ]);

            console.log('Tasks Response:', {
                status: tasksRes.status,
                data: tasksRes.data,
                tasks: tasksRes.data?.data?.tasks
            });
            console.log('Verifications Response:', {
                status: verificationsRes.status,
                data: verificationsRes.data,
                pending: verificationsRes.data?.data?.pending
            });
            console.log('Stats Response:', {
                status: statsRes.status,
                data: statsRes.data,
                stats: statsRes.data?.data
            });

            setTasks(tasksRes.data?.data?.tasks || []);
            setVerifications(verificationsRes.data?.data?.pending || []);
            
            // More detailed handling of stats data
            const statsData = statsRes.data?.data;
            console.log('Processing stats data:', statsData);
            
            if (statsData) {
                setGlobalStats({
                    tasks: {
                        totalAttempts: statsData.tasks?.totalAttempts || 0,
                        completedTasks: statsData.tasks?.completedTasks || 0,
                        totalPoints: statsData.tasks?.totalPoints || 0,
                        averageCompletionRate: statsData.tasks?.averageCompletionRate || 0
                    },
                    users: {
                        totalUsers: statsData.users?.totalUsers || 0,
                        averageLevel: statsData.users?.averageLevel || 0,
                        maxLevel: statsData.users?.maxLevel || 0
                    }
                });
            } else {
                console.warn('No stats data received from the API');
                setGlobalStats(null);
            }

            // If the API returns categories, update them here
            if (tasksRes.data?.data?.categories) {
                setCategories(tasksRes.data.data.categories);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load task management data');
            setTasks([]);
            setVerifications([]);
            setGlobalStats(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTask = async (taskData) => {
        try {
            console.log('Creating task with data:', taskData);
            const taskPayload = {
                ...taskData,
                points: taskData.points || 10, // Default points
                type: taskData.type || 'simple',
                verification: {
                    type: taskData.verificationType || 'manual',
                    config: {
                        requiredProof: 'screenshot',
                        instructions: taskData.verificationInstructions || 'Please provide a screenshot as proof.'
                    }
                },
                rewards: [{
                    type: 'points',
                    amount: taskData.points || 10
                }],
                requirements: {
                    level: taskData.requiredLevel || 0,
                    roles: ['user'],
                    prerequisites: []
                },
                timeConstraints: {
                    startDate: taskData.timeConstraints?.startDate || new Date(),
                    endDate: taskData.timeConstraints?.endDate || null,
                    repeatInterval: taskData.timeConstraints?.repeatInterval || 'none'
                }
            };

            console.log('Sending task payload:', taskPayload);
            const response = await api.post(API_ENDPOINTS.GAMIFIED_TASKS.GET_ALL, taskPayload);
            
            const newTask = response.data?.data?.task;
            if (newTask) {
                setTasks(prevTasks => [...prevTasks, newTask]);
                setShowForm(false);
                toast.success('Task created successfully');
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create task';
            console.error('Error details:', errorMessage);
            toast.error(errorMessage);
        }
    };

    const handleUpdateTask = async (taskId, taskData) => {
        try {
            const response = await api.patch(`${API_ENDPOINTS.GAMIFIED_TASKS.GET_BY_ID}/${taskId}`, taskData);
            const updatedTask = response.data?.data?.task;
            if (updatedTask) {
                setTasks(prevTasks => prevTasks.map(task => task._id === taskId ? updatedTask : task));
                setShowForm(false);
                setSelectedTask(null);
                toast.success('Task updated successfully');
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error(error.response?.data?.message || 'Failed to update task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await api.delete(`${API_ENDPOINTS.GAMIFIED_TASKS.GET_BY_ID}/${taskId}`);
            setTasks(tasks.filter(task => task._id !== taskId));
            toast.success('Task deleted successfully');
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error(error.response?.data?.message || 'Failed to delete task');
        }
    };

    const handleVerify = async (taskId, userId, isApproved, rejectReason = '') => {
        try {
            const response = await api.post(`/api/v1/tasks/admin/verify/${taskId}/${userId}`, {
                success: isApproved,
                feedback: rejectReason
            });

            if (response.data.status === 'success') {
                // Remove the verified task from the verifications list
                setVerifications(prev => prev.filter(v => 
                    !(v.task._id === taskId && v.user._id === userId)
                ));
                
                toast.success(`Task ${isApproved ? 'approved' : 'rejected'} successfully`);
                
                // Refresh the data to get updated verifications and stats
                fetchData();
            }
        } catch (error) {
            console.error('Error verifying task:', error);
            toast.error(error.response?.data?.message || 'Failed to verify task');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '60vh' 
            }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ 
                borderRadius: 2,
                bgcolor: 'background.paper',
                overflow: 'hidden'
            }}>
                <Box sx={{ 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    bgcolor: 'background.default',
                    px: 2
                }}>
                    <Tabs 
                        value={value} 
                        onChange={(e, newValue) => setValue(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTab-root': {
                                minWidth: 120,
                                py: 2
                            }
                        }}
                    >
                        <Tab label="Tasks" />
                        <Tab label="Verifications" />
                        <Tab label="Analytics" />
                        <Tab label="Stats" />
                    </Tabs>
                </Box>

                <TabPanel value={value} index={0}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        mb: 3 
                    }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setSelectedTask(null);
                                setShowForm(true);
                            }}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                px: 3
                            }}
                        >
                            Create Task
                        </Button>
                    </Box>
                    <TaskList 
                        tasks={tasks} 
                        onEdit={(task) => {
                            // Format task data before setting it
                            const formattedTask = {
                                ...task,
                                category: task.category?.toLowerCase() || '',
                                verificationType: task.verification?.type || 'manual',
                                verificationInstructions: task.verification?.config?.instructions || '',
                                requiredLevel: task.requirements?.level || 0
                            };
                            setSelectedTask(formattedTask);
                            setShowForm(true);
                        }}
                        onDelete={handleDeleteTask}
                    />
                </TabPanel>

                <TabPanel value={value} index={1}>
                    <TaskVerification 
                        verifications={verifications}
                        onVerify={handleVerify}
                    />
                </TabPanel>

                <TabPanel value={value} index={2}>
                    <TaskAnalytics tasks={tasks} />
                </TabPanel>

                <TabPanel value={value} index={3}>
                    <TaskStats globalStats={globalStats} />
                </TabPanel>

                {showForm && (
                    <TaskForm
                        open={showForm}
                        onClose={() => {
                            setShowForm(false);
                            setSelectedTask(null);
                        }}
                        onSubmit={selectedTask ? 
                            (taskData) => handleUpdateTask(selectedTask._id, taskData) : 
                            handleCreateTask}
                        initialData={selectedTask}
                        isEdit={!!selectedTask}
                        categories={categories}
                    />
                )}
            </Paper>
        </Container>
    );
}

export default TaskManagement;
