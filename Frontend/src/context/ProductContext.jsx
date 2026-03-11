import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      setError('');
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addReview = async (productId, review) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/products/${productId}/reviews`,
        review,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProducts(); // Refresh
    } catch (err) {
      console.error('Failed to add review:', err);
      throw err;
    }
  };

  // Admin functions
  const addProduct = async (productData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/products', productData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to add product';
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/products/${id}`, productData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || 'Failed to update product';
    }
  };

  const deleteProduct = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
    } catch (err) {
      throw err.response?.data?.message || 'Failed to delete product';
    }
  };

  return (
    <ProductContext.Provider value={{ products, loading, error, addReview, fetchProducts, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);