import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(formData);
      toast.success('Login successful!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/auth/${provider}`;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="auth-container">
      <div className="background-gradient gradient-1"></div>
      <div className="background-gradient gradient-2"></div>
      <div className="auth-box">
        <h2>Welcome Back</h2>
        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <div className="input-icon-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
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
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                tabIndex="-1"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="auth-links">
            <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="auth-separator">
            <span>Or sign in with</span>
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
            <span>Don t have an account? </span>
            <Link to="/register" className="register-link">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;