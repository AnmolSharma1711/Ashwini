import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConsentModal from '../components/ConsentModal';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, needsConsent, giveConsent, logout } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show consent modal if user is authenticated but hasn't given portal consent
  if (needsConsent) {
    return (
      <ConsentModal
        onAccept={async () => {
          const result = await giveConsent();
          if (!result.success) {
            alert(result.error || 'Failed to record consent. Please try again.');
          }
        }}
        onDecline={() => {
          logout();
          window.location.href = '/login';
        }}
      />
    );
  }

  return children;
};

export default PrivateRoute;
