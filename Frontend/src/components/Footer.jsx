import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Section */}
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tighter mb-4">
              Viz<span className="text-indigo-500">Nest</span>
            </h2>
            <p className="text-sm leading-relaxed text-gray-400">
              Curating timeless pieces for spaces that feel like home.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-white font-bold mb-6">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/shop" className="hover:text-indigo-400 transition">Furniture</Link></li>
              <li><Link to="/shop" className="hover:text-indigo-400 transition">Lighting</Link></li>
              <li><Link to="/shop" className="hover:text-indigo-400 transition">Decor</Link></li>
              <li><Link to="/shop" className="hover:text-indigo-400 transition">Textiles</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-bold mb-6">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-indigo-400 transition">About Us</Link></li>
              <li><Link to="/blog/1" className="hover:text-indigo-400 transition">Blog</Link></li>
              {/* Sustainability Link Removed */}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-white font-bold mb-6">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <a href="mailto:hello@viznest.com" className="hover:text-indigo-400">hello@viznest.com</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                {/* Updated Address */}
                <span>Lovely Professional University</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          © 2025 VizNest. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;