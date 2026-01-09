import React, { useState, useEffect, useCallback } from 'react';
import { getPatients, getPatient, updatePatient, createMeasurement, getLatestMeasurement } from '../api';

const HealthMonitoringStation = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [latestMeasurement, setLatestMeasurement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Measurement form state
  const [measurementData, setMeasurementData] = useState({
    blood_pressure: '',
    temperature: '',
    spo2: '',
    heart_rate: '',
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const loadPatientDetails = async (patientId) => {
    setLoading(true);
    try {
      const response = await getPatient(patientId);
      setSelectedPatient(response.data);
    } catch (error) {
      showMessage('error', 'Failed to load patient details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientsForMonitoring = useCallback(async () => {
    try {
      // Fetch patients in waiting or checking status
      const response = await getPatients();
      const monitoringPatients = response.data.filter(
        p => ['waiting', 'checking', 'examined'].includes(p.status)
      );
      setPatients(monitoringPatients);

      // Auto-select first checking patient, or first waiting if none checking
      const checkingPatient = monitoringPatients.find(p => p.status === 'checking');
      if (checkingPatient) {
        loadPatientDetails(checkingPatient.id);
      } else if (monitoringPatients.length > 0) {
        loadPatientDetails(monitoringPatients[0].id);
      }
    } catch (error) {
      showMessage('error', 'Failed to fetch patients');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchPatientsForMonitoring();
  }, [fetchPatientsForMonitoring]);

  useEffect(() => {
    if (selectedPatient) {
      fetchLatestMeasurement(selectedPatient.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatient]);

  const fetchLatestMeasurement = async (patientId) => {
    try {
      const response = await getLatestMeasurement(patientId);
      setLatestMeasurement(response.data);
    } catch (error) {
      setLatestMeasurement(null);
    }
  };

  const handlePatientSelect = (e) => {
    const patientId = parseInt(e.target.value);
    loadPatientDetails(patientId);
  };

  const handleMeasurementChange = (e) => {
    const { name, value } = e.target;
    setMeasurementData({ ...measurementData, [name]: value });
  };

  const handleSaveMeasurement = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      showMessage('error', 'Please select a patient first');
      return;
    }

    setLoading(true);
    try {
      // Filter out empty fields
      const dataToSend = {};
      Object.keys(measurementData).forEach(key => {
        if (measurementData[key] !== '') {
          dataToSend[key] = measurementData[key];
        }
      });

      if (Object.keys(dataToSend).length === 0) {
        showMessage('error', 'Please enter at least one vital sign');
        setLoading(false);
        return;
      }

      await createMeasurement(selectedPatient.id, dataToSend);
      
      // Update patient status to examined if currently checking
      if (selectedPatient.status === 'checking') {
        await updatePatient(selectedPatient.id, { status: 'examined' });
      }

      showMessage('success', 'Measurement saved successfully!');

      // Reset form
      setMeasurementData({
        blood_pressure: '',
        temperature: '',
        spo2: '',
        heart_rate: '',
      });

      // Refresh data
      fetchLatestMeasurement(selectedPatient.id);
      loadPatientDetails(selectedPatient.id);
      fetchPatientsForMonitoring();
    } catch (error) {
      showMessage('error', 'Failed to save measurement: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleStartChecking = async () => {
    if (!selectedPatient) return;

    try {
      await updatePatient(selectedPatient.id, { status: 'checking' });
      loadPatientDetails(selectedPatient.id);
      fetchPatientsForMonitoring();
      showMessage('success', 'Patient status updated to checking');
    } catch (error) {
      showMessage('error', 'Failed to update patient status');
    }
  };

  return (
    <div className="health-monitoring-station">
      <h2 className="mb-4">Health Monitoring Station</h2>

      {/* Alert Message */}
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      <div className="row">
        {/* Patient Selection & Info */}
        <div className="col-md-6">
          <div className="card mb-3">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Patient Selection</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Select Patient:</label>
                <select
                  className="form-select"
                  onChange={handlePatientSelect}
                  value={selectedPatient?.id || ''}
                >
                  <option value="">-- Select a patient --</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      #{patient.id} - {patient.name} ({patient.age}, {patient.gender}) - {patient.status}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPatient && (
                <div>
                  <hr />
                  <h6>Patient Information</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <th>Name:</th>
                        <td>{selectedPatient.name}</td>
                      </tr>
                      <tr>
                        <th>Age:</th>
                        <td>{selectedPatient.age}</td>
                      </tr>
                      <tr>
                        <th>Gender:</th>
                        <td>{selectedPatient.gender}</td>
                      </tr>
                      <tr>
                        <th>Phone:</th>
                        <td>{selectedPatient.phone || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Status:</th>
                        <td>
                          <span className={`badge ${selectedPatient.status === 'waiting' ? 'bg-warning' : 
                            selectedPatient.status === 'checking' ? 'bg-info' : 'bg-primary'}`}>
                            {selectedPatient.status}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <th>Reason:</th>
                        <td>{selectedPatient.reason || 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>

                  {selectedPatient.status === 'waiting' && (
                    <button
                      className="btn btn-info w-100"
                      onClick={handleStartChecking}
                    >
                      Start Health Check
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Latest Measurement Display */}
          <div className="card">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">Latest Measurement</h5>
            </div>
            <div className="card-body">
              {latestMeasurement ? (
                <div>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <th>Blood Pressure:</th>
                        <td>{latestMeasurement.blood_pressure || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Temperature (°C):</th>
                        <td>{latestMeasurement.temperature || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>SpO₂ (%):</th>
                        <td>{latestMeasurement.spo2 || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Heart Rate (bpm):</th>
                        <td>{latestMeasurement.heart_rate || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Source:</th>
                        <td>
                          <span className={`badge ${latestMeasurement.source === 'device' ? 'bg-success' : 'bg-secondary'}`}>
                            {latestMeasurement.source}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <th>Timestamp:</th>
                        <td>{new Date(latestMeasurement.timestamp).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center">No measurements recorded yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Measurement Entry Form */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Record Vitals (Manual Entry)</h5>
            </div>
            <div className="card-body">
              {!selectedPatient ? (
                <p className="text-muted text-center">Please select a patient first</p>
              ) : (
                <form onSubmit={handleSaveMeasurement}>
                  <div className="mb-3">
                    <label className="form-label">Blood Pressure (e.g., 120/80)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="blood_pressure"
                      value={measurementData.blood_pressure}
                      onChange={handleMeasurementChange}
                      placeholder="120/80"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      name="temperature"
                      value={measurementData.temperature}
                      onChange={handleMeasurementChange}
                      placeholder="98.6"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">SpO₂ (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      name="spo2"
                      value={measurementData.spo2}
                      onChange={handleMeasurementChange}
                      placeholder="98"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      name="heart_rate"
                      value={measurementData.heart_rate}
                      onChange={handleMeasurementChange}
                      placeholder="72"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Measurement'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* IoT Placeholder */}
          <div className="card mt-3">
            <div className="card-header bg-warning">
              <h5 className="mb-0">IoT Device Integration (Future)</h5>
            </div>
            <div className="card-body text-center">
              <p className="mb-2">
                <strong>IoT Integration Point:</strong> In the future, this section will allow
                automatic measurement capture from connected IoT devices.
              </p>
              <button className="btn btn-warning" disabled>
                <i className="bi bi-device-hdd"></i> Start Device Measurement (Coming Soon)
              </button>
              <p className="text-muted mt-2 small">
                Backend endpoints are ready at:<br />
                <code>GET /api/devices/&lt;device_id&gt;/command/</code><br />
                <code>POST /api/devices/&lt;device_id&gt;/measurements/</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthMonitoringStation;
