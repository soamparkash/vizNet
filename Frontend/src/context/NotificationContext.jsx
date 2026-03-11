import React, { createContext, useState, useContext, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  // Auto-hide after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      
      {/* --- NOTIFICATION UI --- */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300 animate-in slide-in-from-bottom-5 border ${
            notification.type === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-white border-red-100 text-red-800'
        }`}>
            {notification.type === 'success' ? (
                <CheckCircle className="text-green-500" size={24} />
            ) : (
                <AlertCircle className="text-red-500" size={24} />
            )}
            
            <span className="font-bold pr-4">{notification.message}</span>
            
            <button onClick={() => setNotification(null)} className="opacity-50 hover:opacity-100 transition">
                <X size={18} />
            </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);