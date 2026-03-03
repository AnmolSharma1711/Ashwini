import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/Login';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import PatientView from './components/PatientView';
import { getPrioritizedPatients } from './api';
import { logout, getCurrentUser, isAuthenticated } from './services/authService';

function DoctorApp() {
  const [patients, setPatients] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [user, setUser] = useState(null);

  const getHealthBadge = (status) => {
    const badges = {
      critical: <span className="badge bg-danger">🔴 CRITICAL</span>,
      mild: <span className="badge bg-warning text-dark">🟡 NEEDS ATTENTION</span>,
      normal: <span className="badge bg-success">🟢 STABLE</span>,
      unknown: <span className="badge bg-secondary">⚪ UNKNOWN</span>
    };
    return badges[status] || badges.unknown;
  };

  const getCriticalCount = () => patients.filter(p => p.health_status === 'critical').length;
  const getMildCount = () => patients.filter(p => p.health_status === 'mild').length;

  useEffect(() => {
    fetchPatients();
    
    // Load current user
    if (isAuthenticated()) {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    }
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await getPrioritizedPatients();
      const relevantPatients = response.data.filter(
        p => ['waiting', 'checking', 'examined'].includes(p.status)
      );
      setPatients(relevantPatients);
      
      if (relevantPatients.length > 0) {
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredPatients.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const filteredPatients = statusFilter === 'all' 
    ? patients 
    : patients.filter(p => p.health_status === statusFilter);

  const currentPatient = filteredPatients[currentIndex];
  const hasNext = currentIndex < filteredPatients.length - 1;
  const hasPrevious = currentIndex > 0;

  return (
    <div className="container-fluid" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="row bg-primary text-white p-3">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h2 className="mb-0">🏥 Project Ashwini - Doctor's Portal</h2>
            <small>Patient Queue Management System</small>
          </div>
          {user && (
            <div className="text-end">
              <div className="mb-1">
                <strong>Dr. {user.first_name || user.username}</strong>
              </div>
              <button
                className="btn btn-outline-light btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="row bg-light border-bottom p-2">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <span className="me-4">
              <strong>Total Queue:</strong> {patients.length} patients
            </span>
            <span className="me-4">
              {getHealthBadge('critical')} {getCriticalCount()}
            </span>
            <span className="me-4">
              {getHealthBadge('mild')} {getMildCount()}
            </span>
          </div>
          <div>
            <select 
              className="form-select form-select-sm" 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentIndex(0);
              }}
              style={{ width: 'auto', display: 'inline-block' }}
            >
              <option value="all">All Patients</option>
              <option value="critical">Critical Only</option>
              <option value="mild">Needs Attention</option>
              <option value="normal">Stable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="row flex-grow-1" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div className="col-12 d-flex justify-content-center align-items-center" style={{ flex: 1 }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="col-12 d-flex justify-content-center align-items-center" style={{ flex: 1 }}>
            <div className="text-center">
              <h3>No patients in queue</h3>
              <p className="text-muted">All patients have been examined</p>
            </div>
          </div>
        ) : (
          <>
            {/* Navigation Controls */}
            <div className="col-12 p-3 bg-light border-bottom" style={{ flexShrink: 0 }}>
              <div className="d-flex justify-content-between align-items-center">
                <button
                  className="btn btn-outline-primary"
                  onClick={handlePrevious}
                  disabled={!hasPrevious}
                >
                  ← Previous Patient
                </button>
                <span className="badge bg-primary fs-6">
                  Patient {currentIndex + 1} of {filteredPatients.length}
                </span>
                <button
                  className="btn btn-outline-primary"
                  onClick={handleNext}
                  disabled={!hasNext}
                >
                  Next Patient →
                </button>
              </div>
            </div>
            
            {/* Patient Details */}
            <div className="col-12" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
              <PatientView 
                patientId={currentPatient.id}
                onUpdate={fetchPatients}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route 
          path="/*" 
          element={
            <RoleProtectedRoute>
              <DoctorApp />
            </RoleProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
