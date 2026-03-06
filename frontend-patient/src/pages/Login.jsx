import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await login(username, password);
      
      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setErrorMessage(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <div className="logo-icon">🏥</div>
            <h1>Ashwini</h1>
          </div>
          <h2>Patient Portal</h2>
          <p>Access your medical records securely</p>
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Patient ID</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your Patient ID (e.g., PAT0001)"
              required
              autoComplete="username"
              disabled={isLoading}
            />
            <small className="form-text text-muted">
              💡 Use your Patient ID provided during registration at the reception
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-small"></span>
                Logging in...
              </>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account? <Link to="/register" className="link-primary">Register here</Link>
          </p>
          <p className="text-muted" style={{ marginTop: '1rem' }}>
            <span className="security-icon">🔒</span>
            Secure login - Your data is protected
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
