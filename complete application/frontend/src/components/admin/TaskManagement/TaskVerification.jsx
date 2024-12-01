import { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Avatar,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import {
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import './styles/TaskVerification.css';

const TaskVerification = ({ 
    verifications = [], 
    onVerify = () => {} 
}) => {
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    const handleApprove = (taskId, userId) => {
        onVerify(taskId, userId, true);
    };

    const handleReject = () => {
        if (selectedSubmission) {
            onVerify(selectedSubmission.task._id, selectedSubmission.user._id, false, rejectReason);
            handleCloseRejectDialog();
        }
    };

    const handleOpenRejectDialog = (submission) => {
        setSelectedSubmission(submission);
        setShowRejectDialog(true);
    };

    const handleCloseRejectDialog = () => {
        setSelectedSubmission(null);
        setRejectReason('');
        setShowRejectDialog(false);
    };

    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [previewContent, setPreviewContent] = useState(null);

    const handlePreviewSubmission = (submission) => {
        setPreviewContent(submission);
        setPreviewDialogOpen(true);
    };

    const renderSubmissionContent = (submission) => {
        switch (submission.task.verification.type) {
            case 'manual':
                return (
                    <Box>
                        {submission.proof.type === 'screenshot' && (
                            <img 
                                src={submission.proof.content} 
                                alt="Submission proof" 
                                style={{ maxWidth: '100%', maxHeight: '300px' }}
                            />
                        )}
                        {submission.proof.type === 'link' && (
                            <a href={submission.proof.content} target="_blank" rel="noopener noreferrer">
                                View Submission Link
                            </a>
                        )}
                        {submission.proof.type === 'text' && (
                            <Typography variant="body1">
                                {submission.proof.content}
                            </Typography>
                        )}
                    </Box>
                );
            case 'quiz':
                return (
                    <Box>
                        <Typography variant="subtitle1">Quiz Results</Typography>
                        <Typography>
                            Score: {submission.score}/{submission.totalQuestions}
                        </Typography>
                        {submission.answers.map((answer, index) => (
                            <Box key={index} mb={1}>
                                <Typography variant="body2">
                                    Q{index + 1}: {answer.question}
                                </Typography>
                                <Typography color={answer.correct ? 'success.main' : 'error.main'}>
                                    Answer: {answer.answer}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                );
            default:
                return (
                    <Typography>
                        No preview available for this submission type.
                    </Typography>
                );
        }
    };

    return (
        <Box className="task-verification-container">
            <Typography variant="h5" gutterBottom>
                Pending Verifications ({verifications.length})
            </Typography>

            <Grid container spacing={2}>
                {verifications.map((verification) => (
                    <Grid item xs={12} md={6} key={verification._id}>
                        <Card className="verification-card">
                            <CardContent>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Avatar
                                        src={verification.user.avatar}
                                        alt={verification.user.username}
                                    />
                                    <Box ml={2}>
                                        <Typography variant="subtitle1">
                                            {verification.user.username}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Level {verification.user.level}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Typography variant="h6" gutterBottom>
                                    {verification.task.title}
                                </Typography>

                                <Box mb={2}>
                                    <Chip
                                        label={verification.task.category}
                                        size="small"
                                        className="category-chip"
                                    />
                                    <Chip
                                        label={`${verification.task.points} Points`}
                                        size="small"
                                        color="primary"
                                        className="points-chip"
                                    />
                                </Box>

                                <Typography variant="body2" color="textSecondary" paragraph>
                                    Submitted: {new Date(verification.submittedAt).toLocaleString()}
                                </Typography>

                                <Box className="verification-actions">
                                    <Button
                                        startIcon={<ViewIcon />}
                                        onClick={() => handlePreviewSubmission(verification)}
                                        variant="outlined"
                                    >
                                        Preview
                                    </Button>
                                    <Button
                                        startIcon={<ApproveIcon />}
                                        onClick={() => handleApprove(verification.task._id, verification.user._id)}
                                        color="success"
                                        variant="contained"
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        startIcon={<RejectIcon />}
                                        onClick={() => handleOpenRejectDialog(verification)}
                                        color="error"
                                        variant="contained"
                                    >
                                        Reject
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Preview Dialog */}
            <Dialog
                open={previewDialogOpen}
                onClose={() => setPreviewDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Submission Preview</DialogTitle>
                <DialogContent>
                    {previewContent && renderSubmissionContent(previewContent)}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog
                open={showRejectDialog}
                onClose={handleCloseRejectDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Reject Submission</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Reason for rejection"
                        fullWidth
                        multiline
                        rows={4}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRejectDialog}>Cancel</Button>
                    <Button onClick={handleReject} color="error" variant="contained">
                        Reject
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

TaskVerification.propTypes = {
    verifications: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            user: PropTypes.shape({
                _id: PropTypes.string.isRequired,
                username: PropTypes.string.isRequired,
                avatar: PropTypes.string,
                level: PropTypes.number.isRequired
            }).isRequired,
            task: PropTypes.shape({
                _id: PropTypes.string.isRequired,
                title: PropTypes.string.isRequired,
                category: PropTypes.string.isRequired,
                points: PropTypes.number.isRequired,
                verification: PropTypes.shape({
                    type: PropTypes.oneOf(['manual', 'quiz']).isRequired
                }).isRequired
            }).isRequired,
            proof: PropTypes.shape({
                type: PropTypes.oneOf(['screenshot', 'link', 'text']).isRequired,
                content: PropTypes.string.isRequired
            }),
            score: PropTypes.number,
            totalQuestions: PropTypes.number,
            answers: PropTypes.arrayOf(
                PropTypes.shape({
                    question: PropTypes.string.isRequired,
                    answer: PropTypes.string.isRequired,
                    correct: PropTypes.bool.isRequired
                })
            ),
            submittedAt: PropTypes.string.isRequired
        })
    ).isRequired,
    onVerify: PropTypes.func.isRequired
};

export default TaskVerification;
