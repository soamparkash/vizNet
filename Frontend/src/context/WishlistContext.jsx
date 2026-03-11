import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const authContext = useAuth();
  const user = authContext ? authContext.user : null;
  
  // ✅ SAFEGUARD: Check if notification context exists
  const notificationContext = useNotification();
  const showNotification = notificationContext ? notificationContext.showNotification : console.log;

  const [wishlist, setWishlist] = useState([]);

  // --- 1. LOAD WISHLIST ---
  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const res = await fetch('http://localhost:5000/api/wishlist', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.ok) {
            const data = await res.json();
            // ✅ SAFEGUARD: Ensure it's an array
            setWishlist(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          console.error("Wishlist load error", err);
          setWishlist([]);
        }
      } else {
        setWishlist([]);
      }
    };
    fetchWishlist();
  }, [user]);

  // --- 2. TOGGLE WISHLIST ---
  const toggleWishlist = async (product) => {
    if (!user) {
      showNotification("Please login to save items", "error");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const productId = product._id || product.id; 

      const exists = wishlist.some(item => (item._id === productId || item.id === productId));
      
      // Optimistic Update
      if (exists) {
        setWishlist(prev => prev.filter(item => (item._id !== productId && item.id !== productId)));
      } else {
        setWishlist(prev => [...prev, product]);
      }

      const res = await fetch('http://localhost:5000/api/wishlist', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      const data = await res.json();
      
      if (res.ok) {
        showNotification(data.message, "success");
      } else {
        showNotification("Failed to update wishlist", "error");
        window.location.reload(); 
      }

    } catch (err) {
      console.error(err);
      showNotification("Server Error", "error");
    }
  };

  // Helper
  const isInWishlist = (productId) => {
    return Array.isArray(wishlist) && wishlist.some(item => (item._id === productId || item.id === productId));
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);