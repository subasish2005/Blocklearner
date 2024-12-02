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
                const params = new URLSearchParams(fragment);
                
                // Parse token and user data
                const token = params.get('token');
                const userDataStr = params.get('user');
                const error = params.get('error');
                
                console.log('Token:', token);
                console.log('User data string:', userDataStr);

                if (error) {
                    console.error('OAuth error:', error);
                    toast.error(error || 'Authentication failed');
                    navigate('/login');
                    return;
                }

                if (!token || !userDataStr) {
                    console.error('Missing token or user data');
                    toast.error('Authentication failed');
                    navigate('/login');
                    return;
                }

                try {
                    // Parse the user data
                    const userData = JSON.parse(decodeURIComponent(userDataStr));
                    console.log('Parsed user data:', userData);

                    // Store the token
                    localStorage.setItem('token', token);
                    
                    // Set the user in context
                    setUser(userData);
                    
                    toast.success('Successfully logged in!');
                    navigate('/dashboard', { replace: true });
                } catch (parseError) {
                    console.error('Error parsing user data:', parseError);
                    toast.error('Failed to process user data');
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
