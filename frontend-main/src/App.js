import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import RegistrationDashboard from './components/RegistrationDashboard';
import HealthMonitoringStation from './components/HealthMonitoringStation';

function App() {
  const [activeView, setActiveView] = useState('registration');

  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand">Project Ashwini - Main System</span>
          <div className="navbar-nav">
            <button
              className={`nav-link btn btn-link ${activeView === 'registration' ? 'active' : ''}`}
              onClick={() => setActiveView('registration')}
            >
              Registration Dashboard
            </button>
            <button
              className={`nav-link btn btn-link ${activeView === 'monitoring' ? 'active' : ''}`}
              onClick={() => setActiveView('monitoring')}
            >
              Health Monitoring Station
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid mt-3">
        {activeView === 'registration' && <RegistrationDashboard />}
        {activeView === 'monitoring' && <HealthMonitoringStation />}
      </div>
    </div>
  );
}

export default App;
