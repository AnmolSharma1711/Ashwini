import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const Visits = () => {
  const [visits, setVisits] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const response = await axiosInstance.get('/api/patient-portal/visits/');
      setVisits(response.data);
    } catch (error) {
      console.error('Error fetching visits:', error);
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
          <Link to="/prescription" className="nav-link">Prescription</Link>
          <Link to="/visits" className="nav-link active">Visits</Link>
          <button onClick={logout} className="btn btn-outline">Logout</button>
        </div>
      </nav>

      <div className="content">
        <h1>My Visits</h1>
        <p className="subtitle">Medical visit history and appointments </p>

        {visits?.current_visit ? (
          <div className="card">
            <h2>Current Visit Information</h2>
            <div className="visit-details">
              <div className="detail-row">
                <span className="detail-label">Visit Time:</span>
                <span className="detail-value">{new Date(visits.current_visit.visit_time).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Reason:</span>
                <span className="detail-value">{visits.current_visit.reason || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="badge">{visits.current_visit.status}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Health Status:</span>
                <span className="badge badge-success">{visits.current_visit.health_status || 'N/A'}</span>
              </div>
              {visits.current_visit.next_visit_date && (
                <div className="detail-row">
                  <span className="detail-label">Next Appointment:</span>
                  <span className="detail-value">{visits.current_visit.next_visit_date}</span>
                </div>
              )}
              {visits.current_visit.notes && (
                <div className="detail-row">
                  <span className="detail-label">Doctor's Notes:</span>
                  <span className="detail-value">{visits.current_visit.notes}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card">
            <p className="text-muted">No visit information available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Visits;
