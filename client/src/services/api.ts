import axios, { AxiosResponse } from 'axios';
import { 
  User, 
  Doctor, 
  Appointment, 
  AppointmentWithDetails,
  LoginCredentials, 
  RegisterData, 
  DoctorRegistrationData,
  ApiResponse 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

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
  (response: AxiosResponse) => {
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
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  register: async (userData: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  registerDoctor: async (doctorData: DoctorRegistrationData): Promise<ApiResponse<{ user: User; doctor: Doctor; token: string }>> => {
    try {
      const response = await api.post('/auth/register-doctor', doctorData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Doctor registration failed');
    }
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get user data');
    }
  },
};

// Doctors API
export const doctorsAPI = {
  getAllDoctors: async (): Promise<ApiResponse<(Doctor & { user: User })[]>> => {
    try {
      const response = await api.get('/doctors');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch doctors');
    }
  },

  getDoctorById: async (id: string): Promise<ApiResponse<Doctor & { user: User }>> => {
    try {
      const response = await api.get(`/doctors/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch doctor');
    }
  },

  getDoctorsBySpecialization: async (specialization: string): Promise<ApiResponse<(Doctor & { user: User })[]>> => {
    try {
      const response = await api.get(`/doctors/specialization/${specialization}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch doctors by specialization');
    }
  },

  updateDoctorProfile: async (doctorData: Partial<Doctor>): Promise<ApiResponse<Doctor>> => {
    try {
      const response = await api.put('/doctors/profile', doctorData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update doctor profile');
    }
  },

  updateAvailability: async (availability: any[]): Promise<ApiResponse<Doctor>> => {
    try {
      const response = await api.put('/doctors/availability', { availability });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update availability');
    }
  },
};

// Appointments API
export const appointmentsAPI = {
  createAppointment: async (appointmentData: {
    doctorId: string;
    date: string;
    time: string;
    symptoms: string;
  }): Promise<ApiResponse<Appointment>> => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create appointment');
    }
  },

  getPatientAppointments: async (): Promise<ApiResponse<AppointmentWithDetails[]>> => {
    try {
      const response = await api.get('/appointments/patient');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appointments');
    }
  },

  getDoctorAppointments: async (): Promise<ApiResponse<AppointmentWithDetails[]>> => {
    try {
      const response = await api.get('/appointments/doctor');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appointments');
    }
  },

  updateAppointmentStatus: async (appointmentId: string, status: string, notes?: string): Promise<ApiResponse<Appointment>> => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/status`, { status, notes });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update appointment status');
    }
  },

  cancelAppointment: async (appointmentId: string): Promise<ApiResponse<Appointment>> => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/cancel`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  },

  getAppointmentById: async (appointmentId: string): Promise<ApiResponse<AppointmentWithDetails>> => {
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appointment');
    }
  },
};

export default api;
