import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ReviewSection from '../components/ReviewSection';
import ProductCard from '../components/ProductCard'; 
import { Star, Wand2, ShoppingBag, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // A. Fetch Single Product
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        
        setProduct(data);
        setCurrentImageIndex(0);

        // B. Fetch Related Products
        try {
            const allRes = await fetch('http://localhost:5000/api/products');
            if (allRes.ok) {
                const allData = await allRes.json();
                
                if (Array.isArray(allData)) {
                    const currentIdStr = String(data._id || data.id);
                    
                    const availableProducts = allData.filter(p => String(p._id || p.id) !== currentIdStr);

                    let related = availableProducts.filter(p => 
                        p.category && data.category && 
                        p.category.toLowerCase() === data.category.toLowerCase()
                    );
                    
                    if (related.length < 4) {
                        const others = availableProducts.filter(p => !related.includes(p));
                        related = [...related, ...others];
                    }

                    setRelatedProducts(related.slice(0, 4));
                }
            }
        } catch (relatedErr) {
            console.error("Related fetch error:", relatedErr);
            setRelatedProducts([]); 
        }

      } catch (err) {
        console.error("Error fetching product details:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]); 

  // --- 2. HANDLERS ---
  const handleAddReview = async (reviewData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Please login to write a review");
        navigate('/login');
        return;
      }

      const productId = product._id || product.id;
      const res = await fetch(`http://localhost:5000/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(reviewData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit review');
      
      window.location.reload(); 
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEditReview = async (reviewId, updatedData) => {
    try {
        const token = localStorage.getItem('token');
        const productId = product._id || product.id;
        const res = await fetch(`http://localhost:5000/api/products/${productId}/reviews/${reviewId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(updatedData)
        });

        if (!res.ok) throw new Error('Failed to update review');
        window.location.reload(); 
    } catch (err) {
        alert("Update failed: " + err.message);
    }
  };

  // ✅ NEW: Safe Add to Cart Handler
  const handleAddToCart = () => {
    if (!product) return;
    
    // Normalize ID to ensure CartContext understands it
    const cartItem = {
        ...product,
        id: product._id || product.id
    };

    addToCart(cartItem);
    // alert("Added to cart!"); // Visual feedback
  };

  const handleBuyNow = () => {
    if (!product) return;
    const cartItem = {
        ...product,
        id: product._id || product.id
    };
    addToCart(cartItem);
    navigate('/cart');
  };

  if (loading) return <div className="p-20 text-center text-xl text-gray-500">Loading product details...</div>;
  if (!product) return <div className="p-20 text-center text-2xl text-gray-500">Product not found.</div>;

  const gallery = product.images && product.images.length > 0 ? product.images : [product.image || ''];
  const productId = product._id || product.id;
  const reviewCount = (product.reviewsList || product.reviews || []).length;

  const nextSlide = () => setCurrentImageIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentImageIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));

  return (
    <div className="bg-white overflow-hidden"> 
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* --- SECTION 1: PRODUCT DETAILS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* LEFT: SLIDESHOW */}
          <div className="lg:sticky lg:top-24 h-fit select-none">
            <div className="bg-gray-100 rounded-3xl overflow-hidden aspect-square flex items-center justify-center relative group border border-gray-100">
              <img 
                src={gallery[currentImageIndex]} 
                alt={product.name} 
                className="w-full h-full object-cover transition-all duration-500" 
              />
              {gallery.length > 1 && (
                <>
                  <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full text-gray-800 opacity-0 group-hover:opacity-100 transition"><ChevronLeft size={24}/></button>
                  <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full text-gray-800 opacity-0 group-hover:opacity-100 transition"><ChevronRight size={24}/></button>
                </>
              )}
            </div>
            {gallery.length > 1 && (
               <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                 {gallery.map((img, idx) => (
                    <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${currentImageIndex === idx ? 'border-indigo-600' : 'border-transparent'}`}>
                       <img src={img} className="w-full h-full object-cover" />
                    </button>
                 ))}
               </div>
            )}
          </div>

          {/* RIGHT: INFO */}
          <div>
            <div className="mb-6 border-b border-gray-100 pb-6">
              <p className="text-indigo-600 font-bold text-sm uppercase tracking-wider mb-2">{product.category}</p>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-end gap-4 mt-4">
                <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                {product.rating > 0 ? (
                    <div className="flex items-center gap-1 text-yellow-500 mb-1">
                        <Star size={18} fill="currentColor" />
                        <span className="font-bold text-gray-900 text-lg">{product.rating}</span>
                        <span className="text-sm text-gray-500 ml-1">({reviewCount} reviews)</span>
                    </div>
                ) : (
                    <span className="text-sm text-gray-400 mb-1 pb-1">No reviews yet</span>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-lg leading-relaxed mb-8">{product.description}</p>

            {product.details && product.details.length > 0 && (
              <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">Specifications</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  {product.details.map((detail, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-gray-500">{detail.label}</span>
                      <span className="font-medium text-gray-900">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex gap-4">
                <button onClick={handleBuyNow} className="flex-1 bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"><Zap size={20} /> Buy Now</button>
                {/* ✅ UPDATED BUTTON with explicit handler */}
                <button onClick={handleAddToCart} className="flex-1 bg-gray-100 text-gray-900 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"><ShoppingBag size={20} /> Add to Cart</button>
              </div>
              {product.customizable && (
                <Link to={`/customize/${productId}`} className="w-full border-2 border-dashed border-indigo-200 text-indigo-600 py-3 rounded-xl font-bold text-center hover:bg-indigo-50 transition flex items-center justify-center gap-2">
                  <Wand2 size={18} /> Customize this item
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* --- SECTION 2: RELATED PRODUCTS --- */}
        {relatedProducts.length > 0 && (
          <section className="py-12 border-t border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {relatedProducts.map(p => (
                  <ProductCard key={p._id || p.id} product={p} />
               ))}
            </div>
          </section>
        )}

        {/* --- SECTION 3: REVIEWS --- */}
        <div className="pt-12 border-t border-gray-100">
           <ReviewSection 
             product={product} 
             currentUser={user}
             onSubmitReview={handleAddReview}
             onEditReview={handleEditReview}
           />
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;