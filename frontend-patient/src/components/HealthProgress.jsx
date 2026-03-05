import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import './HealthProgress.css';

const HealthProgress = () => {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, all
  const { logout } = useAuth();

  useEffect(() => {
    fetchMeasurements();
    
    // Auto-refresh measurements every 10 seconds
    const interval = setInterval(() => {
      fetchMeasurements();
    }, 10000);
    
    return () => clearInterval(interval);
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

  const filterDataByTimeRange = (data) => {
    if (timeRange === 'all') return data;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    if (timeRange === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      cutoffDate.setDate(now.getDate() - 30);
    }
    
    return data.filter(item => new Date(item.timestamp) >= cutoffDate);
  };

  const prepareChartData = () => {
    const filtered = filterDataByTimeRange(measurements);
    
    return filtered.map(m => {
      const date = new Date(m.timestamp);
      const bp = m.blood_pressure ? m.blood_pressure.split('/') : [null, null];
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        systolic: bp[0] ? parseInt(bp[0]) : null,
        diastolic: bp[1] ? parseInt(bp[1]) : null,
        heartRate: m.heart_rate || null,
        temperature: m.temperature || null,
        spo2: m.spo2 || null,
        timestamp: date.getTime()
      };
    }).sort((a, b) => a.timestamp - b.timestamp);
  };

  const chartData = prepareChartData();

  if (loading) {
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
            <Link to="/visits" className="nav-link">Visits</Link>
            <Link to="/health-progress" className="nav-link active">Health Progress</Link>
            <button onClick={logout} className="btn btn-outline">Logout</button>
          </div>
        </nav>
        <div className="health-progress-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (measurements.length === 0) {
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
            <Link to="/visits" className="nav-link">Visits</Link>
            <Link to="/health-progress" className="nav-link active">Health Progress</Link>
            <button onClick={logout} className="btn btn-outline">Logout</button>
          </div>
        </nav>
        <div className="health-progress-container">
          <div className="no-data-message">
            <p>📊 No measurement data available yet</p>
            <p className="subtext">Your health trends will appear here once measurements are recorded</p>
          </div>
        </div>
      </div>
    );
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
          <Link to="/visits" className="nav-link">Visits</Link>
          <Link to="/health-progress" className="nav-link active">Health Progress</Link>
          <button onClick={logout} className="btn btn-outline">Logout</button>
        </div>
      </nav>
      <div className="health-progress-container">
      <div className="progress-header">
        <h2>📈 Health Progress & Trends</h2>
        <div className="time-range-selector">
          <button 
            className={timeRange === 'week' ? 'active' : ''} 
            onClick={() => setTimeRange('week')}
          >
            Last 7 Days
          </button>
          <button 
            className={timeRange === 'month' ? 'active' : ''} 
            onClick={() => setTimeRange('month')}
          >
            Last 30 Days
          </button>
          <button 
            className={timeRange === 'all' ? 'active' : ''} 
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="charts-grid">
        {/* Blood Pressure Chart */}
        <div className="chart-card">
          <h3>🩸 Blood Pressure Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
                domain={[60, 180]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '10px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="systolic" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Systolic"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="diastolic" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Diastolic"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="chart-info">
            <span className="normal-range">Normal: 120/80 mmHg</span>
          </div>
        </div>

        {/* Heart Rate Chart */}
        <div className="chart-card">
          <h3>💓 Heart Rate Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
                domain={[40, 140]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '10px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="heartRate" 
                stroke="#ec4899" 
                strokeWidth={2}
                name="Heart Rate (bpm)"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="chart-info">
            <span className="normal-range">Normal: 60-100 bpm</span>
          </div>
        </div>

        {/* Temperature Chart */}
        <div className="chart-card">
          <h3>🌡️ Temperature Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
                domain={[35, 40]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '10px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Temperature (°C)"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="chart-info">
            <span className="normal-range">Normal: 36.5-37.5 °C</span>
          </div>
        </div>

        {/* SpO2 Chart */}
        <div className="chart-card">
          <h3>🫁 Oxygen Saturation Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
                domain={[85, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '10px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="spo2" 
                stroke="#10b981" 
                strokeWidth={2}
                name="SpO2 (%)"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="chart-info">
            <span className="normal-range">Normal: 95-100%</span>
          </div>
        </div>
      </div>

      <div className="progress-summary">
        <div className="summary-card">
          <h4>📊 Summary Statistics</h4>
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Total Measurements</span>
              <span className="stat-value">{chartData.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Latest Reading</span>
              <span className="stat-value">
                {chartData.length > 0 
                  ? chartData[chartData.length - 1].date 
                  : 'N/A'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tracking Period</span>
              <span className="stat-value">
                {timeRange === 'week' ? '7 Days' : timeRange === 'month' ? '30 Days' : 'All Time'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default HealthProgress;
