import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ExternalLink } from 'lucide-react';

const Cart = () => {
  const cartContext = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!cartContext) return <div className="p-20 text-center">Loading...</div>;

  const { cart, removeFromCart } = cartContext;
  const safeCart = cart || []; 
  // Calculate total based on qty
  const total = safeCart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);

  const handleCheckout = () => {
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/checkout' } });
    }
  };

  if (safeCart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-100">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <Link to="/shop" className="block w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg mt-6">
            Start Designing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Cart ({safeCart.length})</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {safeCart.map((item) => (
            <div key={item._id || item.cartId} className="p-6 flex flex-col sm:flex-row items-center gap-6">
              
              {/* ✅ CORRECTED IMAGE CONTAINER */}
              <div className="relative w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                 {/* Base Image: Absolute to ensure it fills the box same as the mask */}
                 <img 
                    src={item.image} 
                    alt={item.name} 
                    className="absolute inset-0 w-full h-full object-contain p-1" 
                 />
                 
                 {/* Customization Mask: Perfectly overlaid */}
                 {item.selectedColor && item.mask && (
                   <div 
                    className="absolute inset-0 z-10 mix-blend-multiply pointer-events-none" 
                    style={{ 
                        backgroundColor: item.selectedColor, 
                        maskImage: `url(${item.mask})`, 
                        WebkitMaskImage: `url(${item.mask})`, 
                        maskSize: 'contain',           // ✅ Matches object-contain
                        WebkitMaskSize: 'contain', 
                        maskRepeat: 'no-repeat', 
                        maskPosition: 'center',        // ✅ Matches image center
                        WebkitMaskPosition: 'center',
                        opacity: 0.9 
                    }} 
                   />
                 )}
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                    {item.selectedColorName && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                            Color: <strong>{item.selectedColorName}</strong>
                        </span>
                    )}
                    {item.selectedMaterial && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                            Material: <strong>{item.selectedMaterial}</strong>
                        </span>
                    )}
                </div>
                <p className="text-xs text-gray-400 mt-2">Quantity: {item.qty || 1}</p>
              </div>

              <div className="text-right">
                <p className="font-bold text-xl text-indigo-600">
                    ₹{(item.price * (item.qty || 1)).toFixed(2)}
                </p>
                <button 
                    onClick={() => removeFromCart(item._id || item.cartId)} 
                    className="mt-2 text-sm text-red-500 hover:text-red-700 flex items-center justify-end gap-1 w-full font-medium"
                >
                    <Trash2 size={16}/> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
                <span className="text-gray-500 block text-sm uppercase font-bold tracking-wider">Subtotal</span>
                <span className="text-2xl font-black text-gray-900">₹{total.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ExternalLink size={18}/>
            </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;