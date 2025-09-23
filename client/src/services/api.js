import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  registerDoctor: async (doctorData) => {
    try {
      const isFormData = typeof FormData !== 'undefined' && doctorData instanceof FormData;
      const response = await api.post('/auth/register-doctor', doctorData, isFormData ? {
        headers: { 'Content-Type': 'multipart/form-data' },
      } : undefined);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Doctor registration failed');
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user data');
    }
  },
};

// Doctors API
export const doctorsAPI = {
  getAllDoctors: async () => {
    try {
      const response = await api.get('/doctors');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch doctors');
    }
  },

  getDoctorById: async (id) => {
    try {
      const response = await api.get(`/doctors/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch doctor');
    }
  },

  getDoctorsBySpecialization: async (specialization) => {
    try {
      const response = await api.get(`/doctors/specialization/${specialization}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch doctors by specialization');
    }
  },

  updateDoctorProfile: async (doctorData) => {
    try {
      const response = await api.put('/doctors/profile', doctorData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update doctor profile');
    }
  },

  updateAvailability: async (availability) => {
    try {
      const response = await api.put('/doctors/availability', { availability });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update availability');
    }
  },

  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.post('/doctors/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// Appointments API
export const appointmentsAPI = {
  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create appointment');
    }
  },

  getPatientAppointments: async () => {
    try {
      const response = await api.get('/appointments/patient');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appointments');
    }
  },

  getDoctorAppointments: async () => {
    try {
      const response = await api.get('/appointments/doctor');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appointments');
    }
  },

  updateAppointmentStatus: async (appointmentId, status, notes) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/status`, { status, notes });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update appointment status');
    }
  },

  cancelAppointment: async (appointmentId) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/cancel`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  },

  getAppointmentById: async (appointmentId) => {
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appointment');
    }
  },

  submitReview: async (appointmentId, { rating, comment }) => {
    const response = await api.post(`/appointments/${appointmentId}/review`, { rating, comment });
    return response.data;
  },
};

// Payments API
export const paymentsAPI = {
  getKey: async () => {
    const response = await api.get('/payment/key');
    return response.data;
  },
  createOrder: async (payload) => {
    const response = await api.post('/payment/orders', payload);
    return response.data;
  },
  verifyPayment: async (payload) => {
    const response = await api.post('/payment/verify', payload);
    return response.data;
  },
};

export default api;
