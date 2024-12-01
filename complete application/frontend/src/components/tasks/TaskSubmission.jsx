import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUpload, FaLink, FaCode, FaQuestionCircle } from 'react-icons/fa';
import api from '../../config/api.config';
import { toast } from 'react-hot-toast';
import './styles/TaskSubmission.css';

const TaskSubmission = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [proofType, setProofType] = useState('');
    const [proof, setProof] = useState('');
    const [quizAnswers, setQuizAnswers] = useState([]);

    useEffect(() => {
        fetchTaskDetails();
    }, [taskId]);

    const fetchTaskDetails = async () => {
        try {
            console.log('Fetching task details for taskId:', taskId);
            const [taskRes, progressRes] = await Promise.all([
                api.get(`/api/v1/tasks/${taskId}`),
                api.get(`/api/v1/tasks/${taskId}/progress`)
            ]);
            console.log('Task response:', taskRes.data);
            console.log('Progress response:', progressRes.data);
            
            setTask(taskRes.data.data.task);
            setProgress(progressRes.data.data.progress);
            
            if (taskRes.data.data.task.type === 'quiz') {
                setQuizAnswers(new Array(taskRes.data.data.task.verification.config.questions.length).fill(''));
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching task details:', error);
            toast.error('Failed to fetch task details');
            navigate('/tasks');
        }
    };

    const handleSubmitProof = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (task.type === 'quiz') {
                await handleQuizSubmission();
            } else {
                await handleTaskProofSubmission();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit task');
        } finally {
            setSubmitting(false);
        }
    };

    const handleQuizSubmission = async () => {
        try {
            console.log('Submitting quiz answers:', quizAnswers);
            const response = await api.post(`/api/v1/tasks/quiz/${taskId}/submit`, {
                answers: quizAnswers
            });
            console.log('Quiz submission response:', response.data);

            const { passed, score } = response.data.data;
            
            if (passed) {
                toast.success(`Quiz completed successfully! Score: ${score}%`);
                navigate(`/tasks/${taskId}/results`);
            } else {
                toast.error(`Quiz failed. Score: ${score}%. Required: ${task.verification.config.passingScore}%`);
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            toast.error(error.response?.data?.message || 'Failed to submit quiz');
            throw error;
        }
    };

    const handleTaskProofSubmission = async () => {
        try {
            console.log('Submitting task proof:', { proof, proofType });
            const response = await api.post(`/api/v1/tasks/${taskId}/submit`, {
                proof,
                proofType
            });
            console.log('Submission response:', response.data);

            if (task.verification.type === 'automatic') {
                if (response.data.data.progress.status === 'completed') {
                    toast.success('Task completed successfully!');
                    navigate('/tasks');
                } else {
                    toast.error('Task verification failed. Please try again.');
                }
            } else {
                toast.success('Proof submitted successfully! Waiting for verification.');
                navigate('/tasks');
            }
        } catch (error) {
            console.error('Error submitting proof:', error);
            toast.error(error.response?.data?.message || 'Failed to submit proof');
            throw error;
        }
    };

    const renderQuizForm = () => (
        <div className="quiz-form">
            {task.verification.config.questions.map((question, index) => (
                <div key={index} className="quiz-question">
                    <h3>{question.text}</h3>
                    <div className="quiz-options">
                        {question.options.map((option, optionIndex) => (
                            <label key={optionIndex} className="quiz-option">
                                <input
                                    type="radio"
                                    name={`question-${index}`}
                                    value={option}
                                    checked={quizAnswers[index] === option}
                                    onChange={() => {
                                        const newAnswers = [...quizAnswers];
                                        newAnswers[index] = option;
                                        setQuizAnswers(newAnswers);
                                    }}
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderProofForm = () => (
        <div className="proof-form">
            <div>
                <label className="proof-type-label">
                    Proof Type
                </label>
                <div className="proof-type-buttons">
                    <button
                        type="button"
                        onClick={() => setProofType('link')}
                        className={`proof-type-button ${proofType === 'link' ? 'active' : ''}`}
                    >
                        <FaLink />
                        Link
                    </button>
                    <button
                        type="button"
                        onClick={() => setProofType('code')}
                        className={`proof-type-button ${proofType === 'code' ? 'active' : ''}`}
                    >
                        <FaCode />
                        Code
                    </button>
                    <button
                        type="button"
                        onClick={() => setProofType('file')}
                        className={`proof-type-button ${proofType === 'file' ? 'active' : ''}`}
                    >
                        <FaUpload />
                        File Upload
                    </button>
                </div>
            </div>

            {proofType && (
                <div className="proof-input-container">
                    <label className="proof-input-label">
                        Proof
                    </label>
                    {proofType === 'file' ? (
                        <div className="file-upload-container">
                            <div className="file-upload-content">
                                <FaUpload className="file-upload-icon" />
                                <div>
                                    <label className="file-upload-label">
                                        <span>Upload a file</span>
                                        <input
                                            type="file"
                                            className="file-upload-input"
                                            onChange={(e) => setProof(e.target.files[0])}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <textarea
                            value={proof}
                            onChange={(e) => setProof(e.target.value)}
                            className={`proof-textarea ${proofType}`}
                            rows={proofType === 'code' ? 10 : 4}
                            placeholder={
                                proofType === 'link' ? 'Paste your link here...' :
                                proofType === 'code' ? 'Paste your code here...' : ''
                            }
                        />
                    )}
                </div>
            )}
        </div>
    );

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="task-submission">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="task-header">
                    <h1>{task.title}</h1>
                    <p>{task.description}</p>
                </div>
                {task.type === 'quiz' ? (
                    <form onSubmit={handleSubmitProof} className="quiz-form-container">
                        {renderQuizForm()}
                        <div className="submit-button-container">
                            <button
                                type="submit"
                                disabled={submitting || quizAnswers.includes('')}
                                className="submit-button"
                            >
                                {submitting ? 'Submitting...' : 'Submit Quiz'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmitProof} className="proof-form-container">
                        {renderProofForm()}
                        <div className="submit-button-container">
                            <button
                                type="submit"
                                disabled={submitting || !proofType || !proof}
                                className="submit-button"
                            >
                                {submitting ? 'Submitting...' : 'Submit Proof'}
                            </button>
                        </div>
                    </form>
                )}
                {task.requirements?.submissionGuidelines && (
                    <div className="submission-guidelines">
                        <div className="guidelines-header">
                            <FaQuestionCircle />
                            <h4>Submission Guidelines</h4>
                        </div>
                        <div className="guidelines-content">
                            {task.requirements.submissionGuidelines}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default TaskSubmission;
