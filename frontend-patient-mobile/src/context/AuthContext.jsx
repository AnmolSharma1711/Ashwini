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
  const [consentStatus, setConsentStatus] = useState(null);
  const [needsConsent, setNeedsConsent] = useState(false);

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
      
      // Check consent status
      await checkConsentStatus();
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const checkConsentStatus = async () => {
    try {
      const response = await axiosInstance.get('/api/patient-portal/consent-status/');
      const consent = response.data;
      setConsentStatus(consent);
      
      // If portal consent not given, show consent modal
      if (!consent.portal_consent_given) {
        setNeedsConsent(true);
      } else {
        setNeedsConsent(false);
      }
    } catch (error) {
      console.error('Error fetching consent status:', error);
    }
  };

  const giveConsent = async () => {
    try {
      await axiosInstance.post('/api/patient-portal/give-consent/', {
        portal_consent_given: true
      });
      
      // Refresh consent status
      await checkConsentStatus();
      setNeedsConsent(false);
      
      return { success: true };
    } catch (error) {
      console.error('Error giving consent:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to record consent' };
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
      
      // Check consent status after login
      await checkConsentStatus();
      
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
    setConsentStatus(null);
    setNeedsConsent(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    needsConsent,
    consentStatus,
    login,
    logout,
    checkAuth,
    giveConsent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
