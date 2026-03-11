import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { OrdersProvider } from './context/OrdersContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';
import LoginSuccess from './pages/LoginSuccess';
import ScrollToTop from './components/ScrollToTop';

// Import your pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProductDetails from './pages/ProductDetails';
import Customizer from './pages/Customizer';
import Admin from './pages/Admin';
import About from './pages/About';
import OrderSuccess from './pages/OrderSuccess';
import WishlistPage from './pages/WishlistPage'; // ✅ THIS WAS MISSING!
import ForgotPassword from './pages/ForgotPassword';

// Import your components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BlogPost from './pages/BlogPost';


function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <NotificationProvider>
          <ProductProvider>
            <CartProvider>
              <OrdersProvider>
                <WishlistProvider>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-grow">
                      <Routes>
                

                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/" element={<Home />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/product/:id" element={<ProductDetails />} />
                        <Route path="/customize/:id" element={<Customizer />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/order-success" element={<OrderSuccess />} />
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/login-success" element={<LoginSuccess />} />
                        <Route path="/blog/:id" element={<BlogPost />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                </WishlistProvider>
              </OrdersProvider>
            </CartProvider>
          </ProductProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;