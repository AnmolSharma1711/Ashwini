import React, { useState, useEffect, useCallback } from 'react';
import { getPatients, createPatient, deletePatient } from '../api';

const RegistrationDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [patientType, setPatientType] = useState('new'); // 'new' or 'returning'
  const [returningPatientFound, setReturningPatientFound] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    address: '',
    reason: '',
    username: '',
    email: '',
    password: '',
  });

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPatients();
      setPatients(response.data);
    } catch (error) {
      showMessage('error', 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-generate username from patient name
    if (name === 'name') {
      const username = value.toLowerCase().replace(/\s+/g, '');
      setFormData({ ...formData, name: value, username: username });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePatientTypeChange = (type) => {
    setPatientType(type);
    setReturningPatientFound(null);
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      phone: '',
      address: '',
      reason: '',
      username: '',
      email: '',
      password: '',
    });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setReturningPatientFound(null);

    try {
      const response = await createPatient(formData);
      
      // Check if this was a returning patient
      if (response.data.is_returning) {
        setReturningPatientFound({
          found: true,
          patient: response.data.patient,
          username: response.data.username
        });
        showMessage('success', `Welcome back! ${response.data.message}`);
      } else {
        showMessage('success', 'New patient registered successfully!');
      }
      
      // Reset form
      setFormData({
        name: '',
        age: '',
        gender: 'Male',
        phone: '',
        address: '',
        reason: '',
        username: '',
        email: '',
        password: '',
      });

      // Refresh patient list
      fetchPatients();
    } catch (error) {
      showMessage('error', 'Failed to register patient: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) {
      return;
    }

    try {
      await deletePatient(id);
      showMessage('success', 'Patient deleted successfully');
      fetchPatients();
    } catch (error) {
      showMessage('error', 'Failed to delete patient');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      waiting: 'bg-warning',
      checking: 'bg-info',
      examined: 'bg-primary',
      completed: 'bg-success',
    };
    return statusClasses[status] || 'bg-secondary';
  };

  return (
    <div className="registration-dashboard">
      <h2 className="mb-4">Registration Dashboard</h2>

      {/* Alert Message */}
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      <div className="row">
        {/* Registration Form */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Patient Check-In</h5>
            </div>
            <div className="card-body">
              {/* Patient Type Selection */}
              <div className="mb-4">
                <label className="form-label fw-bold">Patient Type</label>
                <div className="btn-group w-100" role="group">
                  <input
                    type="radio"
                    className="btn-check"
                    name="patientType"
                    id="typeNew"
                    checked={patientType === 'new'}
                    onChange={() => handlePatientTypeChange('new')}
                  />
                  <label className="btn btn-outline-primary" htmlFor="typeNew">
                    <i className="bi bi-person-plus"></i> New Patient
                  </label>

                  <input
                    type="radio"
                    className="btn-check"
                    name="patientType"
                    id="typeReturning"
                    checked={patientType === 'returning'}
                    onChange={() => handlePatientTypeChange('returning')}
                  />
                  <label className="btn btn-outline-success" htmlFor="typeReturning">
                    <i className="bi bi-person-check"></i> Returning Patient
                  </label>
                </div>
                <small className="text-muted d-block mt-2">
                  {patientType === 'new' 
                    ? 'Register a first-time patient' 
                    : 'Check-in an existing patient (enter name + phone)'}
                </small>
              </div>

              {/* Returning Patient Found Message */}
              {returningPatientFound?.found && (
                <div className="alert alert-success">
                  <h6 className="alert-heading">
                    <i className="bi bi-check-circle"></i> Patient Found!
                  </h6>
                  <p className="mb-1"><strong>Name:</strong> {returningPatientFound.patient.name}</p>
                  <p className="mb-1"><strong>Age:</strong> {returningPatientFound.patient.age}</p>
                  <p className="mb-1"><strong>Gender:</strong> {returningPatientFound.patient.gender}</p>
                  {returningPatientFound.username && (
                    <p className="mb-0">
                      <strong>Portal Username:</strong> {returningPatientFound.username}
                    </p>
                  )}
                  <hr />
                  <small>Patient has been checked in for today's visit.</small>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Name - Required for both */}
                <div className="mb-3">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder={patientType === 'returning' ? 'Enter exact name' : 'Full name'}
                  />
                </div>

                {/* Phone - Required for both */}
                <div className="mb-3">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder={patientType === 'returning' ? 'Enter registered phone' : '10-digit number'}
                  />
                  {patientType === 'returning' && (
                    <small className="text-info">
                      <i className="bi bi-info-circle"></i> Enter the exact name and phone used during first visit
                    </small>
                  )}
                </div>

                {/* Additional fields only for NEW patients */}
                {patientType === 'new' && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Age *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        required
                        min="0"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Gender *</label>
                      <select
                        className="form-select"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Patient Portal Account - Always Created */}
                    <div className="mb-3">
                      <label className="form-label">
                        Username * 
                        <small className="text-muted ms-2">(Auto-generated from name)</small>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="username"
                        value={formData.username}
                        readOnly
                        placeholder="Will be generated from name"
                        style={{ backgroundColor: '#f0f0f0' }}
                      />
                      <small className="text-muted">Patient will use this to login to the portal</small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="patient@example.com"
                      />
                      <small className="text-muted">For password recovery and notifications</small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="Minimum 6 characters"
                        minLength="6"
                      />
                      <small className="text-muted">Patient will use this to login to the portal</small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="2"
                      />
                    </div>
                  </>
                )}

                {/* Reason for visit - shown for both */}
                <div className="mb-3">
                  <label className="form-label">
                    {patientType === 'returning' ? 'Reason for Today\'s Visit' : 'Reason for Visit'}
                  </label>
                  <textarea
                    className="form-control"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder={patientType === 'returning' ? 'What brings you in today?' : 'Optional'}
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? (
                    patientType === 'returning' ? 'Checking In...' : 'Registering...'
                  ) : (
                    patientType === 'returning' ? 
                      <><i className="bi bi-person-check"></i> Check In Patient</> : 
                      <><i className="bi bi-person-plus"></i> Register New Patient</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Patient List */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">Patient Queue ({patients.length})</h5>
            </div>
            <div className="card-body">
              {loading && patients.length === 0 ? (
                <div className="text-center">Loading...</div>
              ) : patients.length === 0 ? (
                <div className="text-center text-muted">No patients registered yet</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Visit Time</th>
                        <th>Reason</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((patient) => (
                        <tr key={patient.id}>
                          <td>{patient.id}</td>
                          <td>{patient.name}</td>
                          <td>{patient.age}</td>
                          <td>{patient.gender}</td>
                          <td>{patient.phone || '-'}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(patient.status)}`}>
                              {patient.status}
                            </span>
                          </td>
                          <td>{new Date(patient.visit_time).toLocaleString()}</td>
                          <td>{patient.reason || '-'}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(patient.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationDashboard;
