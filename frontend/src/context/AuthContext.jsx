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
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.response?.data?.non_field_errors?.[0] ||
        'Authentication failed. Please verify your credentials.';
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
      if (err.response?.data) {
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
