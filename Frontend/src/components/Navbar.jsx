import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, Heart, LogOut, LayoutDashboard, ClipboardList } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  // Helper to get initials if no profile pic exists
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-gray-900 tracking-tighter flex items-center">
            Viz<span className="text-indigo-600">Nest</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 font-medium transition">Home</Link>
            <Link to="/shop" className="text-gray-700 hover:text-indigo-600 font-medium transition">Shop</Link>
            <Link to="/about" className="text-gray-700 hover:text-indigo-600 font-medium transition">About</Link>
            <Link to="/wishlist" className="text-gray-700 hover:text-indigo-600 font-medium transition flex items-center gap-1">
              <Heart size={18} /> Wishlist
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative">
              <ShoppingBag size={24} className="text-gray-700 hover:text-indigo-600 transition" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 group transition-all"
                >
                  {/* ✅ Profile Picture instead of Icon */}
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-indigo-500 transition-all bg-indigo-50 flex items-center justify-center">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-indigo-600 font-bold text-sm">
                        {getInitials(user.name)}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-700 group-hover:text-indigo-600 font-medium max-w-[100px] truncate">
                    {user.name || user.email.split('@')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                      >
                        <User size={18} />
                        My Profile
                      </Link>
                      
                      

                      {/* ADMIN DASHBOARD - ONLY FOR ADMINS */}
                      {user.isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-indigo-50 text-indigo-600 font-semibold transition border-t border-gray-50"
                        >
                          <LayoutDashboard size={18} />
                          Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-5 py-3 hover:bg-red-50 text-red-600 transition flex items-center gap-3 border-t border-gray-50"
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg overflow-y-auto max-h-[calc(100vh-64px)]">
          <div className="px-4 py-6 space-y-2">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium">Home</Link>
            <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium">Shop</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium">About</Link>
            <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium">Wishlist</Link>
            <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium">
              Cart ({cartCount})
            </Link>

            <div className="pt-4 border-t border-gray-100">
                {user ? (
                <>
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-indigo-50 flex items-center justify-center">
                            {user.avatar ? (
                                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-indigo-600 font-bold">{getInitials(user.name)}</span>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                    </div>
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-indigo-50 transition font-medium">
                    My Profile
                    </Link>
                    {user.isAdmin && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-indigo-600 bg-indigo-50 font-bold">
                        Admin Dashboard
                    </Link>
                    )}
                    <button onClick={handleLogout} className="block w-full text-left text-red-600 px-4 py-3 rounded-xl hover:bg-red-50 transition font-medium mt-2">
                    Logout
                    </button>
                </>
                ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
                    Login
                </Link>
                )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
