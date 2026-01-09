import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Patient APIs
export const getPatients = (status = null) => {
  const params = status ? { status } : {};
  return api.get('/patients/', { params });
};

export const getPatient = (id) => {
  return api.get(`/patients/${id}/`);
};

export const updatePatient = (id, patientData) => {
  return api.put(`/patients/${id}/`, patientData);
};

// Prescription APIs
export const getPrescription = (patientId) => {
  return api.get(`/patients/${patientId}/prescription/`);
};

export const updatePrescription = (patientId, prescriptionData) => {
  return api.put(`/patients/${patientId}/prescription/`, prescriptionData);
};

// Measurement APIs
export const getLatestMeasurement = (patientId) => {
  return api.get(`/patients/${patientId}/measurements/latest/`);
};

export const getAllMeasurements = (patientId) => {
  return api.get(`/patients/${patientId}/measurements/`);
};

export default api;
