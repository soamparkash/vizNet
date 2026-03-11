import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
// Removed hardcoded import: import { products } from '../data/products';

const categories = ["All", "Furniture", "Lighting", "Textiles", "Decor", "Art"];

const Shop = () => {
  // Data States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination State
  const [visibleCount, setVisibleCount] = useState(12);

  // --- FETCH PRODUCTS FROM DB ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error loading shop products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- FILTERING LOGIC ---
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // --- PAGINATION LOGIC ---
  // Only show the number of products defined by visibleCount
  const displayedProducts = filteredProducts.slice(0, visibleCount);

  // Check if there are more products to load
  const hasMore = visibleCount < filteredProducts.length;

  const loadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">Shop Our Collection</h1>

        {/* Filters */}
        <div className="mb-12 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setVisibleCount(12); }} // Reset pagination on filter change
                className={`px-6 py-3 rounded-full font-medium transition ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(12); }} // Reset pagination on search
            className="px-6 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-96"
          />
        </div>

        {/* Loading State */}
        {loading ? (
            <div className="text-center py-20">
                <p className="text-gray-500 text-xl animate-pulse">Loading collection...</p>
            </div>
        ) : (
            <>
                {/* Products Grid */}
                {displayedProducts.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500 text-xl">No products found.</p>
                </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {displayedProducts.map(product => (
                        // Ensure we use _id from MongoDB
                        <ProductCard key={product._id || product.id} product={product} />
                    ))}
                </div>
                )}

                {/* Load More Button */}
                {hasMore && (
                    <div className="mt-16 text-center">
                        <button 
                            onClick={loadMore}
                            className="bg-white border-2 border-gray-200 text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
                        >
                            View More Products
                        </button>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default Shop;