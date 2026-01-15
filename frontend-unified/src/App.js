import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import PatientView from './components/PatientView';
import { getPrioritizedPatients } from './api';

function App() {
  const [patients, setPatients] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

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
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await getPrioritizedPatients();
      // Filter to show only patients that need doctor attention
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

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : patients.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < patients.length - 1 ? prev + 1 : 0));
  };

  const filteredPatients = statusFilter === 'all' 
    ? patients 
    : patients.filter(p => p.health_status === statusFilter);
  
  const currentPatient = filteredPatients[currentIndex];

  return (
    <div className="App">
      <nav className="navbar navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            Project Ashwini - Doctor's Dashboard
          </span>
          <span className="text-white">
            Patient {currentIndex + 1} of {filteredPatients.length}
            {getCriticalCount() > 0 && (
              <span className="ms-3 badge bg-danger">
                ⚠️ {getCriticalCount()} Critical
              </span>
            )}
            {getMildCount() > 0 && (
              <span className="ms-2 badge bg-warning text-dark">
                {getMildCount()} Need Attention
              </span>
            )}
          </span>
        </div>
      </nav>

      <div className="container-fluid mt-3">
        {loading ? (
          <div className="text-center mt-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : patients.length === 0 ? (
          <div className="alert alert-info text-center mt-5">
            <h4>No patients to review</h4>
            <p>All patients have been completed or there are no active patients.</p>
          </div>
        ) : (
          <>
            {/* Health Status Filter */}
            <div className="btn-group mb-3 d-flex" role="group">
              <button
                className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => { setStatusFilter('all'); setCurrentIndex(0); }}
              >
                All ({patients.length})
              </button>
              <button
                className={`btn ${statusFilter === 'critical' ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={() => { setStatusFilter('critical'); setCurrentIndex(0); }}
              >
                Critical ({getCriticalCount()})
              </button>
              <button
                className={`btn ${statusFilter === 'mild' ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={() => { setStatusFilter('mild'); setCurrentIndex(0); }}
              >
                Needs Attention ({getMildCount()})
              </button>
              <button
                className={`btn ${statusFilter === 'normal' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => { setStatusFilter('normal'); setCurrentIndex(0); }}
              >
                Stable ({patients.filter(p => p.health_status === 'normal').length})
              </button>
            </div>
            {/* Navigation Controls */}
            {/* Current Patient Health Badge */}
            {currentPatient && (
              <div className="alert alert-light border mb-3 d-flex justify-content-between align-items-center">
                <div>
                  <strong>{currentPatient.name}</strong> ({currentPatient.age}y, {currentPatient.gender})
                </div>
                {getHealthBadge(currentPatient.health_status)}
              </div>
            )}

            <div className="d-flex justify-content-between mb-3">
              <button
                className="btn btn-outline-primary"
                onClick={handlePrevious}
                disabled={filteredPatients.length <= 1}
              >
                ← Previous Patient
              </button>
              <button
                className="btn btn-primary"
                onClick={fetchPatients}
              >
                🔄 Refresh
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={handleNext}
                disabled={filteredPatients.length <= 1}
              >
                Next Patient →
              </button>
            </div>

            {/* Patient View Component */}
            {currentPatient && (
              <PatientView
                patientId={currentPatient.id}
                onUpdate={fetchPatients}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
