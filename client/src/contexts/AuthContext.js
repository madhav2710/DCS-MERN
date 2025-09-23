import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const response = await authAPI.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Failed to get current user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Attempting login for:', email);
      const response = await authAPI.login({ email, password });
      console.log('AuthContext: Login response:', response);
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        console.log('AuthContext: Setting user data:', userData);
        setUser(userData);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('AuthContext: Login successful');
      } else {
        console.log('AuthContext: Login failed - no success or data');
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      if (response.success && response.data) {
        const { user: newUser, token } = response.data;
        setUser(newUser);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const registerDoctor = async (doctorData) => {
    try {
      const response = await authAPI.registerDoctor(doctorData);
      if (response.success && response.data) {
        const { user: newUser, token } = response.data;
        setUser(newUser);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));
      } else {
        throw new Error(response.message || 'Doctor registration failed');
      }
    } catch (error) {
      throw new Error(error.message || 'Doctor registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    loading,
    login,
    register,
    registerDoctor,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
