import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "https://ashwini-backend.onrender.com";

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

// Report APIs
export const uploadReport = (patientId, formData) => {
	return axios.post(
		`${API_URL}/api/patients/${patientId}/reports/`,
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

export const getPatientReports = (patientId) => {
	return api.get(`/patients/${patientId}/reports/`);
};

export const getLatestReport = (patientId) => {
	return api.get(`/patients/${patientId}/reports/latest/`);
};

export const getReportAnalysis = (reportId) => {
	return api.get(`/reports/${reportId}/analysis/`);
};

export const reanalyzeReport = (reportId) => {
	return api.post(`/reports/${reportId}/reanalyze/`);
};

export default api;
