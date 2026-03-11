import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, Edit2, X, Package, DollarSign,
  ShoppingCart, Clock, Search, Eye, ArrowLeft, Upload, Images, Minus, Layers, Calendar, Filter, MapPin, Phone, FileText
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart 
} from 'recharts';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000';

const CATEGORIES = [
  "Furniture", "Lighting", "Textiles", "Decor", 
  "Art", "Kitchen", "Office", "Outdoor"
];

const DEFAULT_MATERIALS = [
  { name: 'Standard', price: 0, description: 'Base factory finish' },
  { name: 'Matte', price: 0, description: 'Soft, non-reflective' },
  { name: 'Glossy', price: 0, description: 'High-shine, ceramic look' },
  { name: 'Fabric', price: 0, description: 'Textured woven upholstery' }
];

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [notification, setNotification] = useState({ type: '', message: '' });

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, pendingOrders: 0 });

  const [dateRange, setDateRange] = useState('7');

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', price: '', category: 'Furniture', description: '', customizable: false
  });
  
  const [detailsList, setDetailsList] = useState([{ label: '', value: '' }]);
  const [materialsList, setMaterialsList] = useState(JSON.parse(JSON.stringify(DEFAULT_MATERIALS)));

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [maskFile, setMaskFile] = useState(null);
  const [maskPreview, setMaskPreview] = useState(null);

  const [orderFilter, setOrderFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    if (user && !user.isAdmin) navigate('/');
    if (user && user.isAdmin) {
      fetchProducts();
      fetchOrders();
    }
  }, [user, navigate]);

  useEffect(() => {
    calculateStats();
  }, [orders, products]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to load products');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setOrders(data);
    } catch (err) { console.error(err); }
  };

  const calculateStats = () => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'Processing').length;
    setStats({ totalRevenue, totalOrders: orders.length, totalProducts: products.length, pendingOrders });
  };

  const graphData = useMemo(() => {
    if (!orders.length) return [];
    const now = new Date();
    let filteredOrders = orders;
    if (dateRange !== 'all') {
        const days = parseInt(dateRange);
        const cutoff = new Date();
        cutoff.setDate(now.getDate() - days);
        filteredOrders = orders.filter(o => new Date(o.createdAt) >= cutoff);
    }
    const grouped = {};
    filteredOrders.forEach(order => {
        const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!grouped[date]) {
            grouped[date] = { date, revenue: 0, count: 0 };
        }
        grouped[date].revenue += order.totalPrice;
        grouped[date].count += 1;
    });
    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [orders, dateRange]);

  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...detailsList];
    updatedDetails[index][field] = value;
    setDetailsList(updatedDetails);
  };
  const addDetailField = () => setDetailsList([...detailsList, { label: '', value: '' }]);
  const removeDetailField = (index) => setDetailsList(detailsList.filter((_, i) => i !== index));

  const handleMaterialPriceChange = (index, value) => {
    const updated = [...materialsList];
    updated[index].price = value;
    setMaterialsList(updated);
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) { setGalleryFiles(files); setGalleryPreviews(files.map(file => URL.createObjectURL(file))); }
  };
  const handleMaskChange = (e) => {
    const file = e.target.files[0];
    if (file) { setMaskFile(file); setMaskPreview(URL.createObjectURL(file)); }
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm({ name: '', price: '', category: 'Furniture', description: '', customizable: false });
    setDetailsList([{ label: '', value: '' }]); 
    setMaterialsList(JSON.parse(JSON.stringify(DEFAULT_MATERIALS)));
    setImageFile(null); setImagePreview(null);
    setGalleryFiles([]); setGalleryPreviews([]);
    setMaskFile(null); setMaskPreview(null);
    setShowProductModal(false);
  };

  const startEdit = (product) => {
    setEditingProduct(product._id);
    setProductForm({
      name: product.name, price: product.price, category: product.category,
      description: product.description || '', customizable: product.customizable || false,
    });
    if (product.details && Array.isArray(product.details)) {
      setDetailsList(product.details.length > 0 ? product.details : [{ label: '', value: '' }]);
    } else {
      setDetailsList([{ label: '', value: '' }]);
    }
    const mergedMaterials = DEFAULT_MATERIALS.map(def => {
        const existing = product.materials?.find(m => m.name === def.name);
        return existing ? { ...def, price: existing.price } : def;
    });
    setMaterialsList(mergedMaterials);
    setImagePreview(product.image);
    setGalleryPreviews(product.images || []);
    if (product.mask) setMaskPreview(product.mask);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('price', productForm.price);
      formData.append('category', productForm.category);
      formData.append('description', productForm.description);
      formData.append('customizable', productForm.customizable);
      const validDetails = detailsList.filter(d => d.label && d.value);
      formData.append('details', JSON.stringify(validDetails));
      formData.append('materials', JSON.stringify(materialsList));
      if (imageFile) formData.append('image', imageFile);
      if (maskFile && productForm.customizable) formData.append('mask', maskFile);
      for (let i = 0; i < galleryFiles.length; i++) formData.append('gallery', galleryFiles[i]);
      const url = editingProduct ? `${API_URL}/api/products/${editingProduct}` : `${API_URL}/api/products`;
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Authorization': `Bearer ${token}` }, body: formData
      });
      if (!res.ok) throw new Error('Save failed');
      await fetchProducts();
      resetProductForm();
      showNotification('success', editingProduct ? 'Product updated!' : 'Product added!');
    } catch (err) { alert("Save failed."); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      await fetchProducts();
      showNotification('success', 'Product deleted!');
    } catch (err) { showNotification('error', 'Failed to delete'); }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Update failed');
      await fetchOrders();
      showNotification('success', 'Order status updated!');
    } catch (err) { showNotification('error', 'Failed to update status'); }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = orderFilter === 'All' || order.status === orderFilter;
    const matchesSearch = !searchTerm || order._id.toLowerCase().includes(searchTerm.toLowerCase()) || order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (localStorage.getItem('token') && !user) {
     return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-xl animate-pulse">Loading Dashboard...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {notification.message && <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl text-white font-medium ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{notification.message}</div>}

      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div><h1 className="text-3xl font-bold">Admin Dashboard</h1><p className="text-gray-600">Welcome back, {user?.name}</p></div>
          <button onClick={() => navigate('/')} className="text-indigo-600 flex gap-2 font-medium"><ArrowLeft/> Back</button>
        </div>
      </div>

      <div className="bg-white border-b sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-6 flex gap-10">
            {['overview', 'products', 'orders'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 capitalize font-medium text-lg border-b-4 transition ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600'}`}>{tab}</button>
            ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border"><DollarSign className="w-10 h-10 text-green-600" /><p className="text-gray-600 font-medium">Total Revenue</p><p className="text-3xl font-bold mt-2">₹{stats.totalRevenue.toFixed(2)}</p></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border"><ShoppingCart className="w-10 h-10 text-blue-600" /><p className="text-gray-600 font-medium">Total Orders</p><p className="text-3xl font-bold mt-2">{stats.totalOrders}</p></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border"><Package className="w-10 h-10 text-purple-600" /><p className="text-gray-600 font-medium">Products</p><p className="text-3xl font-bold mt-2">{stats.totalProducts}</p></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border"><Clock className="w-10 h-10 text-orange-600" /><p className="text-gray-600 font-medium">Pending</p><p className="text-3xl font-bold mt-2">{stats.pendingOrders}</p></div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Earnings & Orders Analytics</h2>
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        {['7', '30', '90', 'all'].map(range => (
                            <button key={range} onClick={() => setDateRange(range)} className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${dateRange === range ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{range === 'all' ? 'All Time' : `${range} Days`}</button>
                        ))}
                    </div>
                </div>
                <div className="h-[400px] w-full">
                    {graphData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={graphData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} formatter={(value, name) => [name === 'revenue' ? `₹${value}` : value, name === 'revenue' ? 'Earnings' : 'Orders']} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="revenue" name="Earnings" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                <Line yAxisId="right" type="monotone" dataKey="count" name="Orders" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400"><Calendar size={48} className="mb-2 opacity-50" /><p>No data available for this period.</p></div>
                    )}
                </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Products Management</h2>
              <button onClick={() => { resetProductForm(); setShowProductModal(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-lg hover:bg-indigo-700 font-bold"><Plus size={20} /> Add Product</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
               <table className="w-full text-left text-base">
                  <thead className="bg-gray-50 border-b text-gray-500 font-bold uppercase text-sm">
                      <tr>
                         <th className="p-5">Product</th>
                         <th className="p-5">Category</th>
                         <th className="p-5">Price</th>
                         <th className="p-5">Sold</th>
                         <th className="p-5 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y">
                      {products.map(product => (
                         <tr key={product._id} className="hover:bg-gray-50 transition">
                            <td className="p-5"><div className="flex items-center gap-4"><img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover border" /><span className="font-bold text-gray-800">{product.name}</span></div></td>
                            <td className="p-5 text-gray-600">{product.category}</td>
                            <td className="p-5 font-bold text-gray-900">₹{product.price}</td>
                            <td className="p-5 text-gray-600 font-medium">{product.sold || 0} units</td>
                            <td className="p-5 text-right"><div className="flex justify-end gap-3"><button onClick={() => startEdit(product)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"><Edit2 size={18} /></button><button onClick={() => handleDeleteProduct(product._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"><Trash2 size={18} /></button></div></td>
                         </tr>
                      ))}
                  </tbody>
               </table>
               {products.length === 0 && <div className="p-10 text-center text-gray-500">No products found. Add your first product!</div>}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
           <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
             <div className="p-6 flex gap-4 border-b bg-gray-50 items-center">
                <div className="relative flex-1">
                   <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                   <input type="text" placeholder="Search orders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                   <select value={orderFilter} onChange={e => setOrderFilter(e.target.value)} className="pl-6 pr-8 py-3 border rounded-xl cursor-pointer bg-white font-medium appearance-none hover:border-gray-400 transition focus:ring-2 focus:ring-indigo-500 outline-none">
                       <option value="All">All Status</option>
                       <option value="Processing">Processing</option>
                       <option value="Shipped">Shipped</option>
                       <option value="Delivered">Delivered</option>
                       <option value="Cancelled">Cancelled</option>
                   </select>
                </div>
             </div>
             
             <table className="w-full text-left text-base">
                <thead className="bg-gray-100 border-b font-bold text-gray-600 uppercase tracking-wider text-sm">
                    <tr>
                        <th className="p-5">Image</th>
                        <th className="p-5">Product Details</th>
                        <th className="p-5">Order ID</th>
                        {/* ✅ NEW COLUMN FOR INVOICE */}
                        <th className="p-5">Invoice No</th>
                        <th className="p-5">Customer & Address</th>
                        <th className="p-5">Price</th>
                        <th className="p-5">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map(order => (
                      order.orderItems.map((item, idx) => (
                        <tr key={`${order._id}-${idx}`} className="hover:bg-gray-50 transition">
                            <td className="p-5">
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-white shadow-sm flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-contain p-2" />
                                    {item.selectedColor && item.mask && (
                                        <div 
                                            className="absolute inset-0 mix-blend-multiply pointer-events-none" 
                                            style={{ 
                                                backgroundColor: item.selectedColor, 
                                                maskImage: `url(${item.mask})`, 
                                                WebkitMaskImage: `url(${item.mask})`, 
                                                maskSize: '75%', 
                                                WebkitMaskSize: '75%', 
                                                maskPosition: 'center', 
                                                WebkitMaskPosition: 'center', 
                                                maskRepeat: 'no-repeat' 
                                            }} 
                                        />
                                    )}
                                </div>
                            </td>
                            <td className="p-5">
                                <div className="font-bold text-gray-900 text-lg">{item.name}</div>
                                <div className="text-sm text-gray-500">Qty: {item.qty}</div>
                                {(item.selectedColorName || item.selectedMaterial) && (
                                    <div className="text-xs text-indigo-600 mt-1 font-medium bg-indigo-50 inline-block px-2 py-1 rounded">
                                        {item.selectedColorName ? item.selectedColorName : ''} 
                                        {item.selectedMaterial ? ` • ${item.selectedMaterial}` : ''}
                                    </div>
                                )}
                            </td>
                            <td className="p-5 font-mono text-gray-500 text-sm">
                                #{order._id.slice(-6).toUpperCase()}
                            </td>
                            
                            {/* ✅ INVOICE DATA CELL */}
                            <td className="p-5">
                                {order.status === 'Delivered' ? (
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-indigo-600"/>
                                        <span className="font-mono font-bold text-indigo-700 text-sm">
                                            INV-{order._id.slice(-6).toUpperCase()}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-gray-400 text-sm italic">-</span>
                                )}
                            </td>

                            <td className="p-5 relative">
                                <div className="group relative inline-block cursor-help">
                                    <div className="font-bold text-indigo-600 border-b border-dotted border-indigo-300">
                                      {order.user?.name || "Guest"}
                                    </div>
                                    <div className="text-sm text-gray-500">{order.shippingAddress?.city}</div>
                                    <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-[60] bg-gray-900 text-white p-4 rounded-xl shadow-2xl w-64 text-sm pointer-events-none">
                                        <p className="font-bold border-b border-gray-700 pb-1 mb-2 flex items-center gap-2">
                                            <MapPin size={14} className="text-indigo-400"/> Shipping Details
                                        </p>
                                        <p className="text-gray-300">
                                            {order.shippingAddress?.address}<br/>
                                            {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br/>
                                            {order.shippingAddress?.country}
                                        </p>
                                        {order.shippingAddress?.phone && (
                                            <p className="mt-2 text-indigo-300 font-medium flex items-center gap-1">
                                                <Phone size={12}/> {order.shippingAddress.phone}
                                            </p>
                                        )}
                                        <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-5 font-bold text-gray-900 text-lg">
                                ₹{(item.price * item.qty).toFixed(2)}
                            </td>
                            <td className="p-5">
                                {idx === 0 ? (
                                    <select 
                                        value={order.status} 
                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                        className={`border rounded-lg px-3 py-2 text-sm font-bold cursor-pointer outline-none ${
                                            order.status === 'Delivered' ? 'bg-green-50 text-green-700' :
                                            order.status === 'Processing' ? 'bg-amber-50 text-amber-700' :
                                            order.status === 'Cancelled' ? 'bg-red-50 text-red-700' : 'bg-white'
                                        }`}
                                    >
                                        <option>Processing</option>
                                        <option>Shipped</option>
                                        <option>Delivered</option>
                                        <option>Cancelled</option>
                                    </select>
                                ) : (
                                    <span className="text-gray-300 text-2xl ml-4">”</span>
                                )}
                            </td>
                        </tr>
                      ))
                  ))}
                </tbody>
             </table>
           </div>
        )}

        {showProductModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative">
                <button onClick={resetProductForm} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X /></button>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSaveProduct} className="space-y-5">
                   <div className="grid grid-cols-2 gap-5">
                       <input className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-indigo-500 outline-none font-medium" placeholder="Product Name" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required/>
                       <input className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-indigo-500 outline-none font-medium" type="number" placeholder="Price (₹)" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required/>
                   </div>
                   <select className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white font-medium" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
                   <textarea className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-indigo-500 outline-none font-medium" placeholder="Description" rows="3" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                   <div className="grid grid-cols-2 gap-4">
                       <div className="border-2 border-dashed border-gray-300 p-6 text-center rounded-xl hover:bg-gray-50 transition cursor-pointer relative">
                           <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleMainImageChange} /> 
                           <p className="font-bold text-gray-500">Main Image</p>
                           {imagePreview && <img src={imagePreview} className="h-20 mx-auto mt-2 rounded shadow-sm"/>}
                       </div>
                       <div className="border-2 border-dashed border-gray-300 p-6 text-center rounded-xl hover:bg-gray-50 transition cursor-pointer relative">
                           <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleGalleryChange} /> 
                           <p className="font-bold text-gray-500">Gallery (Max 10)</p>
                           <div className="flex justify-center mt-2 gap-1">{galleryPreviews.slice(0,3).map((s,i)=><img key={i} src={s} className="h-10 w-10 rounded border"/>)}</div>
                       </div>
                   </div>
                   <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                       <div className="flex justify-between items-center mb-3">
                           <label className="font-bold text-gray-700">Specifications (Details)</label>
                           <button type="button" onClick={addDetailField} className="text-indigo-600 font-bold text-sm">+ Add</button>
                       </div>
                       {detailsList.map((detail, index) => (
                           <div key={index} className="flex gap-3 mb-2">
                               <input placeholder="Label (e.g. Color)" className="border p-2 rounded-lg flex-1" value={detail.label} onChange={(e) => handleDetailChange(index, 'label', e.target.value)} />
                               <input placeholder="Value (e.g. Blue)" className="border p-2 rounded-lg flex-1" value={detail.value} onChange={(e) => handleDetailChange(index, 'value', e.target.value)} />
                               <button type="button" onClick={() => removeDetailField(index)} className="text-red-500 font-bold p-2"><Minus size={18}/></button>
                           </div>
                       ))}
                   </div>
                   <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                       <div className="flex items-center gap-2 mb-4">
                           <input type="checkbox" checked={productForm.customizable} onChange={e => setProductForm({...productForm, customizable: e.target.checked})} className="w-5 h-5 accent-purple-600" />
                           <label className="font-bold text-purple-900 text-lg">Enable Customization Studio</label>
                       </div>
                       {productForm.customizable && (
                           <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
                               <div>
                                   <label className="block text-sm font-bold text-purple-800 mb-2">Mask Image (PNG Transparent)</label>
                                   <input type="file" accept="image/*" onChange={handleMaskChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-white file:text-purple-700 hover:file:bg-purple-50 border rounded-full p-1" />
                                   {maskPreview && <img src={maskPreview} className="mt-2 h-20 border rounded bg-white" />}
                               </div>
                               <div className="bg-white p-4 rounded-xl border border-purple-100">
                                   <div className="flex justify-between mb-4"><label className="font-bold text-purple-800 flex items-center gap-2"><Layers size={18}/> Material Pricing</label></div>
                                   <div className="grid grid-cols-12 gap-3 text-xs text-gray-500 font-bold mb-2 uppercase px-1">
                                       <div className="col-span-4">Material Name</div>
                                       <div className="col-span-3">Extra Price (₹)</div>
                                       <div className="col-span-5">Description</div>
                                   </div>
                                   {materialsList.map((m, i) => (
                                       <div key={i} className="grid grid-cols-12 gap-3 items-center mb-2">
                                           <div className="col-span-4 font-bold text-gray-800 bg-gray-50 p-2 rounded border border-gray-100">{m.name}</div>
                                           <div className="col-span-3 relative">
                                               <input type="number" placeholder="0" className="w-full border p-2 rounded pl-6 font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none" value={m.price} onChange={e => handleMaterialPriceChange(i, e.target.value)} />
                                               <span className="absolute left-2 top-2 text-gray-400 font-bold">₹</span>
                                           </div>
                                           <div className="col-span-5 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 italic">{m.description}</div>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       )}
                   </div>
                   <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">Save Product</button>
                </form>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;