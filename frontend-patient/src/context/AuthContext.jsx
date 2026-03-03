import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get('/api/auth/me/');
      const userData = response.data;

      // Verify user is a PATIENT
      if (userData.role !== 'PATIENT') {
        logout();
        return;
      }

      setUser(userData);
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/login/', {
        username,
        password,
      });

      const { access, refresh } = response.data;

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);

      const userResponse = await axiosInstance.get('/api/auth/me/');
      const userData = userResponse.data;

      if (userData.role !== 'PATIENT') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return { success: false, error: 'Access denied. This portal is for patients only.' };
      }

      setUser(userData);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
