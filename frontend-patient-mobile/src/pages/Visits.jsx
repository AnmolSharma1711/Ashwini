import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import MobileNavbar from '../components/MobileNavbar';

const Visits = () => {
  const [visits, setVisits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
    
    // Auto-refresh visits every 10 seconds
    const interval = setInterval(() => {
      fetchVisits();
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const fetchVisits = async () => {
    try {
      const response = await axiosInstance.get('/api/patient-portal/visits/');
      setVisits(response.data);
    } catch (error) {
      console.error('Error fetching visits:', error);
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
        <h1>My Visits</h1>
        <p className="subtitle">Complete history of your medical visits</p>

        {/* Current Visit */}
        {visits?.current_visit && visits.current_visit.visit_time && (
          <div className="card" style={{ borderLeft: '4px solid #667eea', marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#667eea' }}>📋 Current Visit</h2>
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
                <span className={`badge ${
                  visits.current_visit.health_status === 'critical' ? 'badge-danger' :
                  visits.current_visit.health_status === 'mild' ? 'badge-warning' :
                  'badge-success'
                }`}>
                  {visits.current_visit.health_status || 'N/A'}
                </span>
              </div>
              {visits.current_visit.next_visit_date && (
                <div className="detail-row">
                  <span className="detail-label">Next Appointment:</span>
                  <span className="detail-value">{new Date(visits.current_visit.next_visit_date).toLocaleDateString()}</span>
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
        )}

        {/* Visit History */}
        {visits?.visit_history && visits.visit_history.length > 0 ? (
          <>
            <h2 style={{ marginBottom: '1.5rem', marginTop: '2rem' }}>📅 Visit History</h2>
            <div className="measurements-list">
              {visits.visit_history.map((visit, index) => (
                <div key={index} className="card measurement-card">
                  <div className="measurement-header">
                    <span className="measurement-date">
                      {new Date(visit.visit_time).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}, {new Date(visit.visit_time).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <span className={`badge ${
                      visit.health_status === 'critical' ? 'badge-danger' :
                      visit.health_status === 'mild' ? 'badge-warning' :
                      'badge-success'
                    }`}>
                      {visit.health_status}
                    </span>
                  </div>
                  
                  <div className="visit-details" style={{ marginTop: '1rem' }}>
                    <div className="detail-row">
                      <span className="detail-label">Reason for Visit:</span>
                      <span className="detail-value">{visit.reason || 'Not specified'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className="badge">{visit.status}</span>
                    </div>
                    {visit.notes && (
                      <div className="detail-row">
                        <span className="detail-label">Doctor's Notes:</span>
                        <span className="detail-value">{visit.notes}</span>
                      </div>
                    )}
                    {visit.next_visit_date && (
                      <div className="detail-row">
                        <span className="detail-label">Follow-up Scheduled:</span>
                        <span className="detail-value">
                          {new Date(visit.next_visit_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    <div className="detail-row" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb' }}>
                      <span className="detail-label" style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                        Archived:
                      </span>
                      <span className="detail-value" style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                        {new Date(visit.archived_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          !visits?.current_visit && (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>No visit history available</p>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Your visit records will appear here</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Visits;
