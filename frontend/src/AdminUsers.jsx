import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from './config/api';
import { jsPDF } from 'jspdf';

export default function AdminUsers() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('auth');
    navigate('/login');
  };
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // fetch users and admin subscriptions in parallel
    Promise.all([
      apiClient.get('/api/user/admin/users?limit=500'),
      apiClient.get('/api/payment/subscription/all')
    ])
      .then(([usersRes, subsRes]) => {
        if (!mounted) return;
        const usersList = usersRes.data.users || [];
        const subs = (subsRes.data && subsRes.data.subscriptions) || [];
        // Build map of latest subscription per user
        const subsByUser = {};
        subs.forEach(s => {
          const uid = s.userId && s.userId._id ? s.userId._id : s.userId;
          if (!subsByUser[uid] || new Date(s.createdAt) > new Date(subsByUser[uid].createdAt)) {
            subsByUser[uid] = s;
          }
        });
        setSubscriptions(subsByUser);
        setUsers(usersList);
      })
      .catch(err => console.error('Failed to load users or subscriptions', err))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  function formatDate(d) {
    if (!d) return 'N/A';
    const t = new Date(d);
    return t.toLocaleString();
  }

  function generatePdf() {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Users Full Report', 14, 20);
    doc.setFontSize(10);
    let y = 30;
    users.forEach((u, idx) => {
      if (y > 270) { doc.addPage(); y = 20; }
      const sub = subscriptions[u._id];
      doc.text(`${idx + 1}. ID: ${u._id}`, 14, y);
      y += 6;
      doc.text(`   Name: ${u.username || 'N/A'}`, 14, y);
      y += 6;
      doc.text(`   Email: ${u.email || 'N/A'}`, 14, y);
      y += 6;
      doc.text(`   Phone: ${u.phone || 'N/A'}`, 14, y);
      y += 6;
      if (sub) {
        doc.text(`   Plan: ${sub.plan || 'N/A'}`, 14, y);
        y += 6;
        doc.text(`   Status: ${sub.status || 'N/A'}`, 14, y);
        y += 6;
        doc.text(`   Start: ${formatDate(sub.startDate || sub.createdAt)}`, 14, y);
        y += 6;
        doc.text(`   End: ${formatDate(sub.endDate)}`, 14, y);
        y += 6;
        const txn = sub.paymentInfo && (sub.paymentInfo.transactionId || sub.paymentInfo.paymentId) ? (sub.paymentInfo.transactionId || sub.paymentInfo.paymentId) : null;
        if (txn) { doc.text(`   Transaction: ${txn}`, 14, y); y += 6; }
        // include subscription creation as payment/time reference
        doc.text(`   Record created: ${formatDate(sub.createdAt)}`, 14, y);
        y += 8;
      } else {
        doc.text('   Subscription/Payment: None', 14, y);
        y += 8;
      }
    });
    doc.save('users-full-report.pdf');
  }

  return (

    <div  className='min-h-screen bg-gradient-to-r from-[#f3f8ea] to-[#e9f5d0] text-gray-800 font-poppins'>
      <nav className="bg-white rounded-2xl shadow-md p-3 sm:p-5 overflow-x-auto flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#6AA200] cursor-pointer" onClick={() => navigate('/')}>Cravvio</h1>
        <div className="flex flex-wrap gap-2 sm:gap-4 mt-3 sm:mt-0 items-center">
          <button onClick={() => navigate('/')} className="text-[#6AA200] hover:text-[#507a00] text-sm font-medium">Home</button>
          <button onClick={() => navigate('/admin')} className="text-[#6AA200] hover:text-[#507a00] text-sm font-medium">Profile</button>
          <button onClick={() => navigate('/FullReportPage')} className="text-[#6AA200] hover:text-[#507a00] text-sm font-medium">About</button>

          <button
            className="text-red-600 font-semibold hover:text-red-700 text-sm"
            onClick={handleLogout}
          >
            Logout
          </button>

          <div className="flex items-center justify-between">
         
   <button onClick={generatePdf}
  class="bg-gradient-to-r from-[#f3f8ea] to-[#e9f5d0] text-center w-48 rounded-2xl h-14 relative text-black text-xl font-semibold group"
  type="button"
>
  <div
    class="bg-[#6AA200] rounded-xl h-12 w-1/4 flex items-center justify-center absolute left-1 top-[2px] group-hover:w-[92px] flex z-10 duration-500"
  >
    
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="25"
      fill="none"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M12 3v12"></path>
      <path d="M7 10l5 5 5-5"></path>
      <path d="M5 21h14"></path>
    </svg>
  </div>
  <p class="translate-x-2">Full Report</p>
</button>

        
         </div>
        </div>
      </nav>
      {loading ? <div>Loading users...</div> : (
        <div className="bg-white rounded-2xl shadow-md p-3 sm:p-5 overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-[#6AA200] border-b">
                <th className="p-2 text-left">User ID</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Plan</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Start</th>
                <th className="p-2 text-left">End</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b">
                  <td className="p-2 text-xs text-gray-600">{u._id}</td>
                  <td className="p-2">{u.username}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.phone || 'N/A'}</td>
                  <td className="p-2">
                    {subscriptions[u._id] ? (subscriptions[u._id].plan || '—') : '—'}
                  </td>
                  <td className="p-2">{subscriptions[u._id] ? (subscriptions[u._id].status || '—') : '—'}</td>
                  <td className="p-2 text-[11px] text-gray-500">{subscriptions[u._id] ? formatDate(subscriptions[u._id].startDate || subscriptions[u._id].createdAt) : '—'}</td>
                  <td className="p-2 text-[11px] text-gray-500">{subscriptions[u._id] ? formatDate(subscriptions[u._id].endDate) : '—'}</td>
                  <td className="p-2">
                    <button onClick={() => window.alert(JSON.stringify(u, null, 2))} className="px-2 py-1 bg-blue-500 text-white rounded text-xs mr-2">View</button>
                    <button onClick={() => { const s = subscriptions[u._id]; window.alert(JSON.stringify(s || { message: 'No subscription' }, null, 2)); }} className="px-2 py-1 bg-gray-600 text-white rounded text-xs">Payment</button>
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
