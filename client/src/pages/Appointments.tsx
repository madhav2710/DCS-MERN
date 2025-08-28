import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentsAPI } from '../services/api';
import { AppointmentWithDetails } from '../types';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const Appointments: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = user?.role === 'doctor' 
          ? await appointmentsAPI.getDoctorAppointments()
          : await appointmentsAPI.getPatientAppointments();
        
        if (response.success && response.data) {
          setAppointments(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user?.role]);

  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = selectedStatus === 'all' || appointment.status === selectedStatus;
    const matchesDate = selectedDate === 'all' || appointment.date === selectedDate;
    return matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'pending': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'cancelled': return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'completed': return <CheckCircleIcon className="h-5 w-5 text-blue-600" />;
      default: return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      await appointmentsAPI.updateAppointmentStatus(appointmentId, newStatus);
      // Refresh appointments
      const response = user?.role === 'doctor' 
        ? await appointmentsAPI.getDoctorAppointments()
        : await appointmentsAPI.getPatientAppointments();
      
      if (response.success && response.data) {
        setAppointments(response.data);
      }
    } catch (error) {
      console.error('Failed to update appointment status:', error);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await appointmentsAPI.cancelAppointment(appointmentId);
      // Refresh appointments
      const response = user?.role === 'doctor' 
        ? await appointmentsAPI.getDoctorAppointments()
        : await appointmentsAPI.getPatientAppointments();
      
      if (response.success && response.data) {
        setAppointments(response.data);
      }
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
    }
  };

  const uniqueDates = Array.from(new Set(appointments.map(apt => apt.date))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-600 mt-2">
          {user?.role === 'doctor' ? 'Manage your patient appointments' : 'View and manage your appointments'}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <select
              id="date-filter"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Dates</option>
              {uniqueDates.map((date) => (
                <option key={date} value={date}>
                  {format(new Date(date), 'MMM dd, yyyy')}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
        </div>
        
        <div className="p-6">
          {filteredAppointments.length > 0 ? (
            <div className="space-y-6">
              {filteredAppointments.map((appointment) => (
                <div key={appointment._id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">
                          {user?.role === 'doctor' 
                            ? appointment.patient.name.charAt(0)
                            : appointment.doctor.user.name.charAt(0)
                          }
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {user?.role === 'doctor' 
                              ? appointment.patient.name
                              : `Dr. ${appointment.doctor.user.name}`
                            }
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {format(new Date(appointment.date), 'EEEE, MMMM dd, yyyy')}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-2" />
                            {appointment.time}
                          </div>
                          {user?.role === 'doctor' && (
                            <div className="flex items-center">
                              <UserIcon className="h-4 w-4 mr-2" />
                              {appointment.patient.phone || 'No phone'}
                            </div>
                          )}
                          {user?.role === 'patient' && (
                            <div className="flex items-center">
                              <span className="text-blue-600 font-medium">
                                ${appointment.doctor.consultationFee}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-1">Symptoms / Reason:</h4>
                          <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                        </div>
                        
                        {appointment.notes && (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-900 mb-1">Doctor's Notes:</h4>
                            <p className="text-sm text-gray-600">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(appointment.status)}
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        {user?.role === 'doctor' && appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        
                        {user?.role === 'doctor' && appointment.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Complete
                          </button>
                        )}
                        
                        {user?.role === 'patient' && (appointment.status === 'pending' || appointment.status === 'confirmed') && (
                          <button
                            onClick={() => handleCancelAppointment(appointment._id)}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 flex items-center"
                          >
                            <TrashIcon className="h-3 w-3 mr-1" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedStatus === 'all' && selectedDate === 'all' 
                  ? 'You have no appointments yet.' 
                  : 'No appointments match your current filters.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
