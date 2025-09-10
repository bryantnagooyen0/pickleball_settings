import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to decode JWT token
  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Check if token is expired
  const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  };

  // Initialize authentication state on app startup
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      const rememberMe = localStorage.getItem('rememberMe');
      
      if (token && !isTokenExpired(token)) {
        const decoded = decodeToken(token);
        if (decoded) {
          setUser({
            id: decoded.id,
            username: decoded.username,
            role: decoded.role
          });
          setIsAuthenticated(true);
        }
      } else if (token && isTokenExpired(token)) {
        // Token is expired, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('rememberMe');
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function
  const login = (token, username, rememberMe = false) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }
    
    const decoded = decodeToken(token);
    if (decoded) {
      setUser({
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      });
      setIsAuthenticated(true);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('rememberMe');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Get auth headers for API requests
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    hasRole,
    getAuthHeaders
  };
};
