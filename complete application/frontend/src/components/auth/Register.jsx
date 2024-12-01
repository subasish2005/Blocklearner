import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiService } from '../../services/api.service';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);

    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.confirmPassword
      };

      await apiService.register(registrationData);
      toast.success('Registration successful! Please check your email for verification instructions.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/${provider}`;
  };

  return (
    <div className="auth-container">
      <div className="background-gradient gradient-1"></div>
      <div className="background-gradient gradient-2"></div>
      <div className="auth-box">
        <h2>Create Account</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <div className="input-icon-wrapper">
              <FiUser className="input-icon" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
                className="auth-input"
                autoComplete="name"
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-icon-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="auth-input"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-icon-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                className="auth-input"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <div className="input-icon-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                className="auth-input"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="auth-separator">
            <span>Or sign up with</span>
          </div>

          <div className="oauth-buttons">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="oauth-button google"
              disabled={loading}
            >
              <FaGoogle className="oauth-icon" />
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              className="oauth-button github"
              disabled={loading}
            >
              <FaGithub className="oauth-icon" />
              <span>GitHub</span>
            </button>
          </div>

          <div className="auth-links">
            <span>Already have an account? </span>
            <Link to="/login" className="register-link">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;