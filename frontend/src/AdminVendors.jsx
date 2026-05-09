import React, { useEffect, useState } from 'react';
import { apiClient } from './config/api';

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/user/admin/vendors?limit=500');
      const list = res.data.vendors || res.data.data || [];
      const normalized = list.map(v => ({ ...v, status: (v.status || '').toLowerCase() }));
      setVendors(normalized);
    } catch (err) {
      console.error('Failed to fetch vendors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await apiClient.put(`/api/user/admin/vendors/${id}/status`, { status });
      fetchVendors();
    } catch (err) {
      console.error('Failed to update vendor', err);
      alert('Failed to update vendor status');
    }
  };

  return (
    <div>
      <h3 className="text-[#6AA200] text-sm sm:text-base md:text-lg font-semibold mb-4">Vendors</h3>
      {loading ? <div>Loading vendors...</div> : (
        <div className="bg-white rounded-2xl shadow-md p-3 sm:p-5 overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-[#6AA200] border-b">
                <th className="p-2 text-left">Company</th>
                <th className="p-2 text-left">Contact</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(v => (
                <tr key={v._id} className="border-b">
                  <td className="p-2">{v.CompanyName || v.name}</td>
                  <td className="p-2">{v.email || v.phone || 'N/A'}</td>
                  <td className="p-2">{v.status}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <select defaultValue={v.status} onChange={(e) => updateStatus(v._id, e.target.value)} className="text-xs p-1 border rounded">
                        <option value="approved">approved</option>
                        <option value="rejected">rejected</option>
                        <option value="suspended">suspended</option>
                      </select>
                      <button onClick={() => window.alert(JSON.stringify(v, null, 2))} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
