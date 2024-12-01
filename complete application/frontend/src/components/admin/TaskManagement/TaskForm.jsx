import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import './styles/TaskForm.css';

const TaskForm = ({ open, onClose, onSubmit, categories, initialData, isEdit }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'simple',
        category: '',
        difficulty: 'beginner',
        points: 10,
        verificationType: 'manual',
        verificationInstructions: '',
        requiredLevel: 0,
        timeConstraints: {
            startDate: new Date(),
            endDate: null,
            repeatInterval: 'none'
        }
    });

    useEffect(() => {
        if (initialData) {
            console.log('Initial data received in TaskForm:', initialData);
            console.log('Available categories:', categories);
            const formattedData = {
                title: initialData.title || '',
                description: initialData.description || '',
                type: initialData.type || 'simple',
                category: initialData.category || '',
                difficulty: initialData.difficulty || 'beginner',
                points: initialData.points || 10,
                verificationType: initialData.verification?.type || 'manual',
                verificationInstructions: initialData.verification?.config?.instructions || '',
                requiredLevel: initialData.requirements?.level || 0,
                timeConstraints: {
                    startDate: initialData.timeConstraints?.startDate || new Date(),
                    endDate: initialData.timeConstraints?.endDate || null,
                    repeatInterval: initialData.timeConstraints?.repeatInterval || 'none'
                }
            };
            console.log('Setting form data to:', formattedData);
            setFormData(formattedData);
        }
    }, [initialData, categories]);

    const handleChange = (field) => (event) => {
        if (field === 'category') {
            console.log('Category selected:', event.target.value);
        }
        setFormData(prev => {
            const newData = {
                ...prev,
                [field]: event.target.value
            };
            console.log(`Updated ${field}:`, newData);
            return newData;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitting form data:', formData);
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {isEdit ? 'Edit Task' : 'Create New Task'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Title"
                                value={formData.title}
                                onChange={handleChange('title')}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                rows={4}
                                value={formData.description}
                                onChange={handleChange('description')}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={formData.type}
                                    onChange={handleChange('type')}
                                    label="Type"
                                >
                                    <MenuItem value="simple">Simple</MenuItem>
                                    <MenuItem value="quiz">Quiz</MenuItem>
                                    <MenuItem value="submission">Submission</MenuItem>
                                    <MenuItem value="feedback">Feedback</MenuItem>
                                    <MenuItem value="milestone">Milestone</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={formData.category}
                                    onChange={handleChange('category')}
                                    label="Category"
                                >
                                    {console.log('Rendering categories:', categories, 'Current value:', formData.category)}
                                    {(categories || []).map((category) => (
                                        <MenuItem key={category} value={category}>
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Difficulty</InputLabel>
                                <Select
                                    value={formData.difficulty}
                                    onChange={handleChange('difficulty')}
                                    label="Difficulty"
                                >
                                    <MenuItem value="beginner">Beginner</MenuItem>
                                    <MenuItem value="intermediate">Intermediate</MenuItem>
                                    <MenuItem value="advanced">Advanced</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Points"
                                value={formData.points}
                                onChange={handleChange('points')}
                                required
                                inputProps={{ min: 0 }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Required Level"
                                value={formData.requiredLevel}
                                onChange={handleChange('requiredLevel')}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Verification Type</InputLabel>
                                <Select
                                    value={formData.verificationType}
                                    onChange={handleChange('verificationType')}
                                    label="Verification Type"
                                >
                                    <MenuItem value="manual">Manual</MenuItem>
                                    <MenuItem value="automatic">Automatic</MenuItem>
                                    <MenuItem value="quiz">Quiz</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Verification Instructions"
                                value={formData.verificationInstructions}
                                onChange={handleChange('verificationInstructions')}
                                helperText="Instructions for users on how to verify task completion"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary">
                        {isEdit ? 'Update Task' : 'Create Task'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

TaskForm.propTypes = {
    // Required props
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    categories: PropTypes.arrayOf(PropTypes.string).isRequired,
    isEdit: PropTypes.bool.isRequired,

    // Optional props
    initialData: PropTypes.shape({
        _id: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
        type: PropTypes.oneOf(['simple', 'quiz', 'submission', 'feedback', 'milestone']),
        category: PropTypes.string,
        difficulty: PropTypes.oneOf(['beginner', 'intermediate', 'advanced']),
        points: PropTypes.number,
        verification: PropTypes.shape({
            type: PropTypes.oneOf(['manual', 'automatic', 'quiz']),
            config: PropTypes.shape({
                instructions: PropTypes.string
            })
        }),
        requirements: PropTypes.shape({
            level: PropTypes.number
        }),
        timeConstraints: PropTypes.shape({
            startDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
            endDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string, PropTypes.oneOf([null])]),
            repeatInterval: PropTypes.oneOf(['none', 'daily', 'weekly', 'monthly'])
        })
    })
};

TaskForm.defaultProps = {
    initialData: null
};

export default TaskForm;
