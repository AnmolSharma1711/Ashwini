import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const Measurements = () => {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const fetchMeasurements = async () => {
    try {
      const response = await axiosInstance.get('/api/patient-portal/measurements/');
      setMeasurements(response.data);
    } catch (error) {
      console.error('Error fetching measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>🏥 Ashwini Patient Portal</h1>
        </div>
        <div className="nav-menu">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
          <Link to="/measurements" className="nav-link active">Vitals</Link>
          <Link to="/prescription" className="nav-link">Prescription</Link>
          <Link to="/visits" className="nav-link">Visits</Link>
          <button onClick={logout} className="btn btn-outline">Logout</button>
        </div>
      </nav>

      <div className="content">
        <h1>My Vital Signs</h1>
        <p className="subtitle">Complete history of your health measurements</p>

        {measurements.length > 0 ? (
          <div className="measurements-list">
            {measurements.map((measurement) => (
              <div key={measurement.id} className="card measurement-card">
                <div className="measurement-header">
                  <h3>{new Date(measurement.timestamp).toLocaleString()}</h3>
                  <span className="badge">{measurement.source || 'manual'}</span>
                </div>
                <div className="vitals-grid">
                  <div className="vital-item">
                    <span className="vital-label">Blood Pressure</span>
                    <span className="vital-value">{measurement.blood_pressure || 'N/A'}</span>
                  </div>
                  <div className="vital-item">
                    <span className="vital-label">Heart Rate</span>
                    <span className="vital-value">{measurement.heart_rate || 'N/A'} bpm</span>
                  </div>
                  <div className="vital-item">
                    <span className="vital-label">Temperature</span>
                    <span className="vital-value">{measurement.temperature || 'N/A'} °F</span>
                  </div>
                  <div className="vital-item">
                    <span className="vital-label">SpO2</span>
                    <span className="vital-value">{measurement.spo2 || 'N/A'}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <p className="text-muted">No measurements recorded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Measurements;
