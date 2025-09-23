import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { doctorsAPI, appointmentsAPI, paymentsAPI, API_ORIGIN } from '../services/api';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  StarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { format, addDays, startOfDay } from 'date-fns';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const REVIEWS_PER_PAGE = 5;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const selectedDate = watch('date');

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) return;
      
      try {
        const response = await doctorsAPI.getDoctorById(doctorId);
        if (response.success && response.data) {
          setDoctor(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch doctor:', error);
        setError('Failed to load doctor information');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  // Generate available dates (next 30 days)
  const generateAvailableDates = () => {
    const dates = [];
    const today = startOfDay(new Date());
    
    for (let i = 1; i <= 30; i++) {
      const date = addDays(today, i);
      dates.push({
        value: format(date, 'yyyy-MM-dd'),
        label: format(date, 'EEEE, MMMM dd, yyyy')
      });
    }
    
    return dates;
  };

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    return slots;
  };

  const onSubmit = async (data) => {
    if (!doctorId) return;

    setSubmitting(true);
    setError('');

    try {
      const appointmentData = {
        doctorId,
        date: data.date,
        time: data.time,
        symptoms: data.symptoms,
      };

      const response = await appointmentsAPI.createAppointment(appointmentData);
      
      if (response.success) {
        // Create order amount in paise (consultationFee is assumed in INR)
        const amountPaise = Math.round(((doctor?.consultationFee || 0)) * 100);
        const orderRes = await paymentsAPI.createOrder({ amount: amountPaise, currency: 'INR' });

        if (!orderRes.success) {
          throw new Error(orderRes.message || 'Failed to create payment order');
        }

        const order = orderRes.data;

        // Load Razorpay checkout script if not present
        const loadScript = () => new Promise((resolve, reject) => {
          if (document.getElementById('razorpay-sdk')) return resolve();
          const script = document.createElement('script');
          script.id = 'razorpay-sdk';
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
          document.body.appendChild(script);
        });

        await loadScript();

        // Get key from env or server
        let keyId = process.env.REACT_APP_RAZORPAY_KEY_ID;
        if (!keyId) {
          try {
            const keyRes = await paymentsAPI.getKey();
            if (keyRes.success && keyRes.data?.key_id) keyId = keyRes.data.key_id;
          } catch {}
        }

        if (!keyId) {
          setError('Razorpay key_id not found. Please set REACT_APP_RAZORPAY_KEY_ID in client .env or configure server key.');
          return;
        }

        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Doctor Consultation',
          description: `Consultation with Dr. ${doctor?.user?.name ?? 'Doctor'}`,
          order_id: order.id,
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone || '',
          },
          theme: { color: '#2563EB' },
          handler: async function (resp) {
            try {
              const verifyRes = await paymentsAPI.verifyPayment({
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
              });

              if (verifyRes.success) {
                setSuccess(true);
                setTimeout(() => navigate('/appointments'), 1500);
              } else {
                setError(verifyRes.message || 'Payment verification failed');
              }
            } catch (e) {
              setError(e.message || 'Payment verification failed');
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setError(response.message || 'Failed to book appointment');
      }
    } catch (error) {
      setError(error.message || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Doctor not found</h1>
          <p className="text-gray-600 mb-6">The doctor you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Appointment Booked Successfully!</h1>
          <p className="text-gray-600 mb-6">Your appointment has been scheduled. You will receive a confirmation shortly.</p>
          <p className="text-sm text-gray-500">Redirecting to appointments page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Doctor Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center mx-auto mb-4">
                {doctor.photoUrl ? (
                  <img src={`${doctor.photoUrl.startsWith('http') ? '' : API_ORIGIN}${doctor.photoUrl}`} alt={doctor.user.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-blue-600 font-bold text-2xl">
                    {doctor.user.name.charAt(0)}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Dr. {doctor.user.name}</h2>
              <p className="text-gray-600">{doctor.specialization}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <StarIcon className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-sm text-gray-600">
                  {doctor.rating} ({doctor.totalReviews} reviews)
                </span>
              </div>

              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{doctor.experience} years experience</span>
              </div>

              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Consultation Fee: ${doctor.consultationFee}</span>
              </div>
            </div>

    {reviewsOpen && doctor && Array.isArray(doctor.reviews) && (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">All Reviews</h3>
            <button onClick={() => setReviewsOpen(false)} className="text-gray-600 hover:text-gray-800">Close</button>
          </div>
          <div className="space-y-4 max-h-[60vh] overflow-auto">
            {doctor.reviews
              .slice((reviewsPage-1)*REVIEWS_PER_PAGE, reviewsPage*REVIEWS_PER_PAGE)
              .map((r, idx) => (
                <div key={`${idx}-${r.patientId?._id || ''}`} className="border border-gray-200 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900">{r.patientId?.name || 'Patient'}</div>
                    <div className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                  </div>
                  {r.comment && <p className="text-sm text-gray-700 mt-1">{r.comment}</p>}
                  {r.createdAt && (
                    <p className="text-xs text-gray-500 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                  )}
                </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setReviewsPage(Math.max(1, reviewsPage-1))}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
              disabled={reviewsPage === 1}
            >
              Previous
            </button>
            <div className="text-sm text-gray-600">
              Page {reviewsPage} of {Math.max(1, Math.ceil(doctor.reviews.length / REVIEWS_PER_PAGE))}
            </div>
            <button
              onClick={() => setReviewsPage(Math.min(Math.ceil(doctor.reviews.length / REVIEWS_PER_PAGE), reviewsPage+1))}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
              disabled={reviewsPage >= Math.ceil(doctor.reviews.length / REVIEWS_PER_PAGE)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    )}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">About</h3>
              <p className="text-sm text-gray-600">{doctor.bio}</p>
            </div>

            {Array.isArray(doctor.reviews) && doctor.reviews.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Recent Reviews</h3>
                <div className="space-y-3">
                  {doctor.reviews.slice(0, 3).map((r, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{r.patientId?.name || 'Patient'}</span>
                        <span className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                      </div>
                      {r.comment && <p className="text-gray-600">{r.comment}</p>}
                    </div>
                  ))}
                </div>
                {doctor.reviews.length > 3 && (
                  <button
                    type="button"
                    onClick={() => { setReviewsOpen(true); setReviewsPage(1); }}
                    className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    See all {doctor.reviews.length} reviews
                  </button>
                )}
              </div>
            )}

            <div className="mt-4">
              <h3 className="font-medium text-gray-900 mb-2">Education</h3>
              <p className="text-sm text-gray-600">{doctor.education}</p>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule Your Appointment</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon className="h-4 w-4 inline mr-1" />
                    Appointment Date
                  </label>
                  <select
                    id="date"
                    {...register('date', {
                      required: 'Please select a date',
                    })}
                    className={`w-full px-3 py-2 border ${
                      errors.date ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="">Select a date</option>
                    {generateAvailableDates().map((date) => (
                      <option key={date.value} value={date.value}>
                        {date.label}
                      </option>
                    ))}
                  </select>
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                    <ClockIcon className="h-4 w-4 inline mr-1" />
                    Appointment Time
                  </label>
                  <select
                    id="time"
                    {...register('time', {
                      required: 'Please select a time',
                    })}
                    className={`w-full px-3 py-2 border ${
                      errors.time ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="">Select a time</option>
                    {generateTimeSlots().map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  {errors.time && (
                    <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms / Reason for Visit
                </label>
                <textarea
                  id="symptoms"
                  rows={4}
                  {...register('symptoms', {
                    required: 'Please describe your symptoms or reason for visit',
                    minLength: {
                      value: 10,
                      message: 'Please provide more details (at least 10 characters)',
                    },
                  })}
                  className={`w-full px-3 py-2 border ${
                    errors.symptoms ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Please describe your symptoms, concerns, or reason for the appointment..."
                />
                {errors.symptoms && (
                  <p className="mt-1 text-sm text-red-600">{errors.symptoms.message}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-medium text-blue-900 mb-2">Important Information</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Please arrive 10 minutes before your scheduled appointment time</li>
                  <li>• Bring any relevant medical records or test results</li>
                  <li>• You may cancel or reschedule up to 24 hours before the appointment</li>
                  <li>• Consultation fee of ${doctor.consultationFee} will be charged</li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Booking...
                    </div>
                  ) : (
                    'Book Appointment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
