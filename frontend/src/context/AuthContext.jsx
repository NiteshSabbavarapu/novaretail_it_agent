import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => authService.getAccessToken());
  const [username, setUsername] = useState(() => authService.getUsername());
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const currentToken = authService.getAccessToken();
    const currentUsername = authService.getUsername();
    setToken(currentToken);
    setUsername(currentUsername);
    setIsAuthenticated(Boolean(currentToken));
    setIsInitializing(false);
  }, []);

  const login = async (user, pass) => {
    try {
      const data = await authService.login(user, pass);
      setToken(data.access);
      setUsername(user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      let errMsg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.response?.data?.non_field_errors?.[0];

      if (!errMsg) {
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          errMsg = 'Network error. Could not connect to the backend server. Please check CORS settings and server status.';
        } else if (err.response?.status === 500) {
          errMsg = 'Internal server error (500). Please check Django backend logs.';
        } else if (err.response?.status === 400 && typeof err.response?.data === 'string' && err.response?.data.includes('DisallowedHost')) {
          errMsg = 'Backend Error: DisallowedHost (400). Please add your host to ALLOWED_HOSTS in Django settings.';
        } else {
          errMsg = 'Authentication failed. Please verify your credentials.';
        }
      }

      return { success: false, error: errMsg };
    }
  };

  const register = async (user, email, pass) => {
    try {
      await authService.register(user, email, pass);
      // Automatically log in following successful registration
      return await login(user, pass);
    } catch (err) {
      let errMsg = 'Registration failed.';
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errMsg = 'Network error. Could not connect to the backend server. Please check CORS settings and server status.';
      } else if (err.response?.status === 500) {
        errMsg = 'Internal server error (500). Please check Django backend logs.';
      } else if (err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === 'object') {
          const firstKey = Object.keys(errors)[0];
          const val = errors[firstKey];
          errMsg = `${firstKey}: ${Array.isArray(val) ? val.join(' ') : val}`;
        } else {
          errMsg = String(errors);
        }
      }
      return { success: false, error: errMsg };
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUsername(null);
    setIsAuthenticated(false);
  };

  const value = {
    token,
    username,
    isAuthenticated,
    isInitializing,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
