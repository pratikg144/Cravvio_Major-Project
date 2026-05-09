import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from './config/api';

export default function AdminSubscriptions() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'active'
  const [processingPayment, setProcessingPayment] = useState(null);
  const [form, setForm] = useState({
    plan: 'Basic',
    price: '',
    months: '1',
    applyToAll: false,
    userId: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUsers();
    fetchSubscriptions();
  }, []);

  async function fetchUsers() {
    try {
      const res = await apiClient.get('/api/user/admin/users?page=1&limit=1000');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to load users', err);
    }
  }

  async function fetchSubscriptions() {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/payment/subscription/all');
      let allSubs = res.data.subscriptions || [];
      
      // Enrich subscriptions with user details
      const enrichedSubs = await Promise.all(
        allSubs.map(async (sub) => {
          try {
            const userRes = await apiClient.get(`/api/user/${sub.userId._id || sub.userId}`);
            return { ...sub, userDetails: userRes.data.user };
          } catch (e) {
            // Fallback to userId object if available
            return { 
              ...sub, 
              userDetails: typeof sub.userId === 'object' ? sub.userId : { _id: sub.userId }
            };
          }
        })
      );
      setSubscriptions(enrichedSubs);
    } catch (err) {
      console.error('Failed to load subscriptions', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Unable to load subscriptions',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: '', text: '' });

    const { plan, price, months, applyToAll, userId } = form;
    if (!plan || !price) {
      setMessage({ type: 'error', text: 'Please enter a plan and price.' });
      return;
    }
    if (!applyToAll && !userId) {
      setMessage({ type: 'error', text: 'Select a user or apply the subscription to everyone.' });
      return;
    }

    try {
      setSaving(true);
      const body = {
        plan,
        price: Number(price),
        months: Number(months || 1),
        applyToAll,
      };
      if (!applyToAll) body.userId = userId;

      const res = await apiClient.post('/api/payment/subscription/admin/create', body);
      setMessage({ type: 'success', text: res.data.message || 'Subscription created.' });
      setForm(prev => ({ ...prev, price: '', months: '1', userId: prev.applyToAll ? '' : prev.userId }));
      fetchSubscriptions();
    } catch (err) {
      console.error('Create subscription error', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create subscription.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentSuccess = async (subscriptionId) => {
    try {
      setProcessingPayment(subscriptionId);
      await apiClient.put(`/api/payment/subscription/${subscriptionId}/status`, { status: 'success' });
      setMessage({ type: 'success', text: 'Payment status updated to success!' });
      fetchSubscriptions();
    } catch (err) {
      console.error('Failed to update payment status', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update payment status.',
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  const filteredSubscriptions = activeTab === 'active' 
    ? subscriptions.filter(sub => sub.status === 'success')
    : subscriptions;

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#f3f8ea] to-[#e9f5d0] text-slate-900 font-poppins p-6">
      <nav className="bg-white rounded-2xl shadow-md p-3 sm:p-5 overflow-x-auto flex items-center mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="text-[#6AA200] rounded-2xl h-14 w-40 font-semibold border border-[#6AA200] hover:bg-[#6AA200] hover:text-white transition"
        >
          Back to Admin
        </button>

        <div className="ml-auto flex gap-3 items-center">
          <button
            onClick={() => navigate('/admin-payments')}
            className="bg-white border border-slate-200 text-slate-800 rounded-2xl h-14 px-4 font-semibold hover:bg-slate-50 transition"
          >
            View Payments
          </button>
          <button
            onClick={fetchSubscriptions}
            className="bg-[#6AA200] text-white rounded-2xl h-14 px-4 font-semibold hover:bg-[#507a00] transition"
          >
            Refresh
          </button>
        </div>
      </nav>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="bg-white rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xl font-semibold text-[#6AA200]">Create Subscription</h3>
              <p className="mt-1 text-sm text-slate-500">
                Create a pending subscription for one user or all users.
              </p>
            </div>
          </div>

          {message.text && (
            <div className={`rounded-2xl p-3 mb-4 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Plan</label>
              <select
                value={form.plan}
                onChange={(e) => handleChange('plan', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6AA200]/30"
              >
                <option>Basic</option>
                <option>Standard</option>
                <option>Premium</option>
                <option>Custom</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Price
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="₹ amount"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6AA200]/30"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Duration (months)
                <input
                  type="number"
                  min="1"
                  value={form.months}
                  onChange={(e) => handleChange('months', e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6AA200]/30"
                />
              </label>
            </div>

            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.applyToAll}
                onChange={(e) => handleChange('applyToAll', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#6AA200] focus:ring-[#6AA200]"
              />
              Apply subscription to all users
            </label>

            {!form.applyToAll && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Select user</label>
                <select
                  value={form.userId}
                  onChange={(e) => handleChange('userId', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6AA200]/30"
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.username || user.name || user.email || user.phone || user._id}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <p className="text-sm text-slate-500">
              Payment processing is handled separately in the Payments section. This panel creates the subscription entry.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-[#6AA200] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#507a00] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {saving ? 'Creating...' : 'Create Subscription'}
            </button>
          </form>
        </section>

        <section className="bg-white rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xl font-semibold text-[#6AA200]">Subscriptions</h3>
              <p className="mt-1 text-sm text-slate-500">
                {activeTab === 'active' ? 'Active subscriptions' : 'All subscriptions (pending & active)'}
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
              {filteredSubscriptions.length} total
            </span>
          </div>

          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition ${
                activeTab === 'all'
                  ? 'bg-[#6AA200] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Subscriptions
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition ${
                activeTab === 'active'
                  ? 'bg-[#6AA200] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Active Subscriptions
            </button>
          </div>

          {loading ? (
            <p className="text-slate-500">Loading subscriptions...</p>
          ) : filteredSubscriptions.length === 0 ? (
            <p className="text-slate-500">No subscriptions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-slate-600 border-b">
                    <th className="p-3">Plan</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Months</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub._id} className="border-b last:border-b-0 hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-800">{sub.plan}</td>
                      <td className="p-3">₹{sub.price}</td>
                      <td className="p-3">{sub.userDetails?.username || sub.userDetails?.name || sub.userDetails?.email || sub.userDetails?.phone || 'All users'}</td>
                      <td className="p-3">{sub.months || 1}</td>
                      <td className="p-3 text-sm capitalize">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          sub.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {sub.status || 'pending'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 text-xs">{new Date(sub.createdAt).toLocaleString()}</td>
                      <td className="p-3">
                        {sub.status !== 'success' && (
                          <button
                            onClick={() => handlePaymentSuccess(sub._id)}
                            disabled={processingPayment === sub._id}
                            className="px-3 py-1 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600 transition disabled:bg-slate-300"
                          >
                            {processingPayment === sub._id ? 'Processing...' : 'Mark Paid'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
