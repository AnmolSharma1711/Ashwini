import React, { useState, useEffect } from 'react';
import { getPatient, updatePatient, updatePrescription } from '../api';

const PatientView = ({ patientId, onUpdate }) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [notes, setNotes] = useState('');
  const [nextVisitDate, setNextVisitDate] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    dose: '',
    type: 'Tablet',
    quantity: 'Full',
  });

  const fetchPatientDetails = async () => {
    setLoading(true);
    try {
      const response = await getPatient(patientId);
      const patientData = response.data;
      setPatient(patientData);
      setNotes(patientData.notes || '');
      setNextVisitDate(patientData.next_visit_date || '');
      setMedicines(patientData.prescription?.medicines || []);
    } catch (error) {
      showMessage('error', 'Failed to load patient details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const handleAddMedicine = () => {
    if (!newMedicine.name) {
      showMessage('error', 'Please enter medicine name');
      return;
    }

    setMedicines([...medicines, { ...newMedicine }]);
    setNewMedicine({
      name: '',
      dose: '',
      type: 'Tablet',
      quantity: 'Full',
    });
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleSavePrescription = async () => {
    setLoading(true);
    try {
      await updatePrescription(patientId, { medicines });
      showMessage('success', 'Prescription saved successfully!');
      fetchPatientDetails();
    } catch (error) {
      showMessage('error', 'Failed to save prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotesAndVisit = async () => {
    setLoading(true);
    try {
      const dataToUpdate = {
        notes: notes,
      };
      
      if (nextVisitDate) {
        dataToUpdate.next_visit_date = nextVisitDate;
      }

      await updatePatient(patientId, dataToUpdate);
      showMessage('success', 'Notes and next visit date saved!');
      fetchPatientDetails();
    } catch (error) {
      showMessage('error', 'Failed to save notes');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!window.confirm('Mark this patient as completed?')) {
      return;
    }

    setLoading(true);
    try {
      await updatePatient(patientId, { status: 'completed' });
      showMessage('success', 'Patient marked as completed!');
      if (onUpdate) onUpdate();
    } catch (error) {
      showMessage('error', 'Failed to update patient status');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  if (loading && !patient) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <div className="patient-view">
      {/* Alert Message */}
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      <div className="row">
        {/* Left Column - Patient Info & Vitals */}
        <div className="col-md-6">
          {/* Patient Demographics */}
          <div className="card mb-3 patient-card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Patient Information</h5>
            </div>
            <div className="card-body">
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <th>ID:</th>
                    <td>{patient.id}</td>
                  </tr>
                  <tr>
                    <th>Name:</th>
                    <td><strong>{patient.name}</strong></td>
                  </tr>
                  <tr>
                    <th>Age:</th>
                    <td>{patient.age} years</td>
                  </tr>
                  <tr>
                    <th>Gender:</th>
                    <td>{patient.gender}</td>
                  </tr>
                  <tr>
                    <th>Phone:</th>
                    <td>{patient.phone || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th>Address:</th>
                    <td>{patient.address || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th>Reason for Visit:</th>
                    <td>{patient.reason || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th>Visit Time:</th>
                    <td>{new Date(patient.visit_time).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th>Status:</th>
                    <td>
                      <span className={`badge ${
                        patient.status === 'waiting' ? 'bg-warning' :
                        patient.status === 'checking' ? 'bg-info' :
                        patient.status === 'examined' ? 'bg-primary' : 'bg-success'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Latest Vitals */}
          <div className="card mb-3">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Latest Vital Signs</h5>
            </div>
            <div className="card-body">
              {patient.latest_measurement ? (
                <div className="vitals-grid">
                  <div className="vital-box">
                    <div className="vital-label">Blood Pressure</div>
                    <div className="vital-value">
                      {patient.latest_measurement.blood_pressure || 'N/A'}
                    </div>
                  </div>
                  <div className="vital-box">
                    <div className="vital-label">Temperature (°C)</div>
                    <div className="vital-value">
                      {patient.latest_measurement.temperature || 'N/A'}
                    </div>
                  </div>
                  <div className="vital-box">
                    <div className="vital-label">SpO₂ (%)</div>
                    <div className="vital-value">
                      {patient.latest_measurement.spo2 || 'N/A'}
                    </div>
                  </div>
                  <div className="vital-box">
                    <div className="vital-label">Heart Rate (bpm)</div>
                    <div className="vital-value">
                      {patient.latest_measurement.heart_rate || 'N/A'}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted text-center mb-0">No measurements recorded</p>
              )}
            </div>
          </div>

          {/* Doctor's Notes */}
          <div className="card mb-3">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Doctor's Notes</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Clinical Notes</label>
                <textarea
                  className="form-control"
                  rows="5"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter clinical observations, diagnosis, treatment plan..."
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Next Visit Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={nextVisitDate}
                  onChange={(e) => setNextVisitDate(e.target.value)}
                />
              </div>

              <button
                className="btn btn-success w-100"
                onClick={handleSaveNotesAndVisit}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Notes & Next Visit'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Prescription */}
        <div className="col-md-6">
          <div className="card mb-3">
            <div className="card-header bg-warning">
              <h5 className="mb-0">Prescription Management</h5>
            </div>
            <div className="card-body">
              {/* Current Medicines List */}
              <h6>Current Medicines:</h6>
              {medicines.length === 0 ? (
                <p className="text-muted">No medicines prescribed yet</p>
              ) : (
                <div className="mb-3">
                  {medicines.map((med, index) => (
                    <div key={index} className="medicine-item mb-2 p-2 bg-light rounded">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{med.name}</strong>
                          <div className="small text-muted">
                            <span className="badge bg-secondary me-1">{med.type}</span>
                            Dose: {med.dose} | Quantity: {med.quantity}
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRemoveMedicine(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <hr />

              {/* Add New Medicine Form */}
              <h6>Add New Medicine:</h6>
              <div className="row g-2 mb-2">
                <div className="col-12">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Medicine Name"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Dose (e.g., once a day, twice a day)"
                    value={newMedicine.dose}
                    onChange={(e) => setNewMedicine({ ...newMedicine, dose: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <select
                    className="form-select"
                    value={newMedicine.type}
                    onChange={(e) => setNewMedicine({ ...newMedicine, type: e.target.value })}
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Serum">Serum</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Drops">Drops</option>
                  </select>
                </div>
                <div className="col-6">
                  <select
                    className="form-select"
                    value={newMedicine.quantity}
                    onChange={(e) => setNewMedicine({ ...newMedicine, quantity: e.target.value })}
                  >
                    <option value="Full">Full</option>
                    <option value="Half">Half</option>
                    <option value="5ml">5ml</option>
                    <option value="10ml">10ml</option>
                    <option value="15ml">15ml</option>
                    <option value="1 drop">1 drop</option>
                    <option value="2 drops">2 drops</option>
                  </select>
                </div>
              </div>

              <button
                className="btn btn-outline-primary w-100 mb-3"
                onClick={handleAddMedicine}
              >
                + Add Medicine
              </button>

              <button
                className="btn btn-warning w-100"
                onClick={handleSavePrescription}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save All Changes to Prescription'}
              </button>
            </div>
          </div>

          {/* Complete Consultation */}
          <div className="card">
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0">Complete Consultation</h5>
            </div>
            <div className="card-body">
              <p className="mb-2">
                Mark this patient's consultation as completed. This will move them out of the active queue.
              </p>
              <button
                className="btn btn-danger w-100"
                onClick={handleMarkCompleted}
                disabled={loading}
              >
                Mark as Completed
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientView;
