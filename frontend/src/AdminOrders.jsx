import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from './config/api';
import { jsPDF } from 'jspdf';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('auth');
    navigate('/login');
  };
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (p = 1) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/admin/orders?page=${p}&limit=${limit}`);
      setOrders(res.data.orders || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || p);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(1); }, []);

  function generatePdf() {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Orders Full Report', 14, 20);
    doc.setFontSize(10);
    let y = 30;
    orders.forEach((o, idx) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${idx + 1}. Order ID: ${o._id}`, 14, y); y += 6;
      doc.text(`   User: ${o.userId?.username || o.userId?.email || 'N/A'}`, 14, y); y += 6;
      doc.text(`   Vendor: ${o.vendorId?.CompanyName || 'N/A'}`, 14, y); y += 6;
      doc.text(`   Total: ₹${o.total || 0}`, 14, y); y += 6;
      doc.text(`   Status: ${o.status || 'N/A'}`, 14, y); y += 6;
      doc.text(`   Created: ${o.createdAt ? new Date(o.createdAt).toLocaleString() : (o.updatedAt ? new Date(o.updatedAt).toLocaleString() : 'N/A')}`, 14, y); y += 8;
    });
    doc.save('orders-full-report.pdf');
  }

  const updateStatus = async (id, status) => {
    try {
      await apiClient.put(`/api/admin/orders/${id}/status`, { status });
      fetchOrders(page);
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update order status');
    }
  };

  return (
    <div  className='min-h-screen bg-gradient-to-r from-[#f3f8ea] to-[#e9f5d0] text-gray-800 font-poppins'>
     <nav className="bg-white rounded-2xl shadow-md p-3 sm:p-5 overflow-x-auto flex items-center mb-6">
  
  <div className="ml-auto">
    <button
      onClick={generatePdf}
      className="bg-gradient-to-r from-[#f3f8ea] to-[#e9f5d0] text-center w-48 rounded-2xl h-14 relative text-black text-xl font-semibold group"
      type="button"
    >
      <div
        className="bg-[#6AA200] rounded-xl h-12 w-1/4 flex items-center justify-center absolute left-1 top-[2px] group-hover:w-[92px] z-10 duration-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="25"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3v12"></path>
          <path d="M7 10l5 5 5-5"></path>
          <path d="M5 21h14"></path>
        </svg>
      </div>

      <p className="translate-x-2">Full Report</p>
    </button>
  </div>

</nav>

      {loading ? (
        <div>Loading orders...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-3 sm:p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-[#6AA200] border-b">
                  <th className="text-left p-2">Order ID</th>
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Vendor</th>
                  <th className="text-left p-2">Total</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id} className="border-b">
                    <td className="p-2">{o._id}</td>
                    <td className="p-2">{o.userId?.username || o.userId?.email || 'N/A'}</td>
                    <td className="p-2">{o.vendorId?.CompanyName || 'N/A'}</td>
                    <td className="p-2">₹{o.total || 0}</td>
                    <td className="p-2">{o.status}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <select defaultValue={o.status} onChange={(e) => updateStatus(o._id, e.target.value)} className="text-xs p-1 border rounded">
                          <option value="pending">pending</option>
                          <option value="paid">paid</option>
                          <option value="preparing">preparing</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                        <button onClick={() => window.alert(JSON.stringify(o, null, 2))} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">View</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex justify-between items-center">
            <div className="text-xs">Showing {orders.length} of {total}</div>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => fetchOrders(page - 1)} className="px-2 py-1 bg-gray-200 rounded">Prev</button>
              <button disabled={page * limit >= total} onClick={() => fetchOrders(page + 1)} className="px-2 py-1 bg-gray-200 rounded">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
