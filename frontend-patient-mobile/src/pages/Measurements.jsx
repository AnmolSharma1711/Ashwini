import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import MobileNavbar from '../components/MobileNavbar';

const Measurements = () => {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeasurements();
    
    // Auto-refresh measurements every 10 seconds
    const interval = setInterval(() => {
      fetchMeasurements();
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const fetchMeasurements = async () => {
    try {
      const response = await axiosInstance.get('/api/patient-portal/measurements/');
      setMeasurements(response.data);
    } catch (error) {
      console.error('Error fetching measurements:', error);
    } finally {
      if (loading) {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <div className="dashboard-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard-container">
      <MobileNavbar />
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
