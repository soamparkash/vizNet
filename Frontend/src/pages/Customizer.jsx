import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Check, ArrowLeft, ShoppingBag, Info, Sparkles, Layers, Ban } from 'lucide-react';

const Customizer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // Data States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Customization States
  const [color, setColor] = useState(null); // Null = Original
  const [material, setMaterial] = useState('Standard');
  const [viewOriginal, setViewOriginal] = useState(false);

  // 1. Static Colors
  const colors = [
    { name: 'Original', hex: null },
    { name: 'Midnight', hex: '#1e293b' },
    { name: 'Indigo', hex: '#6366f1' },
    { name: 'Rose', hex: '#e11d48' },
    { name: 'Amber', hex: '#d97706' },
    { name: 'Emerald', hex: '#059669' },
    { name: 'Slate', hex: '#64748b' },
  ];

  // 2. Default Materials (Fallback if DB is empty)
  // Prices set to 0 as requested ("if cost not found... show 0")
  const defaultMaterials = [
    { name: 'Standard', price: 0, description: 'Base factory finish' },
    { name: 'Matte', price: 0, description: 'Soft, non-reflective' },
    { name: 'Glossy', price: 0, description: 'High-shine, ceramic look' },
    { name: 'Fabric', price: 0, description: 'Textured woven upholstery' },
  ];

  // 3. Fetch Product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);

        // Determine which materials to use for initial state
        const materialsToUse = (data.materials && data.materials.length > 0) 
            ? data.materials 
            : defaultMaterials;

        setMaterial(materialsToUse[0].name);

      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading Studio...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-xl">Product not found</div>;

  // 4. Determine Active Materials List
  const activeMaterials = (product.materials && product.materials.length > 0) 
    ? product.materials 
    : defaultMaterials;

  // 5. Calculate Costs
  const selectedMatObj = activeMaterials.find(m => m.name === material) || activeMaterials[0];
  const materialCost = selectedMatObj?.price || 0; // ✅ Defaults to 0 if price missing
  const finalPrice = product.price + materialCost;
  const maskUrl = product.mask || product.image;

  // 6. Add to Cart Handler
  const handleAddToCart = () => {
    const isStandard = color === null && materialCost === 0;

    const customizationData = {
        colorName: colors.find(c => c.hex === color)?.name || 'Original',
        colorHex: color || 'transparent',
        material: material,
        customPrice: finalPrice
    };

    addToCart(
      product, 
      1, 
      isStandard ? null : customizationData
    );
    
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-5 h-5 text-gray-600"/>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-xs text-gray-500">Design Studio</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm text-gray-500">Total Estimate</p>
          <p className="text-xl font-bold text-indigo-600">₹{finalPrice.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
        
        {/* VISUALIZER AREA */}
        <div className="flex-1 bg-gray-100 relative overflow-hidden flex items-center justify-center p-4 lg:p-12 min-h-[50vh]">
          
          <div className="relative w-full max-w-lg aspect-square bg-transparent rounded-xl overflow-hidden">
            <img src={product.image} alt="Base Product" className="w-full h-full object-contain relative z-0" />

            {/* Color Overlay */}
            {!viewOriginal && color !== null && (
              <div 
                className="absolute inset-0 z-10 pointer-events-none transition-colors duration-300"
                style={{
                  backgroundColor: color,
                  mixBlendMode: 'multiply', 
                  maskImage: `url(${maskUrl})`,
                  WebkitMaskImage: `url(${maskUrl})`, 
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                  opacity: material === 'Glossy' ? 0.6 : 0.85
                }}
              />
            )}

            {/* Texture Overlay (Fabric) */}
            {!viewOriginal && color !== null && material.toLowerCase().includes('fabric') && (
              <div 
                className="absolute inset-0 z-20 pointer-events-none opacity-30 mix-blend-overlay"
                style={{
                  backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                  backgroundSize: '4px 4px',
                  maskImage: `url(${maskUrl})`,
                  WebkitMaskImage: `url(${maskUrl})`,
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                }}
              />
            )}

            <button 
              onMouseDown={() => setViewOriginal(true)}
              onMouseUp={() => setViewOriginal(false)}
              onMouseLeave={() => setViewOriginal(false)}
              onTouchStart={() => setViewOriginal(true)}
              onTouchEnd={() => setViewOriginal(false)}
              className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition active:scale-95 flex items-center gap-2 z-30"
            >
              <Info size={16}/> Hold to Compare
            </button>
          </div>
        </div>

        {/* CONTROLS AREA */}
        <div className="w-full lg:w-[450px] bg-white border-l border-gray-200 flex flex-col h-auto lg:h-[calc(100vh-80px)] overflow-y-auto">
          
          <div className="p-8 space-y-8 flex-1">
            
            {/* Color Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-gray-900">Choose Tone</h3>
              </div>
              <div className="grid grid-cols-6 gap-3">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.hex)}
                    title={c.name}
                    className={`w-12 h-12 rounded-full shadow-sm relative transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2 flex items-center justify-center 
                      ${color === c.hex ? 'ring-indigo-600 scale-110' : 'ring-transparent'}
                      ${c.hex === null ? 'bg-gray-100 border-2 border-gray-300' : ''}
                    `}
                    style={{ backgroundColor: c.hex || 'transparent' }}
                  >
                    {c.hex === null ? (
                      <Ban size={18} className="text-gray-400" />
                    ) : (
                      color === c.hex && <Check className="w-5 h-5 text-white absolute inset-0 m-auto drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-gray-500">Active: <span className="font-medium text-gray-900">{colors.find(c => c.hex === color)?.name || 'Original'}</span></p>
            </div>

            <hr className="border-gray-100" />

            {/* Material Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-gray-900">Select Finish</h3>
              </div>
              <div className="space-y-3">
                {activeMaterials.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => setMaterial(m.name)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex justify-between items-center group ${
                      material === m.name ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-indigo-200'
                    }`}
                  >
                    <div>
                      <span className={`font-bold block ${material === m.name ? 'text-indigo-900' : 'text-gray-700'}`}>{m.name}</span>
                      <span className="text-xs text-gray-500">{m.description}</span>
                    </div>
                    {/* ✅ Show price only if > 0 */}
                    {m.price > 0 && <span className="text-xs font-bold bg-white px-2 py-1 rounded border border-gray-200 text-indigo-600">+₹{m.price}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border-t border-gray-200 sticky bottom-0 z-40">
             <button 
               onClick={handleAddToCart}
               className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg flex items-center justify-center gap-2"
             >
               <ShoppingBag size={20} /> 
               {color === null && materialCost === 0 
                 ? `Add Standard Item — ₹${product.price}` 
                 : `Add Custom — ₹${finalPrice.toFixed(2)}`
               }
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customizer;