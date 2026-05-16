import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from './config/api';

export default function ViewPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPage, setUserPage] = useState(1);
  const [vendorPage, setVendorPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, [userPage, vendorPage, userSearch, vendorSearch]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, vendorsRes] = await Promise.all([
        apiClient.get(`/api/user/admin/users?page=${userPage}&search=${userSearch}`),
        apiClient.get(`/api/user/admin/vendors?page=${vendorPage}&search=${vendorSearch}`),
      ]);

      setUsers(usersRes.data.users || []);
      setVendors(vendorsRes.data.vendors || []);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fdf4] p-6 text-gray-800">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-[#6AA200] mb-6">View Users & Vendors</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* USERS SECTION */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-[#6AA200] mb-4">Users ({users.length})</h3>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AA200]"
              />
            </div>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="p-3 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition"
                  >
                    <p className="font-semibold text-gray-800">👤 {user.username}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-600">📞 {user.phone}</p>
                    <p className="text-sm text-gray-600">📍 {user.address}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-4 justify-between">
              <button
                onClick={() => setUserPage(Math.max(1, userPage - 1))}
                disabled={userPage === 1}
                className="px-3 py-2 bg-[#6AA200] text-white rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="py-2">Page {userPage}</span>
              <button
                onClick={() => setUserPage(userPage + 1)}
                className="px-3 py-2 bg-[#6AA200] text-white rounded-lg"
              >
                Next
              </button>
            </div>
          </div>

          {/* VENDORS SECTION */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-[#6AA200] mb-4">Vendors ({vendors.length})</h3>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search vendors..."
                value={vendorSearch}
                onChange={(e) => {
                  setVendorSearch(e.target.value);
                  setVendorPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6AA200]"
              />
            </div>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {vendors.map((vendor) => (
                  <div
                    key={vendor._id}
                    className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition"
                  >
                    <p className="font-semibold text-gray-800">🏪 {vendor.CompanyName}</p>
                    <p className="text-sm text-gray-600">{vendor.email}</p>
                    <p className="text-sm text-gray-600">📞 {vendor.phone}</p>
                    <p className="text-sm text-gray-600">📍 {vendor.address}</p>
                    <p className="text-sm font-semibold mt-2">
                      Status:{" "}
                      <span
                        className={`px-2 py-1 rounded ${
                          vendor.status === "approved"
                            ? "bg-green-200 text-green-800"
                            : vendor.status === "pending"
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {vendor.status || "pending"}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-4 justify-between">
              <button
                onClick={() => setVendorPage(Math.max(1, vendorPage - 1))}
                disabled={vendorPage === 1}
                className="px-3 py-2 bg-[#6AA200] text-white rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="py-2">Page {vendorPage}</span>
              <button
                onClick={() => setVendorPage(vendorPage + 1)}
                className="px-3 py-2 bg-[#6AA200] text-white rounded-lg"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}