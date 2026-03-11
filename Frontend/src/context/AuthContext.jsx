// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api';

const debugFetch = async (url, options) => {
  console.log('🔵 Making request to:', url);
  console.log('🔵 Request options:', options);
  
  try {
    const response = await fetch(url, options);
    console.log('✅ Response status:', response.status);
    const data = await response.json();
    console.log('✅ Response data:', data);
    return { response, data };
  } catch (error) {
    console.error('❌ Fetch error:', error);
    throw error;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      
      // Note: We don't log them in yet because they need to verify OTP first
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // ✅ 1. Verify Signup OTP
  const verifyOtp = async (email, otp) => {
    try {
      const { response, data } = await debugFetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) throw new Error(data.message || 'Verification failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setError('');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // ✅ 2. Request Forgot Password OTP
  const forgotPassword = async (email) => {
    try {
      const { response, data } = await debugFetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error(data.message || 'Failed to send reset code');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // ✅ 3. Reset Password with OTP
  const resetPassword = async (email, otp, password) => {
    try {
      const { response, data } = await debugFetch(`${API_URL}/auth/reset-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      });

      if (!response.ok) throw new Error(data.message || 'Password reset failed');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      const { response, data } = await debugFetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setError('');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError('');
  };

  const getToken = () => localStorage.getItem('token');

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    getToken,
    verifyOtp,      // Exported
    forgotPassword, // Exported
    resetPassword,  // Exported
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Create a small component to handle the redirect data
const LoginSuccess = () => {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userData = JSON.parse(params.get('user'));

    if (token && userData) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      // Update your context state here
      window.location.href = "/"; 
    }
  }, []);

  return <div className="text-center p-20">Finishing secure login...</div>;
};