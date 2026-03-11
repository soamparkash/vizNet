import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProductCard from './ProductCard';

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('viznest_wishlist');
    if (saved) setWishlist(JSON.parse(saved));
  }, []);

  const removeItem = (id) => {
    const updated = wishlist.filter(item => item.id !== id);
    setWishlist(updated);
    localStorage.setItem('viznest_wishlist', JSON.stringify(updated));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Heart className="w-20 h-20 text-rose-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Please sign in to view your wishlist</h2>
          <Link to="/login" className="text-indigo-600 hover:underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Your wishlist is empty</p>
            <Link to="/shop" className="mt-4 inline-block text-indigo-600 hover:underline">Start Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {wishlist.map((product) => (
              <div key={product.id} className="relative">
                <ProductCard product={product} />
                <button
                  onClick={() => removeItem(product.id)}
                  className="absolute top-12 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                >
                  <Trash2 size={18} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;