import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const Prescription = () => {
  const [prescriptionHistory, setPrescriptionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    fetchPrescriptionHistory();
    
    // Auto-refresh prescription history every 10 seconds
    const interval = setInterval(() => {
      fetchPrescriptionHistory();
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const fetchPrescriptionHistory = async () => {
    try {
      const response = await axiosInstance.get('/api/patient-portal/prescription-history/');
      setPrescriptionHistory(response.data);
    } catch (error) {
      console.error('Error fetching prescription history:', error);
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
      <nav className="navbar">
        <div className="nav-brand">
          <h1>🏥 Ashwini Patient Portal</h1>
        </div>
        <div className="nav-menu">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
          <Link to="/measurements" className="nav-link">Vitals</Link>
          <Link to="/prescription" className="nav-link active">Prescription</Link>
          <Link to="/visits" className="nav-link">Visits</Link>
          <Link to="/health-progress" className="nav-link">Health Progress</Link>
          <button onClick={logout} className="btn btn-outline">Logout</button>
        </div>
      </nav>

      <div className="content">
        <h1>My Prescriptions</h1>
        <p className="subtitle">Complete history of your prescribed medications</p>

        {prescriptionHistory && prescriptionHistory.length > 0 ? (
          <div className="measurements-list">
            {prescriptionHistory.map((prescription, index) => (
              <div key={index} className="card measurement-card">
                <div className="measurement-header">
                  <span className="measurement-date">
                    {new Date(prescription.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}, {new Date(prescription.created_at).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  <span className="badge badge-info">
                    {prescription.visit_date ? 
                      `Visit: ${new Date(prescription.visit_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` 
                      : 'Prescription'}
                  </span>
                </div>
                
                <div className="prescription-medicines-grid">
                  {prescription.medicines && prescription.medicines.map((medicine, medIndex) => (
                    <div key={medIndex} className="medicine-item">
                      <div className="medicine-header">
                        <h4 className="medicine-name">💊 {medicine.name}</h4>
                        <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                          {medicine.type}
                        </span>
                      </div>
                      <div className="medicine-details">
                        <div className="detail-row">
                          <span className="detail-label">Dosage:</span>
                          <span className="detail-value">{medicine.dose}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Quantity:</span>
                          <span className="detail-value">{medicine.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">💊</div>
              <p>No prescription history available</p>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Your prescription records will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescription;
