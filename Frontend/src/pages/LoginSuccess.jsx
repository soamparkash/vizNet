import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginSuccess = () => {
  const { googleLogin } = useAuth(); // We will add this helper to context
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Grab params from the URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userString = params.get('user');

    if (token && userString) {
      try {
        const user = JSON.parse(decodeURIComponent(userString));
        
        // 2. Save to Local Storage manually
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // 3. Update Context State (if your context has a helper for this)
        // Or simple page reload to force context to read localStorage
        window.location.href = "/"; 
        
      } catch (err) {
        console.error("Failed to parse user data", err);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-bold text-gray-700">Finalizing secure login...</h2>
    </div>
  );
};

export default LoginSuccess;