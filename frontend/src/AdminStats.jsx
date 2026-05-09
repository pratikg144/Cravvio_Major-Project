import React, { useEffect, useState } from 'react';
import { apiClient } from './config/api';

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiClient.get('/api/admin/stats')
      .then(res => { if (mounted) setStats(res.data); })
      .catch(err => console.error('Failed to load admin stats', err))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-4">Loading stats...</div>;

  return (
    <div className="grid gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <div className="bg-white rounded-xl shadow-md p-4 text-center">
        <div className="text-xs text-gray-500">Total Users</div>
        <div className="text-xl font-bold text-emerald-700">{stats?.totalUsers ?? 0}</div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-4 text-center">
        <div className="text-xs text-gray-500">Active Vendors</div>
        <div className="text-xl font-bold text-emerald-700">{stats?.activeVendors ?? 0}</div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-4 text-center">
        <div className="text-xs text-gray-500">Total Orders</div>
        <div className="text-xl font-bold text-emerald-700">{stats?.totalOrders ?? 0}</div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-4 text-center">
        <div className="text-xs text-gray-500">Revenue</div>
        <div className="text-xl font-bold text-emerald-700">₹{stats?.revenue ?? 0}</div>
      </div>
    </div>
  );
}
