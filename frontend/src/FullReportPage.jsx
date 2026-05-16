import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from './config/api';

const FullReportPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/user/admin/dashboard/stats');
      setStats(response.data.statistics);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Failed to load statistics");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading report...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fdf4] p-6 text-gray-800">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-[#6AA200] mb-6">System Full Report</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-[#6AA200] font-bold text-sm mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-[#6AA200] font-bold text-sm mb-2">Total Vendors</h3>
              <p className="text-3xl font-bold text-gray-800">{stats.totalVendors}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-[#6AA200] font-bold text-sm mb-2">Approved Vendors</h3>
              <p className="text-3xl font-bold text-green-600">{stats.approvedVendors}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-[#6AA200] font-bold text-sm mb-2">Pending Vendors</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingVendors}</p>
            </div>
          </div>
        )}

        {stats && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-[#6AA200] font-bold text-lg mb-4">Recent Users</h3>
              <div className="space-y-3">
                {stats.recentUsers?.map((user) => (
                  <div key={user._id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="font-semibold text-gray-800">{user.username}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-[#6AA200] font-bold text-lg mb-4">Recent Vendors</h3>
              <div className="space-y-3">
                {stats.recentVendors?.map((vendor) => (
                  <div key={vendor._id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-semibold text-gray-800">{vendor.CompanyName}</p>
                    <p className="text-sm text-gray-600">{vendor.email}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullReportPage;