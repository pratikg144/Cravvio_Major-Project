import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from './config/api';
import { jsPDF } from 'jspdf';

export default function AdminPayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get('/api/admin/payments');
      setPayments(res.data.payments || []);
    } catch (err) {
      console.error('Fetch payments error', err);
      if (err.response?.status === 401) {
        setError('Unauthorized — please login as admin');
        // Redirect to login after short delay
        setTimeout(() => navigate('/login'), 800);
      } else {
        setError(err.response?.data?.message || 'Failed to load payments');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  function formatDate(d) {
    if (!d) return 'N/A';
    try { return new Date(d).toLocaleString(); } catch (e) { return String(d); }
  }

  function generatePdf() {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Payments Full Report', 14, 20);
    doc.setFontSize(10);
    let y = 30;
    if (!payments || payments.length === 0) {
      doc.text('No payments found.', 14, y);
    } else {
      payments.forEach((p, idx) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`${idx + 1}. ID: ${p._id}`, 14, y); y += 6;
        doc.text(`   User: ${p.userId?.username || p.userId?.email || 'N/A'}`, 14, y); y += 6;
        doc.text(`   Amount: ₹${p.amount || 0}`, 14, y); y += 6;
        doc.text(`   Status: ${p.status || 'N/A'}`, 14, y); y += 6;
        doc.text(`   Transaction: ${p.transactionId || (p.paymentDetails && (p.paymentDetails.upiId || p.paymentDetails.cardLast4)) || 'N/A'}`, 14, y); y += 6;
        doc.text(`   Date: ${formatDate(p.createdAt)}`, 14, y); y += 6;

        // If payment has an associated order, include items with per-item price
        const order = p.orderId;
        if (order && Array.isArray(order.items) && order.items.length) {
          if (y > 260) { doc.addPage(); y = 20; }
          doc.text('   Items:', 14, y); y += 6;
          order.items.forEach((it) => {
            if (y > 270) { doc.addPage(); y = 20; }
            const qty = it.qty || 1;
            const price = (typeof it.price === 'number') ? it.price : (it.price || 0);
            const lineTotal = qty * price;
            const line = `     - ${it.name || 'Item'} x${qty} @ ₹${price} = ₹${lineTotal}`;
            doc.text(line, 14, y); y += 6;
          });
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(`   Order total: ₹${order.total || 'N/A'}`, 14, y); y += 8;
        } else {
          y += 2;
        }
      });
    }
    doc.save('payments-full-report.pdf');
  }

  if (loading) return <div className="p-4">Loading payments...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#f3f8ea] to-[#e9f5d0] text-gray-800 font-poppins p-6">
      <nav className="bg-white rounded-2xl shadow-md p-3 sm:p-5 overflow-x-auto flex items-center mb-6">
     <button onClick={() => navigate('/admin')} className="text-[#6AA200] text-center w-48 rounded-2xl h-14 relative  text-xl font-semibold group hover:bg-[#6AA200] hover:text-white">Back</button>


  
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

      <h3 className="text-lg font-semibold text-[#6AA200] mb-3">Payments</h3>
      {error && (
        <div className="p-3 mb-3 rounded bg-red-50 text-red-700">{error}</div>
      )}
      {payments.length === 0 && !error ? (
        <p className="text-gray-600">No payments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#6AA200] border-b">
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">User</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p._id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{p._id}</td>
                  <td className="p-2">{p.userId?.username || p.userId?.email || 'N/A'}</td>
                  <td className="p-2">₹{p.amount}</td>
                  <td className="p-2">{p.status}</td>
                  <td className="p-2">{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
