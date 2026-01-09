import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import PatientView from './components/PatientView';
import { getPatients } from './api';

function App() {
  const [patients, setPatients] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await getPatients();
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

  const currentPatient = patients[currentIndex];

  return (
    <div className="App">
      <nav className="navbar navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            Project Ashwini - Doctor's Dashboard
          </span>
          <span className="text-white">
            Patient {currentIndex + 1} of {patients.length}
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
            {/* Navigation Controls */}
            <div className="d-flex justify-content-between mb-3">
              <button
                className="btn btn-outline-primary"
                onClick={handlePrevious}
                disabled={patients.length <= 1}
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
                disabled={patients.length <= 1}
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
