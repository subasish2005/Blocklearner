import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaTrophy, FaLock, FaCheckCircle, FaClock } from 'react-icons/fa';
import { format } from 'date-fns';
import './styles/Tasks.css';

const TaskCard = ({ task, progress, onStart, onSubmit }) => {
    const isAvailable = !task.requirements.level || progress?.user?.level >= task.requirements.level;
    const isCompleted = progress?.status === 'completed';
    const isInProgress = progress?.status === 'in_progress';
    const isSubmitted = progress?.status === 'submitted';
    const hasTimeConstraint = task.timeConstraints?.endDate;

    console.log('TaskCard render:', {
        taskId: task._id,
        isCompleted,
        isInProgress,
        isSubmitted,
        progress
    });

    const getStatusClass = () => {
        if (isCompleted) return 'completed';
        if (isSubmitted) return 'submitted';
        if (isInProgress) return 'in-progress';
        if (!isAvailable) return 'locked';
        return 'available';
    };

    const getDifficultyClass = () => {
        return `difficulty-badge ${task.difficulty}`;
    };

    const renderRewards = () => (
        <div className="rewards-section">
            {task.points && (
                <span className="reward-item xp-reward">
                    <FaStar /> {task.points} XP
                </span>
            )}
            {task.rewards?.map((reward, index) => (
                <span key={index} className="reward-item achievement-reward">
                    <FaTrophy />
                    {reward.type === 'nft' && 'NFT'}
                    {reward.type === 'token' && `${reward.amount} Tokens`}
                    {reward.type === 'badge' && reward.name}
                    {reward.type === 'achievement' && reward.name}
                </span>
            ))}
        </div>
    );

    const renderProgress = () => {
        if (!progress) return null;
        
        const percentage = (progress.completedSteps / progress.totalSteps) * 100;
        
        return (
            <div className="progress-section">
                <div className="progress-header">
                    <span className="progress-text">
                        Progress: {progress.completedSteps}/{progress.totalSteps} Steps
                    </span>
                    <span className="progress-text">
                        {Math.round(percentage)}%
                    </span>
                </div>
                <div className="progress-bar">
                    <div 
                        className="progress-fill"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <motion.div 
            className={`task-card ${getStatusClass()}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="task-header">
                <div>
                    <h3 className="task-title">
                        {isCompleted && <FaCheckCircle className="task-icon" />}
                        {!isAvailable && <FaLock className="task-icon" />}
                        {task.title}
                    </h3>
                    <p className="task-description">{task.description}</p>
                </div>
                <span className={getDifficultyClass()}>
                    {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
                </span>
            </div>

            {renderRewards()}
            {renderProgress()}

            {hasTimeConstraint && (
                <div className="time-constraint">
                    <FaClock />
                    <span>Due: {format(new Date(task.timeConstraints.endDate), 'PPp')}</span>
                </div>
            )}

            <div className="task-actions">
                {!isAvailable ? (
                    <button className="task-button locked-button" disabled>
                        <FaLock /> Locked
                    </button>
                ) : isCompleted ? (
                    <button className="task-button" disabled>
                        <FaCheckCircle /> Completed
                    </button>
                ) : isSubmitted ? (
                    <button className="task-button" disabled>
                        <FaCheckCircle /> Submitted
                    </button>
                ) : isInProgress ? (
                    <button 
                        className="task-button submit-button"
                        onClick={() => {
                            console.log('Submit button clicked in TaskCard');
                            const submission = {
                                proof: 'Task completed',
                                proofType: 'text'
                            };
                            console.log('Submission data:', submission);
                            onSubmit(submission);
                        }}
                    >
                        Submit Task
                    </button>
                ) : (
                    <button 
                        className="task-button start-button"
                        onClick={() => onStart(task._id)}
                    >
                        Start Task
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default TaskCard;
