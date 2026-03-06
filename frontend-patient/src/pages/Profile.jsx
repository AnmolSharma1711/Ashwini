import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    fetchProfile();
    
    // Auto-refresh profile every 10 seconds
    const interval = setInterval(() => {
      fetchProfile();
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get('/api/patient-portal/profile/');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
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
          <Link to="/profile" className="nav-link active">Profile</Link>
          <Link to="/measurements" className="nav-link">Vitals</Link>
          <Link to="/prescription" className="nav-link">Prescription</Link>
          <Link to="/visits" className="nav-link">Visits</Link>
          <Link to="/health-progress" className="nav-link">Health Progress</Link>
          <button onClick={logout} className="btn btn-outline">Logout</button>
        </div>
      </nav>

      <div className="content">
        <h1>My Profile</h1>

        <div className="card">
          <h2>Personal Information</h2>
          <div className="profile-grid">
            <div className="profile-item">
              <span className="profile-label">Patient ID:</span>
              <span className="profile-value"><strong style={{ color: '#007bff', fontSize: '1.1em' }}>{profile?.patient_id}</strong></span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Name:</span>
              <span className="profile-value">{profile?.name}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Age:</span>
              <span className="profile-value">{profile?.age} years</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Gender:</span>
              <span className="profile-value">{profile?.gender}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Phone:</span>
              <span className="profile-value">{profile?.phone || 'Not provided'}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Address:</span>
              <span className="profile-value">{profile?.address || 'Not provided'}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Health Information</h2>
          <div className="profile-grid">
            <div className="profile-item" style={{ width: '100%' }}>
              <span className="profile-label">Health Status:</span>
              <div style={{
                width: '100%',
                background: '#e0e0e0',
                borderRadius: '20px',
                height: '32px',
                margin: '0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
              }}>
                <div style={{
                  background: getHealthStatusColor(profile?.health_status),
                  color: 'white',
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  paddingLeft: '1rem',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  textTransform: 'capitalize',
                  transition: 'background 0.3s',
                }}>
                  {profile?.health_status || 'N/A'}
                </div>
              </div>
            </div>
            <div className="profile-item">
              <span className="profile-label">Current Status:</span>
              <span className="profile-value badge">{profile?.status}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Next Appointment:</span>
              <span className="profile-value">{profile?.next_visit_date || 'Not scheduled'}</span>
            </div>
          </div>
        </div>

        {profile?.latest_measurement && (
          <div className="card">
            <h2>Latest Vitals</h2>
            <div className="vitals-grid">
              <div className="vital-item">
                <span className="vital-label">Blood Pressure</span>
                <span className="vital-value">{profile.latest_measurement.blood_pressure || 'N/A'}</span>
              </div>
              <div className="vital-item">
                <span className="vital-label">Heart Rate</span>
                <span className="vital-value">{profile.latest_measurement.heart_rate || 'N/A'} bpm</span>
              </div>
              <div className="vital-item">
                <span className="vital-label">Temperature</span>
                <span className="vital-value">{profile.latest_measurement.temperature || 'N/A'} °F</span>
              </div>
              <div className="vital-item">
                <span className="vital-label">SpO2</span>
                <span className="vital-value">{profile.latest_measurement.spo2 || 'N/A'}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

// Add this helper function at the top, after imports:
function getHealthStatusColor(status) {
  const statusColors = {
    'normal': '#10b981', // green
    'mild': '#f59e0b',   // yellow/orange
    'critical': '#ef4444', // red
    'unknown': '#6b7280' // gray
  };
  return statusColors[status?.toLowerCase()] || '#6b7280';
}
