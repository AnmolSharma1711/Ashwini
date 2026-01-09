import React, { useState, useEffect, useCallback } from 'react';
import { getPatients, createPatient, deletePatient } from '../api';

const RegistrationDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    address: '',
    reason: '',
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
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createPatient(formData);
      showMessage('success', 'Patient registered successfully!');
      
      // Reset form
      setFormData({
        name: '',
        age: '',
        gender: 'Male',
        phone: '',
        address: '',
        reason: '',
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
              <h5 className="mb-0">Register New Patient</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

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

                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
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

                <div className="mb-3">
                  <label className="form-label">Reason for Visit</label>
                  <textarea
                    className="form-control"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Registering...' : 'Register Patient'}
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
