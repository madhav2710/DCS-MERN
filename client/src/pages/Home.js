import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doctorsAPI, API_ORIGIN } from '../services/api';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon, 
  ShieldCheckIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await doctorsAPI.getAllDoctors();
        if (response.success && response.data) {
          setDoctors(response.data.slice(0, 6)); // Show only 6 doctors
        }
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const specializations = [
    'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 
    'Pediatrics', 'Psychiatry', 'Oncology', 'Gastroenterology'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Book Your Doctor Appointment
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Connect with the best doctors in your area. Quick, easy, and secure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition duration-300"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to={user?.role === 'doctor' ? '/doctor-dashboard' : '/dashboard'}
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose DocApp?
            </h2>
            <p className="text-lg text-gray-600">
              We make healthcare accessible and convenient for everyone
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">
                Book appointments with just a few clicks. No more waiting on hold.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Availability</h3>
              <p className="text-gray-600">
                Book appointments anytime, anywhere. Your health doesn't wait.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Your health information is protected with the highest security standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Find Doctors by Specialization
            </h2>
            <p className="text-lg text-gray-600">
              Connect with specialists in various medical fields
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specializations.map((specialization) => (
              <div
                key={specialization}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 cursor-pointer border border-gray-200"
              >
                <div className="text-center">
                  <UserGroupIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">{specialization}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Doctors
            </h2>
            <p className="text-lg text-gray-600">
              Meet our top-rated healthcare professionals
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.filter(doctor => doctor && doctor.user).map((doctor) => (
                <div
                  key={doctor._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                        {doctor.photoUrl ? (
                          <img src={`${doctor.photoUrl.startsWith('http') ? '' : API_ORIGIN}${doctor.photoUrl}`} alt={doctor.user?.name || 'Doctor'} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-blue-600 font-bold text-xl">
                            {doctor.user?.name?.charAt(0) || 'D'}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Dr. {doctor.user?.name || 'Unknown'}
                        </h3>
                        <p className="text-gray-600">{doctor.specialization || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        <StarIcon className="h-5 w-5 text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-600">
                          {doctor.rating} ({doctor.totalReviews} reviews)
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">
                      {doctor.bio ? doctor.bio.substring(0, 100) + '...' : 'No bio available'}
                    </p>

                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 font-semibold">
                        ${doctor.consultationFee}
                      </span>
                      {isAuthenticated && user?.role === 'patient' && (
                        <Link
                          to={`/book-appointment/${doctor._id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-300 flex items-center"
                        >
                          Book Now
                          <ArrowRightIcon className="h-4 w-4 ml-1" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && doctors.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No doctors available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of patients who trust DocApp for their healthcare needs
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
            >
              Create Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
