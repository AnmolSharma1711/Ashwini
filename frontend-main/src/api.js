import axios from "axios";

const API_URL =
	process.env.REACT_APP_API_URL || "https://ashwini-backend.onrender.com";

const api = axios.create({
	baseURL: `${API_URL}/api`,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor to add JWT token and portal source header
api.interceptors.request.use(
	(config) => {
		// Add JWT token from localStorage
		const token = localStorage.getItem('accessToken');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		// Add portal source header for backend RBAC
		config.headers['X-Portal-Source'] = 'frontend-main';

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		const originalRequest = error.config;

		// If error is 401 and we haven't tried to refresh yet
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// Try to refresh the token
				const refreshToken = localStorage.getItem('refreshToken');
				if (refreshToken) {
					const response = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
						refresh: refreshToken
					});

					const { access } = response.data;
					localStorage.setItem('accessToken', access);

					// Retry the original request with new token
					originalRequest.headers.Authorization = `Bearer ${access}`;
					return api(originalRequest);
				}
			} catch (refreshError) {
				// Refresh failed - logout user
				localStorage.removeItem('accessToken');
				localStorage.removeItem('refreshToken');
				localStorage.removeItem('user');
				localStorage.removeItem('userRole');
				localStorage.removeItem('username');
				
				// Redirect to login
				window.location.href = '/login';
				return Promise.reject(refreshError);
			}
		}

		// If error is 403, might be portal access issue
		if (error.response?.status === 403) {
			console.error('Access forbidden:', error.response.data);
		}

		return Promise.reject(error);
	}
);

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
		},
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
