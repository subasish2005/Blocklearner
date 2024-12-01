import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TaskCard from './TaskCard';
import { FaFilter, FaSort, FaSearch } from 'react-icons/fa';
import api from '../../config/api.config';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import './styles/Tasks.css';

const TaskList = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        difficulty: 'all',
        status: 'all',
        search: '',
        sortBy: 'newest'
    });

    useEffect(() => {
        fetchTasks();
        fetchProgress();
    }, []);

    const fetchTasks = async () => {
        try {
            console.log('Fetching tasks...');
            const response = await api.get('/api/v1/tasks');
            console.log('Tasks response:', response.data);
            const availableTasks = response.data.data.tasks.filter(task => 
                !task.requirements.level || task.requirements.level <= user.level
            );
            console.log('Available tasks:', availableTasks);
            setTasks(availableTasks);
        } catch (error) {
            toast.error('Failed to fetch tasks');
            console.error('Error fetching tasks:', error);
        }
    };

    const fetchProgress = async () => {
        try {
            console.log('Fetching progress...');
            const response = await api.get('/api/v1/tasks/progress');
            console.log('Progress response:', {
                status: response.data.status,
                results: response.data.results,
                progressData: response.data.data.progress
            });
            
            const progressMap = {};
            response.data.data.progress.forEach(p => {
                console.log('Processing progress item:', {
                    taskId: p.task._id,
                    status: p.status,
                    progress: p.progress,
                    points: p.points,
                    completedSteps: p.completedSteps,
                    totalSteps: p.totalSteps
                });
                
                progressMap[p.task._id] = {
                    status: p.status,
                    progress: p.progress,
                    points: p.points,
                    completedSteps: p.completedSteps,
                    totalSteps: p.totalSteps,
                    user: p.user
                };
            });
            console.log('Progress map:', progressMap);
            setProgress(progressMap);
        } catch (error) {
            console.error('Error fetching progress:', error);
            toast.error('Failed to fetch progress');
        } finally {
            setLoading(false);
        }
    };

    const handleStartTask = async (taskId) => {
        try {
            console.log('Starting task:', taskId);
            await api.post(`/api/v1/tasks/${taskId}/start`);
            toast.success('Task started successfully!');
            await fetchProgress();
        } catch (error) {
            console.error('Error starting task:', error);
            toast.error(error.response?.data?.message || 'Failed to start task');
        }
    };

    const handleSubmitTask = async (taskId, submission) => {
        try {
            console.log('Submitting task:', {
                taskId,
                submission,
                currentProgress: progress[taskId]
            });
            
            const proofData = {
                proof: submission.proof,
                proofType: submission.proofType
            };
            
            console.log('Making API call with data:', proofData);
            const response = await api.post(`/api/v1/tasks/${taskId}/submit`, proofData);
            console.log('Task submission response:', response.data);
            
            toast.success('Task submitted successfully!');
            await fetchProgress();
            
            console.log('Updated progress after submission:', progress[taskId]);
        } catch (error) {
            console.error('API call failed:', error.response?.data || error);
            toast.error(error.response?.data?.message || 'Failed to submit task');
        }
    };

    const filteredTasks = tasks
        .filter(task => {
            if (filters.difficulty !== 'all' && task.difficulty !== filters.difficulty) return false;
            if (filters.status !== 'all') {
                const taskProgress = progress[task._id];
                if (!taskProgress && filters.status !== 'available') return false;
                if (taskProgress && taskProgress.status !== filters.status) return false;
            }
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                return (
                    task.title.toLowerCase().includes(searchTerm) ||
                    task.description.toLowerCase().includes(searchTerm)
                );
            }
            return true;
        })
        .sort((a, b) => {
            switch (filters.sortBy) {
                case 'points':
                    return b.points - a.points;
                case 'difficulty':
                    return ['easy', 'medium', 'hard'].indexOf(a.difficulty) -
                           ['easy', 'medium', 'hard'].indexOf(b.difficulty);
                case 'deadline':
                    return (a.timeConstraints?.endDate || 0) - (b.timeConstraints?.endDate || 0);
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="task-list">
            <div className="filters">
                <div className="filter-group">
                    <FaFilter />
                    <select
                        className="filter-select"
                        value={filters.difficulty}
                        onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                    >
                        <option value="all">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>

                    <select
                        className="filter-select"
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                        <option value="all">All Status</option>
                        <option value="available">Available</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>

                    <select
                        className="filter-select"
                        value={filters.sortBy}
                        onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    >
                        <option value="newest">Newest First</option>
                        <option value="points">Highest Points</option>
                        <option value="difficulty">Difficulty</option>
                        <option value="deadline">Deadline</option>
                    </select>
                </div>

                <div className="filter-group">
                    <FaSearch />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search tasks..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                </div>
            </div>

            <div className="task-grid">
                {filteredTasks.map(task => (
                    <TaskCard
                        key={task._id}
                        task={task}
                        progress={progress[task._id]}
                        onStart={() => handleStartTask(task._id)}
                        onSubmit={(submission) => {
                            console.log('onSubmit called in TaskList with submission:', submission);
                            console.log('Task ID:', task._id);
                            handleSubmitTask(task._id, submission);
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default TaskList;
