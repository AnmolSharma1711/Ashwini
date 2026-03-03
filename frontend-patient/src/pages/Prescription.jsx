import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const Prescription = () => {
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    fetchPrescription();
  }, []);

  const fetchPrescription = async () => {
    try {
      const response = await axiosInstance.get('/api/patient-portal/prescription/');
      setPrescription(response.data);
    } catch (error) {
      console.error('Error fetching prescription:', error);
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
          <Link to="/measurements" className="nav-link">Vitals</Link>
          <Link to="/prescription" className="nav-link active">Prescription</Link>
          <Link to="/visits" className="nav-link">Visits</Link>
          <button onClick={logout} className="btn btn-outline">Logout</button>
        </div>
      </nav>

      <div className="content">
        <h1>My Prescription</h1>
        <p className="subtitle">Current medications and treatment plan</p>

        {prescription && prescription.medicines && prescription.medicines.length > 0 ? (
          <div className="prescription-grid">
            {prescription.medicines.map((medicine, index) => (
              <div key={index} className="card prescription-card">
                <div className="prescription-header">
                  <h3>{medicine.name}</h3>
                  <span className="badge badge-primary">{medicine.type}</span>
                </div>
                <div className="prescription-details">
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
        ) : (
          <div className="card">
            <p className="text-muted">No active prescriptions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescription;
