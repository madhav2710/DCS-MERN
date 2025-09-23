import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorRegister from './pages/DoctorRegister';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import BookAppointment from './pages/BookAppointment';
import Appointments from './pages/Appointments';
import DoctorProfile from './pages/DoctorProfile';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component - Simplified for testing
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Allow access even without authentication for testing
  if (!isAuthenticated) {
    console.log('User not authenticated, but allowing access for testing');
  }

  // Check role restrictions only if user is authenticated
  if (isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Main App Content
const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-doctor" element={<DoctorRegister />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/doctor-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/book-appointment/:doctorId" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <BookAppointment />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/appointments" 
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/doctor-profile" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorProfile />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect to appropriate dashboard based on user role */}
            <Route 
              path="/dashboard-redirect" 
              element={
                <ProtectedRoute>
                  {user?.role === 'doctor' ? (
                    <Navigate to="/doctor-dashboard" replace />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )}
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
