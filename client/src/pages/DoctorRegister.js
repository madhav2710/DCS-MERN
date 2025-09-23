import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const DoctorRegister = () => {
  const { registerDoctor } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

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

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      let payload;
      if (photoFile) {
        const form = new FormData();
        form.append('name', data.name);
        form.append('email', data.email);
        form.append('password', data.password);
        form.append('phone', data.phone);
        form.append('specialization', data.specialization);
        form.append('experience', String(data.experience));
        form.append('education', data.education);
        form.append('licenseNumber', data.licenseNumber);
        form.append('bio', data.bio);
        form.append('consultationFee', String(data.consultationFee));
        form.append('photo', photoFile);
        payload = form;
      } else {
        payload = {
          name: data.name,
          email: data.email,
          password: data.password,
          role: 'doctor',
          phone: data.phone,
          specialization: data.specialization,
          experience: data.experience,
          education: data.education,
          licenseNumber: data.licenseNumber,
          bio: data.bio,
          consultationFee: data.consultationFee,
        };
      }

      await registerDoctor(payload);
      navigate('/doctor-dashboard');
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Register as a Doctor
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our platform to provide healthcare services to patients
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name', {
                      required: 'Full name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters',
                      },
                    })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Dr. John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="doctor@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[\+]?[1-9][\d]{0,15}$/,
                        message: 'Invalid phone number',
                      },
                    })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="+1234567890"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                    Medical License Number
                  </label>
                  <input
                    id="licenseNumber"
                    type="text"
                    {...register('licenseNumber', {
                      required: 'License number is required',
                    })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.licenseNumber ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="MD123456"
                  />
                  {errors.licenseNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.licenseNumber.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Photo */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Photo (optional)</h3>
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm">No photo</span>
                  )}
                </div>
                <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700">
                  Choose Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files && e.target.files[0];
                      if (!f) return;
                      setPhotoFile(f);
                      setPhotoPreview(URL.createObjectURL(f));
                    }}
                    className="hidden"
                  />
                </label>
                {photoFile && (
                  <button
                    type="button"
                    onClick={() => { setPhotoFile(null); setPhotoPreview(''); }}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">JPEG/PNG/WebP, up to 2MB.</p>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                    Specialization
                  </label>
                  <select
                    id="specialization"
                    {...register('specialization', {
                      required: 'Specialization is required',
                    })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.specialization ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="">Select specialization</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                  {errors.specialization && (
                    <p className="mt-1 text-sm text-red-600">{errors.specialization.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                    Years of Experience
                  </label>
                  <input
                    id="experience"
                    type="number"
                    min="0"
                    max="50"
                    {...register('experience', {
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
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.experience ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="5"
                  />
                  {errors.experience && (
                    <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700">
                    Consultation Fee ($)
                  </label>
                  <input
                    id="consultationFee"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('consultationFee', {
                      required: 'Consultation fee is required',
                      min: {
                        value: 0,
                        message: 'Consultation fee must be at least $0',
                      },
                    })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.consultationFee ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="100.00"
                  />
                  {errors.consultationFee && (
                    <p className="mt-1 text-sm text-red-600">{errors.consultationFee.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                    Education
                  </label>
                  <input
                    id="education"
                    type="text"
                    {...register('education', {
                      required: 'Education is required',
                    })}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.education ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="MBBS, MD in Cardiology"
                  />
                  {errors.education && (
                    <p className="mt-1 text-sm text-red-600">{errors.education.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  {...register('bio', {
                    required: 'Bio is required',
                    minLength: {
                      value: 50,
                      message: 'Bio must be at least 50 characters',
                    },
                  })}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.bio ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Tell us about your medical background, expertise, and approach to patient care..."
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                        },
                      })}
                      className={`mt-1 block w-full px-3 py-2 pr-10 border ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                          value === password || 'Passwords do not match',
                      })}
                      className={`mt-1 block w-full px-3 py-2 pr-10 border ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </a>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Already have an account? Sign in
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Register as Doctor'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegister;
