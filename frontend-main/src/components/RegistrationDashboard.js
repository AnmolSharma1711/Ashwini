import React, { useState, useEffect, useCallback } from 'react';
import { getPatients, createPatient, deletePatient, searchPatients } from '../api';

const RegistrationDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [patientType, setPatientType] = useState('new'); // 'new' or 'returning'
  const [returningPatientFound, setReturningPatientFound] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    patient_id: '', // For returning patients
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    address: '',
    reason: '',
    username: '',
    email: '',
    password: '',
    data_collection_consent: false,
    data_usage_consent: false,
    privacy_policy_acknowledged: false,
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
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
      return;
    }
    
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
    setSearchTerm('');
    setSearchResults([]);
    setFormData({
      patient_id: '',
      name: '',
      age: '',
      gender: 'Male',
      phone: '',
      address: '',
      reason: '',
      username: '',
      email: '',
      password: '',
      data_collection_consent: false,
      data_usage_consent: false,
      privacy_policy_acknowledged: false,
    });
    setMessage({ type: '', text: '' });
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      showMessage('error', 'Please enter a search term');
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchPatients(searchTerm);
      setSearchResults(response.data.results || []);
      
      if (response.data.count === 0) {
        showMessage('error', 'No patient found with that Patient ID, phone, or name');
      } else if (response.data.count === 1) {
        // Exact match - auto-fill form
        const patient = response.data.results[0];
        setFormData({
          ...formData,
          patient_id: patient.patient_id,
          name: patient.name,
          phone: patient.phone || '',
        });
        showMessage('success', `Found: ${patient.name} (${patient.patient_id})`);
      } else {
        showMessage('success', `Found ${response.data.count} patients`);
      }
    } catch (error) {
      showMessage('error', 'Search failed: ' + (error.response?.data?.error || error.message));
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (patient) => {
    setFormData({
      ...formData,
      patient_id: patient.patient_id,
      name: patient.name,
      phone: patient.phone || '',
    });
    setSearchResults([]);
    setSearchTerm('');
    showMessage('success', `Selected: ${patient.name} (${patient.patient_id})`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setReturningPatientFound(null);

    // Validate consent for new patients
    if (patientType === 'new') {
      if (!formData.data_collection_consent || !formData.data_usage_consent || !formData.privacy_policy_acknowledged) {
        showMessage('error', 'Please check all consent boxes to register the patient.');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await createPatient(formData);
      
      // Check if this was a returning patient
      if (response.data.is_returning) {
        setReturningPatientFound({
          found: true,
          patient: response.data.patient,
          patient_id: response.data.patient_id,
          username: response.data.username
        });
        showMessage('success', `Welcome back! Patient ID: ${response.data.patient_id}`);
      } else {
        showMessage('success', `New patient registered! Patient ID: ${response.data.patient_id}`);
        // Show patient_id prominently in a separate alert
        alert(`✅ PATIENT REGISTERED\n\nPatient ID: ${response.data.patient_id}\nName: ${response.data.patient.name}\n\nPlease share this Patient ID with the patient.\nThey can use it to login to the patient portal.`);
      }
      
      // Reset form
      setFormData({
        patient_id: '',
        name: '',
        age: '',
        gender: 'Male',
        phone: '',
        address: '',
        reason: '',
        username: '',
        email: '',
        password: '',
        data_collection_consent: false,
        data_usage_consent: false,
        privacy_policy_acknowledged: false,
      });
      setSearchTerm('');
      setSearchResults([]);

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
                  <p className="mb-1"><strong>Patient ID:</strong> <span className="badge bg-primary">{returningPatientFound.patient_id}</span></p>
                  <p className="mb-1"><strong>Name:</strong> {returningPatientFound.patient.name}</p>
                  <p className="mb-1"><strong>Age:</strong> {returningPatientFound.patient.age}</p>
                  <p className="mb-0"><strong>Gender:</strong> {returningPatientFound.patient.gender}</p>
                  <hr />
                  <small>Patient has been checked in for today's visit.</small>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Search for returning patients */}
                {patientType === 'returning' && (
                  <div className="mb-3">
                    <label className="form-label">Search Patient <small className="text-muted">(Patient ID, Phone, or Name)</small></label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Enter Patient ID, phone, or name"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                      />
                      <button 
                        className="btn btn-outline-primary" 
                        type="button"
                        onClick={handleSearch}
                        disabled={isSearching}
                      >
                        {isSearching ? 'Searching...' : <><i className="bi bi-search"></i> Search</>}
                      </button>
                    </div>
                    <small className="text-info d-block mt-1">
                      <i className="bi bi-info-circle"></i> Preferred: Use Patient ID (e.g., PAT0001)
                    </small>
                    
                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="mt-2 border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <strong className="d-block mb-2">Select a patient:</strong>
                        {searchResults.map((patient) => (
                          <div 
                            key={patient.id} 
                            className="p-2 mb-1 bg-light rounded cursor-pointer hover-bg-primary"
                            onClick={() => selectSearchResult(patient)}
                            style={{ cursor: 'pointer' }}
                          >
                            <strong>{patient.patient_id}</strong> - {patient.name} ({patient.phone})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Patient ID field - auto-filled for returning patients */}
                {patientType === 'returning' && formData.patient_id && (
                  <div className="mb-3">
                    <label className="form-label">Patient ID</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={formData.patient_id}
                      readOnly
                    />
                  </div>
                )}

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
                    placeholder={patientType === 'returning' ? 'Auto-filled from search' : 'Full name'}
                    readOnly={patientType === 'returning' && formData.patient_id}
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
                    placeholder={patientType === 'returning' ? 'Auto-filled from search' : '10-digit number'}
                    readOnly={patientType === 'returning' && formData.patient_id}
                  />
                  {patientType === 'returning' && !formData.patient_id && (
                    <small className="text-warning">
                      <i className="bi bi-exclamation-triangle"></i> Please search and select a patient first
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

                    {/* Patient Portal Account - Patient ID will be used for login */}
                    <div className="alert alert-info mb-3">
                      <small>
                        <i className="bi bi-info-circle"></i> <strong>Patient Portal Access:</strong> After registration, 
                        the patient will receive a unique <strong>Patient ID</strong> (e.g., PAT0001) to login to the patient portal.
                      </small>
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
                      <small className="text-muted">Patient will use Patient ID + Password to login to the portal</small>
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

                {/* Consent Checkboxes - Only for new patients */}
                {patientType === 'new' && (
                  <div className="mb-4">
                    <div className="card bg-light">
                      <div className="card-header">
                        <h6 className="mb-0">Patient Consent (Required)</h6>
                      </div>
                      <div className="card-body">
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="data_collection_consent"
                            name="data_collection_consent"
                            checked={formData.data_collection_consent}
                            onChange={handleInputChange}
                            required
                          />
                          <label className="form-check-label" htmlFor="data_collection_consent">
                            <strong>Data Collection:</strong> I consent to my health information being collected and stored by this healthcare facility.
                          </label>
                        </div>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="data_usage_consent"
                            name="data_usage_consent"
                            checked={formData.data_usage_consent}
                            onChange={handleInputChange}
                            required
                          />
                          <label className="form-check-label" htmlFor="data_usage_consent">
                            <strong>Data Usage:</strong> I consent to my health data being used for treatment, diagnosis, and quality improvement purposes.
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="privacy_policy_acknowledged"
                            name="privacy_policy_acknowledged"
                            checked={formData.privacy_policy_acknowledged}
                            onChange={handleInputChange}
                            required
                          />
                          <label className="form-check-label" htmlFor="privacy_policy_acknowledged">
                            <strong>Privacy Policy:</strong> I have read and acknowledge the hospital's privacy policy and data protection practices.
                          </label>
                        </div>
                        <div className="mt-2">
                          <small className="text-muted">
                            <i className="bi bi-info-circle"></i> All consents are required for registration and HIPAA compliance.
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                        <th>Patient ID</th>
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
                          <td><strong className="text-primary">{patient.patient_id}</strong></td>
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
