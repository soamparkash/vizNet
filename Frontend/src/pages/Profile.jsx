import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Edit2, MapPin, Phone, Trash2, X, Camera, ChevronDown, ChevronUp, Package, ExternalLink, Calendar, Loader, Download } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // API URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Data State
  const [userData, setUserData] = useState(null);
  const [allOrders, setAllOrders] = useState([]); 
  const [visibleOrders, setVisibleOrders] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const ORDERS_PER_PAGE = 5;

  // UI States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  const [editingAddressId, setEditingAddressId] = useState(null);
  
  // Forms
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', email: '', avatar: null });
  const [addressForm, setAddressForm] = useState({ street: '', city: '', state: '', zip: '', country: '', phone: '', isPrimary: false });
  const [previewAvatar, setPreviewAvatar] = useState(null);

  // --- 1. FETCH DATA ---
  const fetchProfileData = async () => {
    try {
        const token = localStorage.getItem('token');
        if(!token) {
            setLoading(false);
            return;
        }

        const userRes = await fetch(`${API_URL}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!userRes.ok) throw new Error("Failed to fetch profile");
        
        const userData = await userRes.json();
        setUserData(userData);
        setProfileForm({ 
            name: userData.name || '', 
            phone: userData.phone || '', 
            email: userData.email || '',
            avatar: null 
        });
        setPreviewAvatar(null);

        const ordersRes = await fetch(`${API_URL}/api/orders/myorders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            setAllOrders(ordersData);
            setVisibleOrders(ordersData.slice(0, ORDERS_PER_PAGE));
        }

    } catch (err) {
        console.error("Error fetching profile:", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchProfileData();
    } else {
        setLoading(false);
    }
  }, [user]);

  // --- PAGINATION HANDLER ---
  const handleLoadMore = () => {
    const nextPage = page + 1;
    const endIndex = nextPage * ORDERS_PER_PAGE;
    setVisibleOrders(allOrders.slice(0, endIndex));
    setPage(nextPage);
  };

  // --- INVOICE DOWNLOAD HANDLER ---
  const handleDownloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/orders/${orderId}/invoice`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
         const err = await res.json();
         alert(err.message || "Failed to download invoice");
         return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${orderId.slice(-6).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error("Download failed", err);
      alert("Something went wrong downloading the invoice");
    }
  };

  // --- PROFILE UPDATE HANDLER (WITH AVATAR) ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', profileForm.name);
    formData.append('phone', profileForm.phone);
    formData.append('email', profileForm.email);
    
    // Avatar upload - only if file is selected
    if(profileForm.avatar) {
      formData.append('avatar', profileForm.avatar);
    }

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/auth/profile`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            setUserData(data); 
            setIsEditingProfile(false);
            setPreviewAvatar(null);
            setProfileForm({ ...profileForm, avatar: null });
            alert("Profile Updated Successfully!");
            await fetchProfileData();
        } else {
            throw new Error(data.message || "Update failed");
        }
    } catch (err) { 
        console.error(err);
        alert("Failed to update profile: " + err.message);
    }
  };

  // Avatar change handler
  const handleAvatarChange = (e) => {
      const file = e.target.files[0];
      if(file) {
          setProfileForm({ ...profileForm, avatar: file });
          setPreviewAvatar(URL.createObjectURL(file));
      }
  };

  // Prepare edit address
  const handleStartEditAddress = (addr) => {
      setAddressForm({
          street: addr.street,
          city: addr.city,
          state: addr.state,
          zip: addr.zip,
          country: addr.country,
          phone: addr.phone || '',
          isPrimary: addr.isPrimary
      });
      setEditingAddressId(addr._id);
      setShowAddressForm(true);
      setTimeout(() => {
          document.getElementById('address-form')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
  };

  // Cancel edit address
  const handleCancelEditAddress = () => {
      setAddressForm({ street: '', city: '', state: '', zip: '', country: '', phone: '', isPrimary: false });
      setEditingAddressId(null);
      setShowAddressForm(false);
  };

  // Submit address (add or update)
  const handleSaveAddress = async (e) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem('token');
        let url = `${API_URL}/api/auth/address`;
        let method = 'POST';

        if (editingAddressId) {
            url = `${API_URL}/api/auth/address/${editingAddressId}`;
            method = 'PUT';
        }

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(addressForm)
        });

        if(res.ok) {
            await fetchProfileData();
            handleCancelEditAddress(); 
        }
      } catch(err) { console.error(err); }
  };

  const handleDeleteAddress = async (addressId) => {
      if(!window.confirm("Delete this address?")) return;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/auth/address/${addressId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) await fetchProfileData();
      } catch(err) { console.error(err); }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  const sortedAddresses = userData?.addresses?.sort((a, b) => (b.isPrimary === true) - (a.isPrimary === true)) || [];
  const visibleAddresses = showAllAddresses ? sortedAddresses : sortedAddresses.slice(0, 1);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-600 font-bold text-lg"><Loader className="animate-spin mr-2"/> Loading Profile...</div>;
  if (!user || !userData) return <div className="min-h-screen flex items-center justify-center"><Link to="/login" className="text-indigo-600 font-bold underline">Please Login to View Profile</Link></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* PROFILE HEADER CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
           <div className="relative flex flex-col md:flex-row items-end md:items-center gap-6 mt-12 px-2">
              <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-indigo-50 flex items-center justify-center text-4xl font-bold text-indigo-600 overflow-hidden">
                      {userData.avatar ? (
                          <img src={userData.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                          <span>{getInitials(userData.name)}</span>
                      )}
                  </div>
                  <button onClick={() => setIsEditingProfile(true)} className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow border hover:bg-gray-50 text-gray-600 transition hover:text-indigo-600">
                      <Camera size={18} />
                  </button>
              </div>
              <div className="flex-1 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{userData.name}</h1>
                  <p className="text-gray-500 font-medium">{userData.email}</p>
                  {userData.phone && <div className="flex items-center gap-2 text-gray-500 mt-1 text-sm"><Phone size={14}/> {userData.phone}</div>}
                  {userData.isAdmin && <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">ADMINISTRATOR</span>}
              </div>
              <div className="flex gap-3 mb-2">
                  <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 px-5 py-2.5 border rounded-xl hover:bg-gray-50 font-medium text-gray-700 transition"><Edit2 size={16} /> Edit Profile</button>
                  <button onClick={logout} className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 font-medium transition">Logout</button>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- LEFT: ADDRESS BOOK --- */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit sticky top-24">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800"><MapPin size={20} className="text-indigo-600"/> My Addresses</h2>
                        <button onClick={() => { handleCancelEditAddress(); setShowAddressForm(true); }} className="text-indigo-600 text-sm font-bold hover:underline">+ Add New</button>
                    </div>
                    <div className="space-y-4">
                        {visibleAddresses.length > 0 ? visibleAddresses.map((addr) => (
                            <div key={addr._id} className={`p-5 rounded-xl border transition ${addr.isPrimary ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-900">{addr.city}, {addr.zip}</span>
                                            {addr.isPrimary && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold tracking-wide">PRIMARY</span>}
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{addr.street}</p>
                                        <p className="text-sm text-gray-500">{addr.state}, {addr.country}</p>
                                        {addr.phone && <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 font-medium bg-white px-2 py-1 rounded w-fit border"><Phone size={12}/> {addr.phone}</p>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => handleStartEditAddress(addr)} className="text-gray-400 hover:text-indigo-600 p-1 transition bg-gray-50 rounded hover:bg-indigo-50">
                                            <Edit2 size={16}/>
                                        </button>
                                        <button onClick={() => handleDeleteAddress(addr._id)} className="text-gray-400 hover:text-red-500 p-1 transition bg-gray-50 rounded hover:bg-red-50">
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-gray-400 text-sm italic">No addresses saved yet.</div>
                        )}
                        {sortedAddresses.length > 1 && (
                            <button onClick={() => setShowAllAddresses(!showAllAddresses)} className="w-full text-center text-xs text-gray-500 hover:text-indigo-600 flex items-center justify-center gap-1 mt-2 font-medium uppercase tracking-wide">
                                {showAllAddresses ? <>Show Less <ChevronUp size={14}/></> : <>Show All ({sortedAddresses.length}) <ChevronDown size={14}/></>}
                            </button>
                        )}
                    </div>
                    
                    {showAddressForm && (
                        <form id="address-form" onSubmit={handleSaveAddress} className="mt-6 border-t pt-6 space-y-3 animate-in fade-in slide-in-from-top-2">
                            <h3 className="font-bold text-gray-800 text-sm mb-2">{editingAddressId ? 'Edit Address' : 'New Address'}</h3>
                            <input placeholder="Street Address" required className="w-full border p-3 rounded-lg text-sm bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} />
                            <div className="grid grid-cols-2 gap-3">
                                <input placeholder="City" required className="border p-3 rounded-lg text-sm bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                                <input placeholder="State" required className="border p-3 rounded-lg text-sm bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input placeholder="ZIP Code" required className="border p-3 rounded-lg text-sm bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" value={addressForm.zip} onChange={e => setAddressForm({...addressForm, zip: e.target.value})} />
                                <input placeholder="Country" required className="border p-3 rounded-lg text-sm bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" value={addressForm.country} onChange={e => setAddressForm({...addressForm, country: e.target.value})} />
                            </div>
                            <input type="tel" placeholder="Phone Number" required className="w-full border p-3 rounded-lg text-sm bg-gray-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} />
                            <div className="flex items-center gap-2 pt-1">
                                <input type="checkbox" id="primary" checked={addressForm.isPrimary} onChange={e => setAddressForm({...addressForm, isPrimary: e.target.checked})} className="accent-indigo-600 w-4 h-4" />
                                <label htmlFor="primary" className="text-sm text-gray-600 cursor-pointer select-none">Set as Primary Address</label>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                                    {editingAddressId ? 'Update Address' : 'Save Address'}
                                </button>
                                <button type="button" onClick={handleCancelEditAddress} className="px-4 py-3 border rounded-xl text-sm font-bold hover:bg-gray-50">Cancel</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* --- RIGHT: ORDER HISTORY --- */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900"><Package className="text-indigo-600"/> Order History</h2>
                    <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-full border">{allOrders.length} ORDERS</span>
                </div>

                {visibleOrders.length === 0 ? (
                    <div className="bg-white p-16 text-center text-gray-500 rounded-2xl border border-dashed border-gray-300">
                        <Package size={48} className="mx-auto text-gray-300 mb-4"/>
                        <p className="text-lg font-medium text-gray-900 mb-2">No orders placed yet</p>
                        <p className="text-sm text-gray-500 mb-6">Looks like you haven't bought anything yet.</p>
                        <Link to="/shop" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {visibleOrders.map((order) => (
                            <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300">
                                <div className="bg-gray-50/80 p-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                                    <div className="flex gap-8 text-sm">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Order Placed</p>
                                            <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                                                <Calendar size={14} className="text-gray-400"/>
                                                {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Total</p>
                                            <p className="font-bold text-gray-900">₹{order.totalPrice.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 font-mono mb-1">ID: #{order._id.slice(-8).toUpperCase()}</p>
                                        <div className="flex items-center gap-2">
                                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                              order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                              order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                              order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                              'bg-amber-100 text-amber-700'
                                          }`}>
                                              {order.status === 'Processing' && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5 animate-pulse"></span>}
                                              {order.status}
                                          </span>
                                          {order.status === 'Delivered' && (
                                              <button 
                                                  onClick={() => handleDownloadInvoice(order._id)}
                                                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 border border-indigo-200 px-3 py-1 rounded-full hover:bg-indigo-50 transition"
                                                  title="Download Invoice"
                                              >
                                                  <Download size={12} /> PDF
                                              </button>
                                          )}
                                        </div>
                                    </div>
                                </div>

                                <div className="divide-y divide-gray-50">
                                    {order.orderItems.map((item, index) => (
                                        <div key={index} className="p-5 flex gap-5 items-center group">
                                            <Link to={`/product/${item.product}`} className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                                <img 
                                                    src={item.image} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                                                />
                                            </Link>

                                            <div className="flex-1 min-w-0">
                                                <Link to={`/product/${item.product}`} className="font-bold text-gray-900 hover:text-indigo-600 text-base truncate block mb-1">
                                                    {item.name}
                                                </Link>
                                                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                                    {item.selectedColorName && <span className="bg-gray-100 px-2 py-1 rounded border">Color: {item.selectedColorName}</span>}
                                                    {item.selectedMaterial && <span className="bg-gray-100 px-2 py-1 rounded border">Finish: {item.selectedMaterial}</span>}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="font-bold text-gray-900 text-base">₹{item.price.toFixed(2)}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {visibleOrders.length < allOrders.length && (
                            <button 
                                onClick={handleLoadMore} 
                                className="w-full py-4 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                Load More Orders <ChevronDown size={16}/>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* EDIT PROFILE MODAL */}
        {isEditingProfile && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
                    <button onClick={() => setIsEditingProfile(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition"><X size={20}/></button>
                    <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">Update Profile</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-5">
                        <div className="flex justify-center mb-8">
                            <label className="cursor-pointer relative group">
                                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg flex items-center justify-center bg-gray-50 ring-4 ring-indigo-50">
                                    {previewAvatar || userData.avatar ? (
                                        <img src={previewAvatar || userData.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="text-gray-300" size={32}/>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-xs font-bold uppercase tracking-wide">Upload Photo</div>
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </label>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Full Name</label>
                            <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Email Address</label>
                            <input type="email" value={profileForm.email} className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed font-medium" readOnly />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Phone Number</label>
                            <input type="tel" placeholder="+91..." value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium" />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 mt-4 text-lg">Save Changes</button>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Profile;