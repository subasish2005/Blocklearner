import { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    TextField,
    MenuItem,
    TablePagination,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
   
} from '@mui/icons-material';
import './styles/TaskList.css';

const TaskList = ({ 
    tasks = [], 
    categories = [], 
    onEdit = () => {}, 
    onDelete = () => {} 
}) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filter, setFilter] = useState({
        category: 'all',
        difficulty: 'all',
        search: ''
    });

    const handleFilterChange = (field) => (event) => {
        setFilter({ ...filter, [field]: event.target.value });
        setPage(0);
    };

    // Ensure tasks is an array before filtering
    const filteredTasks = Array.isArray(tasks) ? tasks.filter(task => {
        return (
            (filter.category === 'all' || task.category === filter.category) &&
            (filter.difficulty === 'all' || task.difficulty === filter.difficulty) &&
            (filter.search === '' || 
                task.title.toLowerCase().includes(filter.search.toLowerCase()) ||
                task.description.toLowerCase().includes(filter.search.toLowerCase()))
        );
    }) : [];

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner':
                return 'success';
            case 'intermediate':
                return 'warning';
            case 'advanced':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString();
    };

    return (
        <Box>
            {/* Filters */}
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                        value={filter.category}
                        onChange={handleFilterChange('category')}
                        label="Category"
                    >
                        <MenuItem value="all">All Categories</MenuItem>
                        {categories.map(category => (
                            <MenuItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                        value={filter.difficulty}
                        onChange={handleFilterChange('difficulty')}
                        label="Difficulty"
                    >
                        <MenuItem value="all">All Levels</MenuItem>
                        <MenuItem value="beginner">Beginner</MenuItem>
                        <MenuItem value="intermediate">Intermediate</MenuItem>
                        <MenuItem value="advanced">Advanced</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    label="Search"
                    variant="outlined"
                    value={filter.search}
                    onChange={handleFilterChange('search')}
                    sx={{ flexGrow: 1 }}
                />
            </Box>

            {/* Task Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Difficulty</TableCell>
                            <TableCell>Points</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rowsPerPage > 0
                            ? filteredTasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : filteredTasks
                        ).map((task) => (
                            <TableRow key={task._id}>
                                <TableCell>{task.title}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                                        color="primary" 
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>{task.type}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={task.difficulty}
                                        color={getDifficultyColor(task.difficulty)}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>{task.points}</TableCell>
                                <TableCell>{formatDate(task.createdAt)}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => onEdit(task)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => onDelete(task._id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredTasks.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Box>
    );
};

TaskList.propTypes = {
    tasks: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            category: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
            difficulty: PropTypes.oneOf(['beginner', 'intermediate', 'advanced']).isRequired,
            points: PropTypes.number.isRequired,
            createdAt: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.instanceOf(Date)
            ]).isRequired,
            description: PropTypes.string.isRequired
        })
    ),
    categories: PropTypes.arrayOf(PropTypes.string),
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default TaskList;
