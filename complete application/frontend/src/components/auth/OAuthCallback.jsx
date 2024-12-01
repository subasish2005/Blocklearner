import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { apiService } from '../../services/api.service';

const OAuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();

    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                console.log('Processing OAuth callback');
                // Get the data from the URL fragment
                const fragment = location.hash.substring(1);
                const params = new URLSearchParams(fragment || location.search);
                const token = params.get('token');
                // eslint-disable-next-line no-unused-vars
                const userData = params.get('user');

                if (!token) {
                    const error = params.get('error');
                    console.error('OAuth error:', error);
                    toast.error(error || 'Authentication failed');
                    navigate('/login');
                    return;
                }

                console.log('Received token and initial user data');
                
                // Store the token
                localStorage.setItem('token', token);

                try {
                    // Fetch the complete user profile
                    const response = await apiService.getUserProfile();
                    const fullUserData = response.data.user || response.data;
                    console.log('Fetched full user profile');
                    
                    // Update auth context with complete user data
                    setUser(fullUserData);
                    
                    toast.success('Successfully logged in!');
                    navigate('/dashboard');
                } catch (profileError) {
                    console.error('Error fetching user profile:', profileError);
                    toast.error('Failed to fetch user profile');
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } catch (error) {
                console.error('OAuth callback error:', error);
                toast.error('Failed to complete authentication');
                localStorage.removeItem('token');
                navigate('/login');
            }
        };

        handleOAuthCallback();
    }, [navigate, location, setUser]);

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Completing Authentication...</h2>
                <p>Please wait while we complete your authentication.</p>
            </div>
        </div>
    );
};

export default OAuthCallback;
