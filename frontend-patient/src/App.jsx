import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Measurements from './pages/Measurements';
import Prescription from './pages/Prescription';
import Visits from './pages/Visits';
import HealthProgress from './components/HealthProgress';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/measurements"
            element={
              <PrivateRoute>
                <Measurements />
              </PrivateRoute>
            }
          />
          <Route
            path="/prescription"
            element={
              <PrivateRoute>
                <Prescription />
              </PrivateRoute>
            }
          />
          <Route
            path="/visits"
            element={
              <PrivateRoute>
                <Visits />
              </PrivateRoute>
            }
          />
          <Route
            path="/health-progress"
            element={
              <PrivateRoute>
                <HealthProgress />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
