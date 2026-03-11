import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. LOAD CART ---
  useEffect(() => {
    const loadCart = async () => {
      if (authLoading) return;

      if (user) {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          const res = await fetch('http://localhost:5000/api/cart', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setCart(data.items || []);
          }
        } catch (err) { console.error("DB Cart Load Error:", err); }
      } else {
        try {
          const saved = localStorage.getItem('viznest_cart');
          if (saved) setCart(JSON.parse(saved));
          else setCart([]);
        } catch (err) { localStorage.removeItem('viznest_cart'); }
      }
      setLoading(false);
    };
    loadCart();
  }, [user, authLoading]);

  // --- 2. SAVE LOCAL CART ---
  useEffect(() => {
    if (!user && !loading) localStorage.setItem('viznest_cart', JSON.stringify(cart));
  }, [cart, user, loading]);

  // --- 3. ADD TO CART ---
  const addToCart = async (product, quantity = 1, customization = null) => {
    // ✅ Include 'mask' in the item payload
    const newItem = {
      product: product._id || product.id,
      name: product.name,
      image: product.image,
      mask: product.mask || product.image, // ✅ Fallback to image if mask missing
      price: customization?.customPrice || product.price,
      qty: quantity,
      selectedColor: customization?.colorHex || null,
      selectedColorName: customization?.colorName || null,
      selectedMaterial: customization?.material || null,
      customization: customization 
    };

    if (user) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/cart', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newItem)
        });

        if (res.ok) {
          const data = await res.json();
          setCart(data.items);
          showNotification("Added to your cart!", "success");
        } else {
          showNotification("Failed to add to cart", "error");
        }
      } catch (err) { console.error("DB Add Error:", err); }
    } else {
      setCart(prev => {
        const existing = prev.find(item => 
            (item.product === newItem.product || item.id === newItem.product) && 
            JSON.stringify(item.customization) === JSON.stringify(customization)
        );

        if (existing) {
          return prev.map(item =>
            (item.product === newItem.product || item.id === newItem.product) && 
            JSON.stringify(item.customization) === JSON.stringify(customization)
              ? { ...item, qty: item.qty + quantity }
              : item
          );
        }
        return [...prev, { ...newItem, id: product.id, cartId: Date.now() }];
      });
      showNotification("Added to cart!", "success");
    }
  };

  // --- 4. REMOVE FROM CART ---
  const removeFromCart = async (cartId) => {
    if (user) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/cart/${cartId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if(res.ok) {
            const data = await res.json();
            setCart(data.items);
            showNotification("Item removed", "success");
        }
      } catch (err) { console.error("DB Remove Error:", err); }
    } else {
      setCart(prev => prev.filter(item => (item.cartId !== cartId && item._id !== cartId)));
      showNotification("Item removed", "success");
    }
  };

  // --- 5. CLEAR CART ---
  const clearCart = async () => {
    if (user) {
      try {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:5000/api/cart', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        setCart([]);
      } catch (err) { console.error(err); }
    } else {
      setCart([]);
      localStorage.removeItem('viznest_cart');
    }
  };

  const safeCart = Array.isArray(cart) ? cart : [];
  const cartTotal = safeCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartCount = safeCart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{
      cart: safeCart, addToCart, removeFromCart, clearCart, cartTotal, cartCount, loading
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);