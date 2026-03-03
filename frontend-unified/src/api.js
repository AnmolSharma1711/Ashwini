import axios from 'axios';

// API URL: Use environment variable or fallback to localhost for development
// For production, set REACT_APP_API_URL in your hosting platform
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
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
    config.headers['X-Portal-Source'] = 'frontend-unified';

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
  return api.get('/patients/', { params });
};

export const getPrioritizedPatients = (healthStatus = null) => {
  const params = healthStatus ? { health_status: healthStatus } : {};
  return api.get('/patients/prioritized/', { params });
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

// Report APIs
export const getPatientReports = (patientId) => {
  return api.get(`/patients/${patientId}/reports/`);
};

export const getLatestReport = (patientId) => {
  return api.get(`/patients/${patientId}/reports/latest/`);
};

export const getReportAnalysis = (reportId) => {
  return api.get(`/reports/${reportId}/analysis/`);
};

export default api;
