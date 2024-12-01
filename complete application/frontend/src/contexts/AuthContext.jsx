import { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          const userData = await apiService.getUserProfile();
          setUser(userData.data.user || userData.data);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      // First, call the API service to authenticate
      const authResponse = await apiService.login(credentials);
      
      if (authResponse.token) {
        // If login is successful, fetch the user profile
        const userData = await apiService.getUserProfile();
        setUser(userData.data.user || userData.data);
        return authResponse; // Return the auth response which contains the token
      }
      throw new Error('Login failed: No token received');
    } catch (error) {
      console.error('Login error:', error);
      // Clean up any existing auth state
      localStorage.removeItem('token');
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear local state, even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
