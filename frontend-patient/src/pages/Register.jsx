import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone: '',
    age: '',
    gender: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.password_confirm) {
      setErrorMessage('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (!formData.age || formData.age < 1 || formData.age > 150) {
      setErrorMessage('Please enter a valid age');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/api/patient-portal/register/', formData);
      
      // Store tokens
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      
      setSuccessMessage('Registration successful! Redirecting to dashboard...');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
      
    } catch (error) {
      if (error.response && error.response.data) {
        const errors = error.response.data;
        
        // Handle different error formats
        if (typeof errors === 'object') {
          const errorMessages = Object.entries(errors)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value.join(', ')}`;
              }
              return `${key}: ${value}`;
            })
            .join('; ');
          setErrorMessage(errorMessages);
        } else if (errors.error) {
          setErrorMessage(errors.error);
        } else {
          setErrorMessage('Registration failed. Please try again.');
        }
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '600px' }}>
        <div className="login-header">
          <div className="logo">
            <div className="logo-icon">🏥</div>
            <h1>Ashwini</h1>
          </div>
          <h2>Patient Registration</h2>
          <p>Create your account to access the patient portal</p>
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <span className="alert-icon">✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter your first name"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter your last name"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
              autoComplete="username"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password_confirm">Confirm Password *</label>
              <input
                type="password"
                id="password_confirm"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age *</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Your age"
                required
                min="1"
                max="150"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                disabled={isLoading}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1234567890 (optional)"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your address (optional)"
              rows="3"
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
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Already have an account? <Link to="/login" className="link-primary">Login here</Link>
          </p>
          <p className="text-muted" style={{ marginTop: '1rem' }}>
            <span className="security-icon">🔒</span>
            Your data is protected and HIPAA compliant
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
