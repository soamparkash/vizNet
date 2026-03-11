import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  
  // ✅ SAFEGUARD: Default to empty functions if Context is undefined/loading
  const wishlistContext = useWishlist();
  const toggleWishlist = wishlistContext?.toggleWishlist || (() => {});
  const isInWishlist = wishlistContext?.isInWishlist || (() => false);

  if (!product) return null;

  const productId = product._id || product.id;
  const isWished = isInWishlist(productId);

  const handleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  // Safe Fallbacks
  const image = product.image || 'https://via.placeholder.com/300';
  const name = product.name || 'Unnamed Product';
  const price = product.price || 0;
  const rating = product.rating || 0;
  const reviewCount = (product.reviewsList || product.reviews || []).length;

  return (
    <div className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="relative h-64 bg-gray-100 overflow-hidden">
        <Link to={`/product/${productId}`}>
            <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
        </Link>
        
        {product.customizable && (
          <span className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
            Customizable
          </span>
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition z-10"
        >
          <Heart 
            size={18} 
            className={isWished ? "fill-rose-500 text-rose-500" : "text-gray-400"} 
          />
        </button>
      </div>

      <div className="p-5">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">{product.category || 'Decor'}</p>
        
        <Link to={`/product/${productId}`}>
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-indigo-600 transition">
            {name}
            </h3>
        </Link>
        
        <div className="flex justify-between items-center mt-3">
          <span className="text-xl font-bold text-indigo-600">₹{price}</span>
          <div className="flex items-center gap-1">
            <Star size={16} className="text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{rating}</span>
            <span className="text-xs text-gray-500">({reviewCount})</span>
          </div>
        </div>

        {/* <button 
            onClick={handleAddToCart}
            className="w-full mt-4 bg-gray-100 text-gray-900 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white"
        >
            <ShoppingBag size={16} /> Add to Cart
        </button> */}
      </div>
    </div>
  );
};

export default ProductCard;