import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [visits, setVisits] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh data every 10 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, measurementsRes, visitsRes, prescriptionRes] = await Promise.all([
        axiosInstance.get('/api/patient-portal/profile/'),
        axiosInstance.get('/api/patient-portal/measurements/'),
        axiosInstance.get('/api/patient-portal/visits/'),
        axiosInstance.get('/api/patient-portal/prescription/').catch(() => null),
      ]);

      setProfile(profileRes.data);
      setMeasurements(measurementsRes.data.slice(0, 1)); // Latest measurement
      setVisits(visitsRes.data);
      setPrescription(prescriptionRes?.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      if (loading) {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const latestMeasurement = measurements[0];

  const getHealthStatusColor = (status) => {
    const statusColors = {
      'normal': '#10b981', // green
      'mild': '#f59e0b',   // yellow/orange
      'critical': '#ef4444', // red
      'unknown': '#6b7280' // gray
    };
    return statusColors[status?.toLowerCase()] || '#6b7280';
  };

  const getHealthStatusIcon = (status) => {
    const icons = {
      'normal': '✓',
      'mild': '⚠',
      'critical': '⚠',
      'unknown': '?'
    };
    return icons[status?.toLowerCase()] || '?';
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>🏥 Ashwini Patient Portal</h1>
        </div>
        <div className="nav-menu">
          <Link to="/dashboard" className="nav-link active">Dashboard</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
          <Link to="/measurements" className="nav-link">Vitals</Link>
          <Link to="/prescription" className="nav-link">Prescription</Link>
          <Link to="/visits" className="nav-link">Visits</Link>
          <Link to="/health-progress" className="nav-link">Health Progress</Link>
          <button onClick={logout} className="btn btn-outline">Logout</button>
        </div>
      </nav>

      <div className="content">
        <div className="welcome-section">
          <div>
            <h1>Welcome back, {profile?.name || user?.first_name}! 👋</h1>
            <p className="subtitle">
              Patient ID: <strong style={{ color: '#007bff' }}>{profile?.patient_id}</strong> | Here's your health overview for today
            </p>
          </div>
          <div className="date-display">
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-card-health" style={{ borderLeftColor: getHealthStatusColor(profile?.health_status) }}>
            <div className="stat-icon-circle" style={{ background: `${getHealthStatusColor(profile?.health_status)}20`, color: getHealthStatusColor(profile?.health_status) }}>
              {getHealthStatusIcon(profile?.health_status)}
            </div>
            <div className="stat-content">
              <h3>Health Status</h3>
              <p className="stat-value" style={{ color: getHealthStatusColor(profile?.health_status) }}>
                {profile?.health_status || 'Unknown'}
              </p>
            </div>
          </div>

          <div className="stat-card stat-card-visit">
            <div className="stat-icon-circle" style={{ background: '#667eea20', color: '#667eea' }}>
              🏥
            </div>
            <div className="stat-content">
              <h3>Visit Status</h3>
              <p className="stat-value" style={{ color: '#667eea' }}>
                {profile?.status || 'N/A'}
              </p>
            </div>
          </div>

          <div className="stat-card stat-card-measurements">
            <div className="stat-icon-circle" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
              📊
            </div>
            <div className="stat-content">
              <h3>Total Measurements</h3>
              <p className="stat-value" style={{ color: '#8b5cf6' }}>
                {measurements.length}
              </p>
            </div>
          </div>

          <div className="stat-card stat-card-appointment">
            <div className="stat-icon-circle" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
              📅
            </div>
            <div className="stat-content">
              <h3>Next Appointment</h3>
              <p className="stat-value" style={{ color: '#f59e0b', fontSize: '1rem' }}>
                {profile?.next_visit_date ? new Date(profile.next_visit_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not Scheduled'}
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="card card-vitals">
            <div className="card-header-with-icon">
              <div>
                <h2>💓 Latest Vitals</h2>
                {latestMeasurement && (
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Recorded {new Date(latestMeasurement.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            {latestMeasurement ? (
              <div className="vitals-modern-grid">
                <div className="vital-item-modern vital-bp">
                  <div className="vital-icon">💉</div>
                  <span className="vital-label">Blood Pressure</span>
                  <span className="vital-value">{latestMeasurement.blood_pressure || 'N/A'}</span>
                  <span className="vital-unit">mmHg</span>
                </div>
                <div className="vital-item-modern vital-hr">
                  <div className="vital-icon">❤️</div>
                  <span className="vital-label">Heart Rate</span>
                  <span className="vital-value">{latestMeasurement.heart_rate || 'N/A'}</span>
                  <span className="vital-unit">bpm</span>
                </div>
                <div className="vital-item-modern vital-temp">
                  <div className="vital-icon">🌡️</div>
                  <span className="vital-label">Temperature</span>
                  <span className="vital-value">{latestMeasurement.temperature || 'N/A'}</span>
                  <span className="vital-unit">°F</span>
                </div>
                <div className="vital-item-modern vital-spo2">
                  <div className="vital-icon">🫁</div>
                  <span className="vital-label">SpO2</span>
                  <span className="vital-value">{latestMeasurement.spo2 || 'N/A'}</span>
                  <span className="vital-unit">%</span>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <p>No measurements recorded yet</p>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Your vital signs will appear here once recorded</p>
              </div>
            )}
            <Link to="/measurements" className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>View All Measurements →</Link>
          </div>

          <div className="card card-prescription">
            <div className="card-header-with-icon">
              <h2>💊 Current Prescription</h2>
            </div>
            {prescription && prescription.medicines && prescription.medicines.length > 0 ? (
              <div className="medicine-list-modern">
                {prescription.medicines.map((medicine, index) => (
                  <div key={index} className="medicine-item-modern">
                    <div className="medicine-icon">💊</div>
                    <div className="medicine-details">
                      <strong>{medicine.name}</strong>
                      <p className="text-muted">{medicine.dose} • {medicine.type}</p>
                    </div>
                    <div className="medicine-quantity">
                      <span className="badge badge-primary">{medicine.quantity}</span>
                    </div>
                  </div>
                ))}
                {/* No more-count, show all medicines in scrollable list */}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">💊</div>
                <p>No active prescriptions</p>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Your medications will appear here when prescribed</p>
              </div>
            )}
            <Link to="/prescription" className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>View Full Prescription →</Link>
          </div>
        </div>

        <div className="card card-visit">
          <div className="card-header-with-icon">
            <h2>📋 Recent Visit Information</h2>
          </div>
          {visits?.current_visit ? (
            <div className="visit-info-modern">
              <div className="info-row-modern">
                <div className="info-icon">📅</div>
                <div className="info-details">
                  <span className="info-label">Visit Time</span>
                  <span className="info-value">{new Date(visits.current_visit.visit_time).toLocaleString()}</span>
                </div>
              </div>
              <div className="info-row-modern">
                <div className="info-icon">🏥</div>
                <div className="info-details">
                  <span className="info-label">Reason for Visit</span>
                  <span className="info-value">{visits.current_visit.reason || 'N/A'}</span>
                </div>
              </div>
              <div className="info-row-modern">
                <div className="info-icon">📝</div>
                <div className="info-details">
                  <span className="info-label">Doctor's Notes</span>
                  <span className="info-value">{visits.current_visit.notes || 'No notes available'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No visit information available</p>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Your visit details will appear here</p>
            </div>
          )}
          <Link to="/visits" className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>View Visit History →</Link>
        </div>

        {/* Health Progress Card */}
        <div className="card card-health-progress" style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white',
          gridColumn: 'span 1'
        }}>
          <div className="card-header-with-icon">
            <h2 style={{ color: 'white' }}>📈 Health Progress & Trends</h2>
          </div>
          <div style={{ padding: '1rem 0' }}>
            <p style={{ fontSize: '0.95rem', marginBottom: '1rem', opacity: 0.95 }}>
              Track your health journey with detailed charts and analysis
            </p>
            <div className="info-row-modern" style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
              <div className="info-icon">📊</div>
              <div className="info-details">
                <span className="info-label" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Total Measurements</span>
                <span className="info-value" style={{ color: 'white' }}>{measurements.length} records</span>
              </div>
            </div>
            <div className="info-row-modern" style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
              <div className="info-icon">📉</div>
              <div className="info-details">
                <span className="info-label" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Visualizations</span>
                <span className="info-value" style={{ color: 'white' }}>BP, Heart Rate, Temp, SpO2</span>
              </div>
            </div>
            <Link to="/health-progress" className="btn" style={{ 
              marginTop: '1.5rem', 
              width: '100%',
              background: 'white',
              color: '#667eea',
              fontWeight: '600'
            }}>
              View Health Progress →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
