import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/Login';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import RegistrationDashboard from './components/RegistrationDashboard';
import HealthMonitoringStation from './components/HealthMonitoringStation';
import ReportAnalysis from './components/ReportAnalysis';
import { logout, getCurrentUser, isAuthenticated } from './services/authService';

function MainApp() {
  const [activeView, setActiveView] = useState('registration');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load current user
    if (isAuthenticated()) {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand">🏥 Project Ashwini - Registration Portal</span>
          <div className="navbar-nav me-auto">
            <button
              className={`nav-link btn btn-link ${activeView === 'registration' ? 'active' : ''}`}
              onClick={() => setActiveView('registration')}
            >
              Registration Dashboard
            </button>
            <button
              className={`nav-link btn btn-link ${activeView === 'monitoring' ? 'active' : ''}`}
              onClick={() => setActiveView('monitoring')}
            >
              Health Monitoring Station
            </button>
            <button
              className={`nav-link btn btn-link ${activeView === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveView('reports')}
            >
              Report Analysis
            </button>
          </div>
          {user && (
            <div className="d-flex align-items-center">
              <span className="text-white me-3">
                👤 {user.first_name || user.username} ({user.role})
              </span>
              <button
                className="btn btn-outline-light btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="container-fluid mt-3">
        {activeView === 'registration' && <RegistrationDashboard />}
        {activeView === 'monitoring' && <HealthMonitoringStation />}
        {activeView === 'reports' && <ReportAnalysis />}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route 
          path="/*" 
          element={
            <RoleProtectedRoute>
              <MainApp />
            </RoleProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
