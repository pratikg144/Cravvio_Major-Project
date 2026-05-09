import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from './config/api';
import CravvioChatbot from './Chatbot';

const Vendor = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        console.log("Fetching vendor profile...");
        const response = await apiClient.get('/api/auth/vendor/profile');
        console.log("Vendor data received:", response.data);
        setVendor(response.data.vendor);
      } catch (err) {
        console.error("Error fetching vendor data:", err);
        if (err.response?.status === 401) {
          // Redirect to login if unauthorized
          setLoading(false);
          navigate("/login");
        } else {
          // Set error message
          setError("Failed to load vendor data");
        }
      } finally {
        // ensure loading is cleared in all cases
        setLoading(false);
      }
    };
    fetchVendorData();
      // fetch vendor orders
      const fetchOrders = async () => {
        try {
          const resp = await apiClient.get('/api/food/orders/vendor');
          setOrders(resp.data.orders || []);
        } catch (e) {
          console.error('Failed to fetch orders', e);
        }
      };
      fetchOrders();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/login");
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await apiClient.put(`/api/food/orders/${orderId}/status`, { status });
      // refresh
      const resp = await apiClient.get('/api/food/orders/vendor');
      setOrders(resp.data.orders || []);
      alert('Order updated');
    } catch (e) {
      console.error('Update order failed', e);
      alert('Failed to update order');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-lime-50 to-lime-100 flex items-center justify-center">
        <p className="text-lg font-semibold text-lime-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-lime-50 to-lime-100 font-poppins text-gray-800">
      {/* Navbar */}
      <nav className="flex flex-wrap items-center justify-between bg-white shadow-md px-4 sm:px-6 py-4">
        <h1 className="text-xl sm:text-2xl font-bold text-lime-700">Cravvio Vendor</h1>
        <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 sm:mt-0">
          <button className="text-lime-700 font-medium hover:text-lime-900 text-xs sm:text-sm">
            Dashboard
          </button>
          <button className="text-lime-700 font-medium hover:text-lime-900 text-xs sm:text-sm">
            Orders
          </button>
          <button
            className="text-red-600 font-semibold hover:text-red-700 text-xs sm:text-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Container */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Welcome */}
        <section className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-1">
            Welcome back, <span className="text-lime-700">{vendor?.CompanyName || "Vendor"}!</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your orders, menu items, sales, and customer feedback.
          </p>
        </section>

        {/* Profile Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap w-full">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-lime-200 flex items-center justify-center text-lime-700 text-2xl sm:text-4xl font-bold flex-shrink-0">
              {vendor?.CompanyName?.charAt(0)?.toUpperCase() || "V"}
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-semibold">{vendor?.CompanyName || "Company"}</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Email: <b>{vendor?.email}</b>
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                Phone: <b>{vendor?.phone}</b>
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                Address: <b>{vendor?.address}</b>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button onClick={() => navigate('/vendor-menu')} className="flex-1 sm:flex-none bg-lime-700 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-lime-800 text-xs sm:text-sm">
              View Menu
            </button>
            <button onClick={() => navigate('/addfood')} className="flex-1 sm:flex-none bg-lime-700 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-lime-800 text-xs sm:text-sm">
              Add Dish
            </button>
            <button className="flex-1 sm:flex-none bg-lime-700 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-lime-800 text-xs sm:text-sm">
              Sales Report
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {[
            { title: "Today's Orders", value: "14" },
            { title: "Revenue", value: "₹3,250" },
            { title: "Active Items", value: "24" },
            { title: "Avg. Rating", value: "4.6⭐" },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white p-3 sm:p-6 rounded-xl shadow-md text-center hover:-translate-y-1 transition"
            >
              <h3 className="text-lime-700 font-medium text-xs sm:text-sm md:text-lg mb-2">
                {stat.title}
              </h3>
              <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <section className="bg-white p-3 sm:p-6 rounded-2xl shadow-md mb-6 sm:mb-8">
          <h3 className="text-lime-700 font-semibold text-sm sm:text-base md:text-xl mb-3">
            Recent Orders
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-lime-700">
                  <th className="p-1 sm:p-2 text-xs sm:text-sm">Order ID</th>
                  <th className="p-1 sm:p-2 text-xs sm:text-sm">Item</th>
                  <th className="p-1 sm:p-2 text-xs sm:text-sm hidden sm:table-cell">Customer</th>
                  <th className="p-1 sm:p-2 text-xs sm:text-sm">Status</th>
                  <th className="p-1 sm:p-2 text-xs sm:text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-2 text-xs sm:text-sm text-gray-500">No orders yet</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="border-b">
                      <td className="p-1 sm:p-2 text-xs sm:text-sm">#{order._id?.slice(-6)}</td>
                      <td className="p-1 sm:p-2 text-xs sm:text-sm">{order.items?.[0]?.name || 'Item'}</td>
                      <td className="p-1 sm:p-2 text-xs sm:text-sm hidden sm:table-cell">{order.userId || 'Customer'}</td>
                      <td className={`p-1 sm:p-2 text-xs sm:text-sm ${order.status === 'pending' ? 'text-orange-500' : order.status === 'paid' ? 'text-green-600' : 'text-gray-600'}`}>
                        {order.status}
                      </td>
                      <td className="p-1 sm:p-2">
                        {order.status !== 'paid' ? (
                          <button onClick={() => updateOrderStatus(order._id, 'paid')} className="bg-lime-700 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-lime-800">
                            Mark Paid
                          </button>
                        ) : (
                          <button className="bg-gray-200 text-gray-700 px-2 sm:px-3 py-1 rounded text-xs" disabled>
                            Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Menu & Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {/* Menu Management */}
          <div className="bg-white p-3 sm:p-6 rounded-2xl shadow-md">
            <h3 className="text-lime-700 text-sm sm:text-base md:text-xl font-semibold mb-3">
              Menu Management
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-lime-700">
                    <th className="p-1 sm:p-2 text-xs sm:text-sm">Dish</th>
                    <th className="p-1 sm:p-2 text-xs sm:text-sm">Price</th>
                    <th className="p-1 sm:p-2 text-xs sm:text-sm hidden sm:table-cell">Availability</th>
                    <th className="p-1 sm:p-2 text-xs sm:text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-1 sm:p-2 text-xs sm:text-sm">Vegan Pasta</td>
                    <td className="p-1 sm:p-2 text-xs sm:text-sm">₹220</td>
                    <td className="p-1 sm:p-2 text-xs sm:text-sm hidden sm:table-cell text-green-600">Available</td>
                    <td className="p-1 sm:p-2">
                      <button className="bg-lime-700 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-lime-800">
                        Edit
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-1 sm:p-2 text-xs sm:text-sm">Protein Shake</td>
                    <td className="p-1 sm:p-2 text-xs sm:text-sm">₹150</td>
                    <td className="p-1 sm:p-2 text-xs sm:text-sm hidden sm:table-cell text-green-600">Available</td>
                    <td className="p-1 sm:p-2">
                      <button className="bg-lime-700 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-lime-800">
                        Edit
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1 sm:p-2 text-xs sm:text-sm">Paneer Wrap</td>
                    <td className="p-1 sm:p-2 text-xs sm:text-sm">₹180</td>
                    <td className="p-1 sm:p-2 text-xs sm:text-sm hidden sm:table-cell text-orange-500">Low Stock</td>
                    <td className="p-1 sm:p-2">
                      <button className="bg-lime-700 text-white px-2 sm:px-3 py-1 rounded text-xs hover:bg-lime-800">
                        Restock
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white p-3 sm:p-6 rounded-2xl shadow-md">
            <h3 className="text-lime-700 text-sm sm:text-base md:text-xl font-semibold mb-3">
              Customer Reviews
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="bg-lime-50 border-l-4 border-lime-700 p-2 sm:p-3 rounded text-xs sm:text-sm">
                ⭐⭐⭐⭐⭐ - "Amazing food quality and fast delivery!"
              </div>
              <div className="bg-lime-50 border-l-4 border-lime-700 p-2 sm:p-3 rounded text-xs sm:text-sm">
                ⭐⭐⭐⭐ - "Loved the healthy options!"
              </div>
              <div className="bg-lime-50 border-l-4 border-lime-700 p-2 sm:p-3 rounded text-xs sm:text-sm">
                ⭐⭐⭐⭐ - "Good, but delivery took time."
              </div>
            </div>
            <button className="bg-lime-700 text-white px-3 sm:px-4 py-2 rounded mt-3 text-xs sm:text-sm hover:bg-lime-800 w-full sm:w-auto">
              View All Reviews
            </button>
          </div>
        </div>

        {/* Sales Performance */}
        <div className="bg-white p-3 sm:p-6 rounded-2xl shadow-md mb-6 sm:mb-8">
          <h3 className="text-lime-700 text-sm sm:text-base md:text-xl font-semibold mb-3">
            Sales Performance
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            Here's how your restaurant performed over the past 7 days.
          </p>
          <div className="h-40 sm:h-52 bg-lime-50 rounded-xl flex items-center justify-center text-lime-700 font-semibold text-xs sm:text-sm">
            [Chart Placeholder — Connect to Chart.js]
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white p-3 sm:p-6 rounded-2xl shadow-md mb-6 sm:mb-8">
          <h3 className="text-lime-700 text-sm sm:text-base md:text-xl font-semibold mb-3">
            Announcements
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="bg-lime-50 border-l-4 border-lime-700 p-2 sm:p-3 rounded text-xs sm:text-sm">
              📢 Upcoming Food Festival partnership available! Register before 25th Oct.
            </div>
            <div className="bg-lime-50 border-l-4 border-lime-700 p-2 sm:p-3 rounded text-xs sm:text-sm">
              💡 Tip: Keep your menu items updated to attract more customers.
            </div>
            <div className="bg-lime-50 border-l-4 border-lime-700 p-2 sm:p-3 rounded text-xs sm:text-sm">
              🧾 New invoice templates added for better reporting.
            </div>
          </div>
        </div>
      </main>

      {/* Chatbot Component */}
      <CravvioChatbot />

      {/* Footer */}
      <footer className="bg-white text-center py-3 sm:py-4 text-gray-600 text-xs sm:text-sm shadow-inner">
        © 2025 Cravvio — Vendor Panel | Manage Smart. Serve Better.
      </footer>
    </div>
  );
};

export default Vendor;


