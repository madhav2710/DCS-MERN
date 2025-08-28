export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  _id: string;
  userId: string;
  specialization: string;
  experience: number;
  education: string;
  licenseNumber: string;
  availability: Availability[];
  rating: number;
  totalReviews: number;
  bio: string;
  consultationFee: number;
  createdAt: string;
  updatedAt: string;
}

export interface Availability {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Appointment {
  _id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  symptoms: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentWithDetails extends Appointment {
  patient: User;
  doctor: Doctor & { user: User };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor';
  phone?: string;
}

export interface DoctorRegistrationData extends RegisterData {
  specialization: string;
  experience: number;
  education: string;
  licenseNumber: string;
  bio: string;
  consultationFee: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}
