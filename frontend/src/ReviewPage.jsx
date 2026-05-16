import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from './config/api';

const ReviewPage = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  const fetchPendingVendors = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/user/admin/vendors?status=pending');
      setVendors(response.data.vendors || []);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Failed to load vendors");
      }
    } finally {
      setLoading(false);
    }
  };

  const approveVendor = async (vendorId) => {
    try {
      await apiClient.put(`/api/user/admin/vendors/${vendorId}/status`, { status: "approved" });
      alert("Vendor approved!");
      fetchPendingVendors();
    } catch (err) {
      alert("Failed to approve vendor");
    }
  };

  const rejectVendor = async (vendorId) => {
    try {
      await apiClient.put(`/api/user/admin/vendors/${vendorId}/status`, { status: "rejected" });
      alert("Vendor rejected!");
      fetchPendingVendors();
    } catch (err) {
      alert("Failed to reject vendor");
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fdf4] p-6 text-gray-800">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-[#6AA200] mb-6">Pending Vendor Approvals</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading vendors...</div>
        ) : vendors.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600">No pending vendors for approval</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow rounded-lg text-sm">
              <thead>
                <tr className="bg-[#f0f6e4] text-[#6AA200]">
                  <th className="p-3 text-left">Vendor Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{vendor.CompanyName}</td>
                    <td className="p-3">{vendor.email}</td>
                    <td className="p-3">{vendor.phone}</td>
                    <td className="p-3 text-yellow-500 font-semibold">{vendor.status || "pending"}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => approveVendor(vendor._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectVendor(vendor._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;