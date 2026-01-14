import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({
	baseURL: `${API_URL}/api`,
	headers: {
		"Content-Type": "application/json",
	},
});

// Patient APIs
export const getPatients = (status = null) => {
	const params = status ? { status } : {};
	return api.get("/patients/", { params });
};

export const getPatient = (id) => {
	return api.get(`/patients/${id}/`);
};

export const createPatient = (patientData) => {
	return api.post("/patients/", patientData);
};

export const updatePatient = (id, patientData) => {
	return api.put(`/patients/${id}/`, patientData);
};

export const deletePatient = (id) => {
	return api.delete(`/patients/${id}/`);
};

// Measurement APIs
export const getLatestMeasurement = (patientId) => {
	return api.get(`/patients/${patientId}/measurements/latest/`);
};

export const getAllMeasurements = (patientId) => {
	return api.get(`/patients/${patientId}/measurements/`);
};

export const createMeasurement = (patientId, measurementData) => {
	return api.post(`/patients/${patientId}/measurements/`, measurementData);
};

// Prescription APIs
export const getPrescription = (patientId) => {
	return api.get(`/patients/${patientId}/prescription/`);
};

export const updatePrescription = (patientId, prescriptionData) => {
	return api.put(`/patients/${patientId}/prescription/`, prescriptionData);
};

// IoT Device APIs
export const createMeasurementSession = (patientId, deviceId) => {
	return api.post("/measurement-sessions/", {
		patient: patientId,
		device: deviceId,
	});
};

export default api;
