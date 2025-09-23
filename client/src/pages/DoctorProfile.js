import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { doctorsAPI } from '../services/api';
import { 
  UserIcon, 
  AcademicCapIcon, 
  BriefcaseIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const DoctorProfile = () => {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm();

  const {
    register: registerAvailability,
    handleSubmit: handleAvailabilitySubmit,
    formState: { errors: availabilityErrors },
    reset: resetAvailability,
  } = useForm();

  const [availability, setAvailability] = useState([]);

  const specializations = [
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Oncology',
    'Gastroenterology',
    'Endocrinology',
    'Rheumatology',
    'Urology',
    'Gynecology',
    'Ophthalmology',
    'ENT',
    'General Medicine',
    'Emergency Medicine',
    'Anesthesiology',
    'Radiology',
    'Pathology',
    'Other'
  ];

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const res = await doctorsAPI.getAllDoctors();
        if (res.success && res.data) {
          const me = res.data.find(d => d.user?._id === user?._id);
          if (me) {
            setDoctor(me);
            setPhotoPreview(me.photoUrl || '');
            resetProfile({
              specialization: me.specialization || '',
              experience: me.experience || 0,
              education: me.education || '',
              bio: me.bio || '',
              consultationFee: me.consultationFee || 0,
            });
          }
        }

        // Initialize default weekday availability (client-side only UI)
        const initialAvailability = daysOfWeek.map(day => ({
          day,
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day),
        }));
        setAvailability(initialAvailability);

      } catch (error) {
        console.error('Failed to fetch doctor profile:', error);
        setError('Failed to load profile information');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [user, resetProfile]);

  const onProfileSubmit = async (data) => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, you would call the API here
      // await doctorsAPI.updateDoctorProfile(data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Profile updated successfully!');
      setDoctor(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const onAvailabilitySubmit = async (data) => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, you would call the API here
      // await doctorsAPI.updateAvailability(availability);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Availability updated successfully!');
      resetAvailability();
    } catch (error) {
      setError(error.message || 'Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  const updateAvailability = (index, field, value) => {
    const newAvailability = [...availability];
    newAvailability[index] = { ...newAvailability[index], [field]: value };
    setAvailability(newAvailability);
  };

  const onPhotoSelected = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const localUrl = URL.createObjectURL(file);
      setPhotoPreview(localUrl);
      const res = await doctorsAPI.uploadPhoto(file);
      if (res.success && res.data?.photoUrl) {
        setPhotoPreview(res.data.photoUrl);
        setDoctor(prev => prev ? { ...prev, photoUrl: res.data.photoUrl } : prev);
        setSuccess('Profile photo updated');
      } else {
        setError(res.message || 'Failed to upload photo');
      }
    } catch (err) {
      setError(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your professional information and availability</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Photo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Photo</h2>
          <div className="flex items-center space-x-4">
            <div className="h-24 w-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400 text-xl">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-10 w-10" />
              )}
            </div>
            <div>
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700">
                {uploading ? 'Uploading...' : 'Upload Photo'}
                <input type="file" accept="image/*" onChange={onPhotoSelected} className="hidden" />
              </label>
              <p className="text-xs text-gray-500 mt-2">JPEG/PNG/WebP, up to 2MB.</p>
            </div>
          </div>
        </div>
        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Professional Information</h2>
          
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                <BriefcaseIcon className="h-4 w-4 inline mr-1" />
                Specialization
              </label>
              <select
                id="specialization"
                {...registerProfile('specialization', {
                  required: 'Specialization is required',
                })}
                className={`w-full px-3 py-2 border ${
                  profileErrors.specialization ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              >
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              {profileErrors.specialization && (
                <p className="mt-1 text-sm text-red-600">{profileErrors.specialization.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="h-4 w-4 inline mr-1" />
                Years of Experience
              </label>
              <input
                id="experience"
                type="number"
                min="0"
                max="50"
                {...registerProfile('experience', {
                  required: 'Experience is required',
                  min: {
                    value: 0,
                    message: 'Experience must be at least 0 years',
                  },
                  max: {
                    value: 50,
                    message: 'Experience cannot exceed 50 years',
                  },
                })}
                className={`w-full px-3 py-2 border ${
                  profileErrors.experience ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {profileErrors.experience && (
                <p className="mt-1 text-sm text-red-600">{profileErrors.experience.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">
                <AcademicCapIcon className="h-4 w-4 inline mr-1" />
                Education
              </label>
              <input
                id="education"
                type="text"
                {...registerProfile('education', {
                  required: 'Education is required',
                })}
                className={`w-full px-3 py-2 border ${
                  profileErrors.education ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="MBBS, MD in Cardiology"
              />
              {profileErrors.education && (
                <p className="mt-1 text-sm text-red-600">{profileErrors.education.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700 mb-2">
                <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                Consultation Fee ($)
              </label>
              <input
                id="consultationFee"
                type="number"
                min="0"
                step="0.01"
                {...registerProfile('consultationFee', {
                  required: 'Consultation fee is required',
                  min: {
                    value: 0,
                    message: 'Consultation fee must be at least $0',
                  },
                })}
                className={`w-full px-3 py-2 border ${
                  profileErrors.consultationFee ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {profileErrors.consultationFee && (
                <p className="mt-1 text-sm text-red-600">{profileErrors.consultationFee.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                {...registerProfile('bio', {
                  required: 'Bio is required',
                  minLength: {
                    value: 50,
                    message: 'Bio must be at least 50 characters',
                  },
                })}
                className={`w-full px-3 py-2 border ${
                  profileErrors.bio ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Tell us about your medical background, expertise, and approach to patient care..."
              />
              {profileErrors.bio && (
                <p className="mt-1 text-sm text-red-600">{profileErrors.bio.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Save Profile
                </>
              )}
            </button>
          </form>
        </div>

        {/* Availability Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Availability Settings</h2>
          
          <div className="space-y-4">
            {availability.map((day, index) => (
              <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={day.isAvailable}
                      onChange={(e) => updateAvailability(index, 'isAvailable', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-900">{day.day}</span>
                  </label>
                </div>
                
                {day.isAvailable && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <select
                        value={day.startTime}
                        onChange={(e) => updateAvailability(index, 'startTime', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <select
                        value={day.endTime}
                        onChange={(e) => updateAvailability(index, 'endTime', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => onAvailabilitySubmit({})}
            disabled={saving}
            className="w-full mt-6 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              <>
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Save Availability
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
