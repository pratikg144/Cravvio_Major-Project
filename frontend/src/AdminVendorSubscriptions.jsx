import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from './config/api';
import {
  CheckCircle2, XCircle, Clock, AlertCircle, Edit3, Trash2,
  Plus, ChevronDown, Filter, Search, MoreVertical, Calendar,
  DollarSign, User, Zap, RefreshCw
} from 'lucide-react';

export default function AdminVendorSubscriptions() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSub, setExpandedSub] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [extensionDays, setExtensionDays] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchVendors();
    fetchAllSubscriptions();
  }, []);

  async function fetchVendors() {
    try {
      const res = await apiClient.get('/api/admin/vendors?limit=50');
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error('Failed to load vendors', err);
    }
  }

  async function fetchAllSubscriptions() {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/payment/subscription/all');
      const allSubs = res.data.subscriptions || [];
      
      // Populate user details
      const enrichedSubs = await Promise.all(
        allSubs.map(async (sub) => {
          try {
            const userRes = await apiClient.get(`/api/user/${sub.userId._id || sub.userId}`);
            return { ...sub, user: userRes.data.user };
          } catch (e) {
            return { ...sub, user: typeof sub.userId === 'object' ? sub.userId : { _id: sub.userId } };
          }
        })
      );
      setSubscriptions(enrichedSubs);
    } catch (err) {
      console.error('Failed to load subscriptions', err);
      setMessage({ type: 'error', text: 'Failed to load subscriptions' });
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (subId, newStatus) => {
    setActionLoading({ ...actionLoading, [subId]: true });
    try {
      const res = await apiClient.put(`/api/payment/subscription/${subId}/status`, { status: newStatus });
      setMessage({ type: 'success', text: `Subscription ${newStatus} successfully` });
      await fetchAllSubscriptions();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update status' });
    } finally {
      setActionLoading({ ...actionLoading, [subId]: false });
    }
  };

  const handleDelete = async (subId) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) return;
    
    setActionLoading({ ...actionLoading, [subId]: true });
    try {
      await apiClient.delete(`/api/payment/subscription/${subId}`);
      setMessage({ type: 'success', text: 'Subscription deleted successfully' });
      await fetchAllSubscriptions();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete subscription' });
    } finally {
      setActionLoading({ ...actionLoading, [subId]: false });
    }
  };

  const handleExtendDueDate = async (subId) => {
    const days = extensionDays[subId] || 30;
    if (days <= 0) {
      setMessage({ type: 'error', text: 'Extension days must be greater than 0' });
      return;
    }

    setActionLoading({ ...actionLoading, [subId]: true });
    try {
      const subscription = subscriptions.find(s => s._id === subId);
      if (!subscription) return;

      const currentEnd = new Date(subscription.endDate || new Date());
      const newEnd = new Date(currentEnd);
      newEnd.setDate(newEnd.getDate() + days);

      const res = await apiClient.put(`/api/payment/subscription/${subId}/status`, {
        status: 'active',
        endDate: newEnd
      });
      
      setMessage({ type: 'success', text: `Subscription extended by ${days} days` });
      setExtensionDays({ ...extensionDays, [subId]: 30 });
      setEditingId(null);
      await fetchAllSubscriptions();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to extend subscription' });
    } finally {
      setActionLoading({ ...actionLoading, [subId]: false });
    }
  };

  const handleCompleteOrder = async (subId) => {
    setActionLoading({ ...actionLoading, [subId]: true });
    try {
      await apiClient.put(`/api/payment/subscription/${subId}/status`, { status: 'completed' });
      setMessage({ type: 'success', text: 'Subscription marked as completed' });
      await fetchAllSubscriptions();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to complete subscription' });
    } finally {
      setActionLoading({ ...actionLoading, [subId]: false });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-emerald-100 text-emerald-700 border-emerald-300',
      'pending': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'cancelled': 'bg-rose-100 text-rose-700 border-rose-300',
      'expired': 'bg-slate-100 text-slate-700 border-slate-300',
      'completed': 'bg-blue-100 text-blue-700 border-blue-300'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'active': <Zap className="w-4 h-4" />,
      'pending': <Clock className="w-4 h-4" />,
      'cancelled': <XCircle className="w-4 h-4" />,
      'expired': <AlertCircle className="w-4 h-4" />,
      'completed': <CheckCircle2 className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const isExpiringSoon = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft > 0;
  };

  const isExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  const getDaysLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  // Filter subscriptions
  let filteredSubs = subscriptions;
  if (filterStatus !== 'all') {
    filteredSubs = filteredSubs.filter(s => s.status === filterStatus);
  }
  if (searchQuery) {
    filteredSubs = filteredSubs.filter(s => 
      (s.user?.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (s.user?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      s.plan.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#f3f8ea] to-[#e9f5d0] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Vendor Subscriptions</h1>
            <p className="text-slate-600 mt-2">Manage all vendor and user subscriptions with full controls</p>
          </div>
          <button
            onClick={() => navigate('/admin-subscriptions')}
            className="px-6 py-3 bg-[#6AA200] text-white rounded-xl font-semibold hover:bg-[#507a00] transition shadow-lg"
          >
            <Plus className="w-4 h-4 inline mr-2" /> New Subscription
          </button>
        </div>

        {/* Message Toast */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            {message.text}
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by user, email, or plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6AA200]/30"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6AA200]/30"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
            <button
              onClick={fetchAllSubscriptions}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subscriptions List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">Loading subscriptions...</p>
          </div>
        ) : filteredSubs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <AlertCircle className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 text-lg">No subscriptions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubs.map((sub) => (
              <div 
                key={sub._id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {/* Main Row */}
                <div className="p-6 flex items-center justify-between cursor-pointer" onClick={() => setExpandedSub(expandedSub === sub._id ? null : sub._id)}>
                  <div className="flex items-center gap-4 flex-1">
                    {/* User Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6AA200] to-[#4E7A00] flex items-center justify-center text-white font-bold text-lg">
                      {(sub.user?.username?.[0] || 'U').toUpperCase()}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-lg">{sub.user?.username || 'Unknown User'}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(sub.status)}`}>
                          {getStatusIcon(sub.status)}
                          {sub.status}
                        </span>
                        {isExpiringSoon(sub.endDate) && !isExpired(sub.endDate) && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                            Expiring in {getDaysLeft(sub.endDate)}d
                          </span>
                        )}
                        {isExpired(sub.endDate) && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            Expired
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{sub.user?.email || 'No email'}</p>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="hidden md:grid grid-cols-4 gap-4 mr-4 text-right">
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Plan</p>
                      <p className="text-sm font-bold text-slate-900">{sub.plan}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Price</p>
                      <p className="text-sm font-bold text-slate-900">₹{sub.price}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Duration</p>
                      <p className="text-sm font-bold text-slate-900">{sub.months} mo</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">Expires</p>
                      <p className="text-sm font-bold text-slate-900">
                        {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <ChevronDown className={`w-5 h-5 text-slate-400 transition ${expandedSub === sub._id ? 'rotate-180' : ''}`} />
                </div>

                {/* Expanded Details */}
                {expandedSub === sub._id && (
                  <div className="bg-slate-50 border-t border-slate-200 p-6 space-y-6">
                    {/* Subscription Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Subscription ID</p>
                        <code className="text-sm bg-white border border-slate-200 rounded-lg p-3 block break-all font-mono">{sub._id}</code>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase mb-2">User ID</p>
                        <code className="text-sm bg-white border border-slate-200 rounded-lg p-3 block break-all font-mono">
                          {typeof sub.userId === 'object' ? sub.userId._id : sub.userId}
                        </code>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Created Date</p>
                        <p className="text-sm bg-white border border-slate-200 rounded-lg p-3">
                          {new Date(sub.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Payment Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600 mb-1">Total Price</p>
                          <p className="text-xl font-bold text-slate-900">₹{sub.price}</p>
                        </div>
                        <div>
                          <p className="text-slate-600 mb-1">Payment Method</p>
                          <p className="font-semibold text-slate-900">
                            {sub.paymentInfo?.method || 'Pending Payment'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600 mb-1">Payment Status</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            sub.paymentInfo?.method ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {sub.paymentInfo?.method ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      {sub.paymentInfo?.transactionId && (
                        <p className="text-xs text-slate-600 mt-3">
                          Transaction ID: <code className="font-mono">{sub.paymentInfo.transactionId}</code>
                        </p>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> Start Date
                        </p>
                        <p className="font-semibold text-slate-900">
                          {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'Not started'}
                        </p>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> End Date
                        </p>
                        <p className={`font-semibold ${isExpired(sub.endDate) ? 'text-red-600' : 'text-slate-900'}`}>
                          {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-900">Actions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sub.status !== 'completed' && (
                          <button
                            onClick={() => handleCompleteOrder(sub._id)}
                            disabled={actionLoading[sub._id]}
                            className="px-4 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:bg-slate-300 transition"
                          >
                            {actionLoading[sub._id] ? 'Processing...' : 'Complete Order'}
                          </button>
                        )}

                        {sub.status !== 'cancelled' && sub.status !== 'expired' && (
                          <button
                            onClick={() => handleStatusChange(sub._id, 'cancelled')}
                            disabled={actionLoading[sub._id]}
                            className="px-4 py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 disabled:bg-slate-300 transition"
                          >
                            {actionLoading[sub._id] ? 'Processing...' : 'Cancel'}
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(sub._id)}
                          disabled={actionLoading[sub._id]}
                          className="px-4 py-2.5 bg-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-400 disabled:bg-slate-300 transition"
                        >
                          {actionLoading[sub._id] ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>

                      {/* Extend Due Date Section */}
                      {sub.status === 'active' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <h5 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-600" /> Extend Due Date
                          </h5>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="1"
                              max="365"
                              value={extensionDays[sub._id] || 30}
                              onChange={(e) => setExtensionDays({ ...extensionDays, [sub._id]: parseInt(e.target.value) })}
                              placeholder="Days"
                              className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => handleExtendDueDate(sub._id)}
                              disabled={actionLoading[sub._id]}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 transition"
                            >
                              {actionLoading[sub._id] ? 'Extending...' : 'Extend'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && filteredSubs.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-600 font-semibold uppercase">Total Subscriptions</p>
              <p className="text-2xl font-bold text-slate-900">{subscriptions.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-600 font-semibold uppercase">Active</p>
              <p className="text-2xl font-bold text-emerald-700">{subscriptions.filter(s => s.status === 'active').length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-600 font-semibold uppercase">Pending</p>
              <p className="text-2xl font-bold text-yellow-700">{subscriptions.filter(s => s.status === 'pending').length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-600 font-semibold uppercase">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-700">
                {subscriptions.filter(s => isExpiringSoon(s.endDate) && !isExpired(s.endDate)).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
