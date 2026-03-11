import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderSuccess = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-lg">
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">Order Placed Successfully!</h1>
        <p className="text-xl text-gray-600 mb-8">
          Thank you for shopping with VizNest. Your order is being prepared with care.
        </p>
        <div className="space-y-4">
          <Link
            to="/shop"
            className="block w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            Continue Shopping
          </Link>
          <Link to="/" className="block text-indigo-600 hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;