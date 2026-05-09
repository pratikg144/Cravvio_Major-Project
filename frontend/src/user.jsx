import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from './config/api';
import CravvioChatbot from './Chatbot';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRecommend, setSelectedRecommend] = useState(null);
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("Fetching user profile...");
        const response = await apiClient.get("/api/auth/user/profile");
        console.log("User data received:", response.data);
        setUser(response.data.user);
        setEditData(response.data.user || {});
        
        // Fetch orders
        const ordersResponse = await apiClient.get('/api/payment/user/orders');
        setOrders(ordersResponse.data.orders || []);

        // Fetch subscriptions
        try {
          const subsResp = await apiClient.get('/api/payment/subscription/user');
          setSubscriptions(subsResp.data.subscriptions || []);
        } catch (sErr) {
          console.warn('Failed to fetch subscriptions', sErr);
        }
        // Fetch menu items for recommendations
        try {
          const menuResp = await apiClient.get('/api/food');
          setMenuItems(menuResp.data.foodItems || menuResp.data.foods || menuResp.data || []);
        } catch (mErr) {
          console.warn('Failed to fetch menu items', mErr);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError("Failed to load user data");
          setLoading(false);
        }
      }
    };
    fetchUserData();
  }, [navigate]);

  // derive active subscription and next delivery from fetched data
  const activeSubscription = subscriptions.find(s => s.status === 'active') || null;
  const upcomingOrder = orders.find(o => o.status && o.status !== 'delivered' && o.status !== 'cancelled') || null;

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/login");
  };

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to persist cart', e);
    }
  }, [cart]);

  const addToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(p => p._id === item._id);
      if (exists) {
        return prev.map(p => p._id === item._id ? { ...p, qty: (p.qty || 1) + 1 } : p);
      }
      return [...prev, { ...item, qty: 1 }];
    });
    alert(`${item.name || item.title || 'Item'} added to cart`);
  };

  const isInCart = (item) => !!cart.find(p => p._id === item._id);

  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const cartTotal = cart.reduce((s, it) => s + (Number(it.price) || 0) * (it.qty || 1), 0);

  // Prepare recommendations: exclude items already in cart; fallback to 3 random if none
  const recommendations = (() => {
    const src = menuItems || [];
    if (src.length === 0) return [];
    const notInCart = src.filter(item => {
      const id = item._id || item.id;
      return !cart.some(c => c._id === id || c.id === id || c.id === item._id || c._id === item.id);
    });
    if (notInCart.length > 0) return shuffleArray(notInCart).slice(0, 6);
    return shuffleArray(src).slice(0, 3);
  })();

  const handleEditClick = () => {
    setEditData(user || {});
    setIsEditing(true);
  };

  const increaseQty = (id) => setCart(prev => prev.map(p => (p._id === id || p.id === id) ? { ...p, qty: (p.qty || 1) + 1 } : p));
  const decreaseQty = (id) => setCart(prev => prev.map(p => (p._id === id || p.id === id) ? { ...p, qty: (p.qty || 1) - 1 } : p).filter(p => (p.qty || 0) > 0));

  const placeOrder = async () => {
    if (cart.length === 0) return alert('Cart is empty');
    try {
      const ordersByVendor = {};
      cart.forEach(item => {
        const vendorId = item.vendorId?._id || item.vendorId || item.vendor || null;
        const vendorName = item.vendorId?.CompanyName || item.vendorName || item.vendor?.CompanyName || '';
        const foodId = item._id || item.id;
        if (!ordersByVendor[vendorId]) {
          ordersByVendor[vendorId] = { vendorId, vendorName, items: [], total: 0 };
        }
        const price = Number(item.price) || Number(item.cost) || 0;
        ordersByVendor[vendorId].items.push({ foodId, name: item.name || item.title || '', price, qty: item.qty || 1 });
        ordersByVendor[vendorId].total += price * (item.qty || 1);
      });

      const createdOrders = [];
      for (const vendorId in ordersByVendor) {
        const order = ordersByVendor[vendorId];
        const res = await apiClient.post('/api/food/order', {
          vendorId: order.vendorId,
          items: order.items,
          total: order.total
        });
        createdOrders.push({ orderId: res.data.order._id, vendorId: order.vendorId, vendorName: order.vendorName, amount: order.total, items: order.items });
      }

      if (createdOrders.length === 1) {
        const single = createdOrders[0];
        navigate('/payments', { state: { orderId: single.orderId, vendorId: single.vendorId, vendorName: single.vendorName, amount: single.amount, items: single.items, totalAmount: cartTotal, itemCount: cart.length } });
      } else {
        navigate('/payments', { state: { orders: createdOrders, totalAmount: cartTotal, itemCount: cart.length } });
      }

      setCart([]);
      setCartOpen(false);
    } catch (err) {
      console.error('Order error', err);
      alert(err.response?.data?.message || 'Failed to place order');
    }
  };

  const handleSaveProfile = async () => {
    try {
      setUpdateLoading(true);
      const response = await apiClient.put('/api/auth/user/profile', {
        username: editData.username,
        email: editData.email,
        phone: editData.phone,
        address: editData.address
      });
      setUser(response.data.user);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Profile update error:', err);
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;
    try {
      await apiClient.put(`/api/payment/subscription/${subscriptionId}/cancel`);
      alert('Subscription cancelled');
      // refresh subscriptions
      const subsResp = await apiClient.get('/api/payment/subscription/user');
      setSubscriptions(subsResp.data.subscriptions || []);
    } catch (err) {
      console.error('Cancel subscription error', err);
      alert(err.response?.data?.message || 'Failed to cancel subscription');
    }
  };

  const handleDeleteSubscription = async (subscriptionId) => {
    if (!confirm('Permanently delete this subscription? This cannot be undone.')) return;
    try {
      await apiClient.delete(`/api/payment/subscription/${subscriptionId}`);
      alert('Subscription deleted');
      const subsResp = await apiClient.get('/api/payment/subscription/user');
      setSubscriptions(subsResp.data.subscriptions || []);
    } catch (err) {
      console.error('Delete subscription error', err);
      alert(err.response?.data?.message || 'Failed to delete subscription');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#f3f8ea] to-[#e9f5d0] flex items-center justify-center">
        <p className="text-lg font-semibold text-[#6AA200]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#f3f8ea] to-[#e9f5d0] text-gray-800 font-poppins">
      {/* Navbar */}
      <nav className="flex flex-col sm:flex-row justify-between items-center bg-white shadow-md px-4 sm:px-10 py-4">
        <h1 className="text-2xl font-semibold text-[#6AA200] cursor-pointer" onClick={() => navigate('/')}>Cravvio</h1>
        <div className="flex flex-wrap gap-2 sm:gap-4 mt-3 sm:mt-0 items-center">
          <button onClick={() => navigate('/')} className="text-[#6AA200] hover:text-[#507a00] text-sm font-medium">Home</button>
          <button onClick={() => navigate('/usermenu')} className="text-[#6AA200] hover:text-[#507a00] text-sm font-medium">Menu</button>
          <button onClick={() => navigate('/FullReportPage')} className="text-[#6AA200] hover:text-[#507a00] text-sm font-medium">About</button>

          {/* Cart button */}
          <button onClick={() => setCartOpen(true)} className="relative px-3 py-1 bg-[#f0f6e4] text-[#6AA200] rounded-md font-medium text-sm">
            🛒 Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{cart.length}</span>
            )}
          </button>

          <button
            className="text-red-600 font-semibold hover:text-red-700 text-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div onClick={() => setCartOpen(false)} className="absolute inset-0 bg-black/40"></div>
          <div className="absolute right-0 top-0 h-full w-[360px] bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-emerald-700">Your Cart</h2>
              <button onClick={() => setCartOpen(false)} className="text-xl">✖</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">Your cart is empty</p>
              ) : (
                cart.map((item) => (
                  <div key={item._id || item.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{item.name || item.title}</h3>
                        <p className="text-xs text-emerald-600 font-medium">{item.vendorId?.CompanyName || item.vendorName || ''}</p>
                        <p className="text-xs text-gray-500 mt-1">₹{item.price} × {item.qty} = ₹{((item.price||0) * (item.qty||1)).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => decreaseQty(item._id || item.id)} className="px-2 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700">-</button>
                      <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                      <button onClick={() => increaseQty(item._id || item.id)} className="px-2 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t">
              <div className="flex justify-between font-bold mb-3">
                <span>Total</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <button onClick={placeOrder} className="w-full bg-gradient-to-br from-lime-500 to-emerald-700 text-white py-2 rounded font-semibold hover:bg-emerald-800 transition">Place Order</button>
            </div>
          </div>
        </div>
      )}

      {/* Container */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-semibold">
            Welcome back, <span className="text-[#6AA200]">{user?.username || "User"}!</span>
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage your meals, subscriptions, and enjoy personalized recommendations.
          </p>
        </div>

        {/* Profile Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-2xl shadow-md p-4 sm:p-6 gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#d6e8b1] flex items-center justify-center text-2xl sm:text-4xl text-[#6AA200] font-bold flex-shrink-0">
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {!isEditing ? (
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold">{user?.username}</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Email: <b>{user?.email}</b>
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Phone: <b>{user?.phone}</b>
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Address: <b>{user?.address || 'N/A'}</b>
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  placeholder="Username"
                  value={editData.username || ''}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                  className="w-full p-2 border border-[#6AA200] rounded-md text-sm"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editData.email || ''}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full p-2 border border-[#6AA200] rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={editData.phone || ''}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full p-2 border border-[#6AA200] rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={editData.address || ''}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  className="w-full p-2 border border-[#6AA200] rounded-md text-sm"
                />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {!isEditing ? (
              <>
                <button onClick={handleEditClick} className="flex-1 sm:flex-none bg-[#6AA200] text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm hover:bg-[#507a00]">
                  Edit Profile
                </button>
                <button className="flex-1 sm:flex-none bg-[#6AA200] text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm hover:bg-[#507a00]">
                  Settings
                </button>
              </>
            ) : (
              <>
                <button onClick={handleSaveProfile} disabled={updateLoading} className="flex-1 sm:flex-none bg-green-600 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm hover:bg-green-700 disabled:opacity-50">
                  {updateLoading ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none bg-gray-400 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm hover:bg-gray-500">
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dashboard */}
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {/* Subscription */}
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 hover:-translate-y-1 transition">
            <h3 className="text-[#6AA200] text-base sm:text-lg font-semibold mb-2">Active Subscription</h3>
            {activeSubscription ? (
              <>
                <p className="text-sm sm:text-base">{activeSubscription.plan} Plan</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Price: <b>₹{activeSubscription.price}</b></p>
                {upcomingOrder ? (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Next delivery: <b>{new Date(upcomingOrder.createdAt || upcomingOrder.deliveryTime).toLocaleString()}</b> from <b>{upcomingOrder.vendorId?.CompanyName || 'Vendor'}</b></p>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Next delivery: <b>Not scheduled</b></p>
                )}
                <button onClick={() => navigate('/usermenu')} className="mt-3 bg-[#6AA200] text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm hover:bg-[#507a00]">Manage Subscription</button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500">You have no active subscription.</p>
                <button onClick={() => navigate('/usermenu')} className="mt-3 bg-[#6AA200] text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm hover:bg-[#507a00]">View Plans</button>
              </>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 hover:-translate-y-1 transition">
            <h3 className="text-[#6AA200] text-base sm:text-lg font-semibold mb-2">Recommended for You</h3>
              {recommendations && recommendations.length > 0 ? (
                recommendations.map((item, i) => (
                  <div key={item._id || i} className="flex justify-between items-center mb-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-3 flex-1 pr-2">
                      <img src={item.image || item.img || item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded" />
                      <div className="truncate">
                        <div className="font-medium">{item.name || item.title || item.foodName}</div>
                        
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-700">₹{item.price || item.cost || ' --'}</div>
                      <button disabled={isInCart(item)} onClick={() => addToCart(item)} className={`px-2 py-1 rounded-md text-xs ${isInCart(item) ? 'bg-gray-300 text-gray-700 cursor-default' : 'bg-[#f0f6e4] text-[#6AA200] hover:bg-[#d7e8b8]'}`}>
                        {isInCart(item) ? 'Added' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500">No recommendations available.</div>
              )}
          </div>

{/* Current Orders */}
<div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 mt-4 hover:-translate-y-1 transition col-span-1 sm:col-span-2 lg:col-span-3">
    <h3 className="text-[#6AA200] text-base sm:text-lg font-semibold mb-2">Current Orders</h3>
      {orders && orders.filter(o => o.status && o.status !== 'delivered' && o.status !== 'cancelled').slice(0,2).length > 0 ? (
          orders.filter(o => o.status && o.status !== 'delivered' && o.status !== 'cancelled').slice(0,2).map((ord) => (
            <div key={ord._id} className="mb-3">
               <p className="text-xs sm:text-sm">{(ord.items || []).map(it => it.name || it.title).join(', ') || 'Items'} - <span className={`${ord.status === 'paid' ? 'text-green-600' : ord.status === 'pending' ? 'text-orange-500' : 'text-gray-600'}`}>{ord.status || 'pending'}</span></p>
               <p className="text-xs text-gray-500">From: <b>{ord.vendorId?.CompanyName || 'Vendor'}</b></p>
            </div>
              ))
            ) : (
              <p className="text-xs sm:text-sm text-gray-500">No active orders at the moment.</p>
            )}
            <button onClick={() => navigate('/ViewPage')} className="mt-3 bg-[#6AA200] text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm hover:bg-[#507a00]">Track Orders</button>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 mt-4 overflow-x-auto">
          <h3 className="text-[#6AA200] text-base sm:text-lg font-semibold mb-3">
            Order History
          </h3>
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-[#6AA200] border-b">
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Items</th>
                <th className="text-left p-2">Restaurant</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Payment</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="border-b">
                    <td className="p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-2">{order.items?.length || 0} items</td>
                    <td className="p-2">{order.vendorId?.CompanyName || 'N/A'}</td>
                    <td className="p-2">₹{order.total || 0}</td>
                    <td className="p-2">
                      <span className={`text-xs font-semibold ${
                        order.status === 'paid' ? 'text-green-600' :
                        order.status === 'pending' ? 'text-orange-500' :
                        'text-gray-600'
                      }`}>
                        {order.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`text-xs font-semibold ${
                        order.paymentStatus === 'completed' ? 'text-green-600' :
                        order.paymentStatus === 'pending' ? 'text-orange-500' :
                        'text-gray-600'
                      }`}>
                        {order.paymentStatus || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Subscriptions */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 mt-6">
          <h3 className="text-[#6AA200] text-base sm:text-lg font-semibold mb-3">My Subscriptions</h3>
          {subscriptions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-3">You have no active subscriptions.</p>
              <button onClick={() => navigate("/usermenu")} className="bg-[#6AA200] text-white px-4 py-2 rounded-md text-sm hover:bg-[#507a00]">
                View Plans
              </button>
            </div>
          ) : (
            <div className="space-y-3">
                      {subscriptions.map((sub) => {
                const startDate = sub.startDate ? new Date(sub.startDate) : null;
                const endDate = sub.endDate ? new Date(sub.endDate) : null;
                const today = new Date();
                const daysRemaining = endDate ? Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)) : 0;
                const statusColor = sub.status === 'active' ? 'text-green-600 bg-green-50' : 
                                   sub.status === 'pending' ? 'text-orange-600 bg-orange-50' :
                                   sub.status === 'cancelled' ? 'text-red-600 bg-red-50' :
                                   'text-gray-600 bg-gray-50';
                
                return (
                  <div key={sub._id} className={`border-2 p-4 rounded-lg flex justify-between items-start sm:items-center gap-4 ${sub.status === 'active' ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50' : 'border-gray-200'}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-lg font-bold text-[#6AA200]">{sub.plan} Plan</div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor}`}>
                          {sub.status?.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-700 space-y-1">
                        <div>📅 Duration: <span className="font-semibold">{sub.months || 1} month{sub.months > 1 ? 's' : ''}</span></div>
                        {startDate && endDate && (
                          <div>
                            🗓️ Valid: <span className="font-semibold">{startDate.toLocaleDateString('en-IN')} to {endDate.toLocaleDateString('en-IN')}</span>
                          </div>
                        )}
                        {sub.status === 'active' && daysRemaining > 0 && (
                          <div className="text-green-600 font-semibold">
                            ⏳ {daysRemaining} day{daysRemaining > 1 ? 's' : ''} remaining
                          </div>
                        )}
                        {sub.status === 'active' && daysRemaining <= 0 && (
                          <div className="text-red-600 font-semibold">
                            ⚠️ Subscription expired
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#6AA200]">₹{sub.price}</div>
                      <div className="text-xs text-gray-500">/month</div>
                      {sub.status === 'active' && (
                        <button onClick={() => alert('Contact support to manage subscription')} className="mt-2 bg-blue-500 text-white text-xs px-3 py-1 rounded hover:bg-blue-600">
                          Manage
                        </button>
                      )}
                      {(sub.status === 'cancelled' || sub.status === 'rejected' || (sub.status === 'active' && daysRemaining <= 0)) && (
                        <button onClick={() => handleDeleteSubscription(sub._id)} className="mt-2 bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700">
                          Delete
                        </button>
                      )}
                      {sub.status === 'pending' && (
                        <div className="flex flex-col items-end gap-2">
                          <button onClick={() => navigate('/payments', { state: { subscription: sub, totalAmount: sub.price } })} className="mt-2 bg-green-600 text-white text-xs px-3 py-1 rounded hover:bg-green-700">
                            Pay ₹{sub.price}
                          </button>
                          <button onClick={() => handleCancelSubscription(sub._id)} className="mt-2 bg-red-500 text-white text-xs px-3 py-1 rounded hover:bg-red-600">
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-md p-5 mt-6">
          <h3 className="text-[#6AA200] text-lg font-semibold mb-3">
            Notifications
          </h3>
          {[
            "🎉 10% off on your next meal plan renewal!",
            "🚚 Your delivery partner is 5 minutes away.",
            "🍴 New “FitFuel” restaurant added near you.",
          ].map((notif, i) => (
            <div
              key={i}
              className="bg-[#f0f6e4] border-l-4 border-[#6AA200] p-2 mb-2 rounded text-sm"
            >
              {notif}
            </div>
          ))}
        </div>

        {/* Feedback */}
        <div className="bg-white rounded-2xl shadow-md p-5 mt-6">
          <h3 className="text-[#6AA200] text-lg font-semibold mb-2">
            Leave Feedback
          </h3>
          <p className="text-gray-600 mb-2 text-sm">
            We value your feedback! Share your thoughts below:
          </p>
          <textarea
            rows="3"
            placeholder="Write your feedback here..."
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-[#6AA200] focus:border-[#6AA200]"
          ></textarea>
          <button className="mt-3 bg-[#6AA200] text-white px-4 py-2 rounded-md text-sm hover:bg-[#507a00]">
            Submit Feedback
          </button>
        </div>

        {/* Browse More */}
        <div className="text-center mt-8">
          <button className="bg-[#6AA200] text-white px-6 py-2 rounded-md text-sm hover:bg-[#507a00]">
            🍽 Browse More Restaurants
          </button>
        </div>
      </div>

      {/* Chatbot Component */}
      <CravvioChatbot />

       {/* -------- FOOTER -------- */}
      <footer className="bg-emerald-900 text-white mt-16 py-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 px-4">
          <div><p className="text-2xl font-extrabold text-emerald-700">© 2027 Cravvio</p></div>
          <div><b>Contact</b><p className="text-sm">623 Harrison St, SF</p></div>
          <div><b>Account</b><p className="text-sm">Create | Login</p></div>
          <div><b>Company</b><p className="text-sm">About | Careers</p></div>
        </div>
      </footer>
    </div>
  );
};

export default UserDashboard;
