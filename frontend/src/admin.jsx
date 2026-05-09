import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Store, MessageSquare,
  CreditCard, LifeBuoy, Settings, LogOut, Bell,
  Search, TrendingUp, Activity, CheckCircle2,
  XCircle, Clock, ChevronDown, Plus, MoreVertical,
  ShieldCheck, AlertCircle
} from 'lucide-react';
import { apiClient } from './config/api';

// Import existing connected components
import AdminStats from './AdminStats';
import AdminUsers from './AdminUsers';
import AdminVendors from './AdminVendors';
import AdminOrders from './AdminOrders';
import AdminSubscriptions from './AdminSubscriptions';
import AdminUserSubscriptions from './AdminUserSubscriptions';
import AdminQueries from './AdminQueries';
import SupportRequests from './SupportRequests';
import CravvioChatbot from './Chatbot';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState({ owner: 'Pratik Gupta', email: 'prateekg508@gmail.com' });
  const [recentActivity, setRecentActivity] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await apiClient.get('/api/admin/recent-activity');
      setRecentActivity(response.data.activities || []);
    } catch (error) {
      console.error('Error loading recent activity:', error);
      setRecentActivity([]);
    }
  };

  useEffect(() => {
    fetchRecentActivity();
  }, []);


  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subscriptions', label: 'Create Subscriptions', icon: CreditCard },
    { id: 'user-subscriptions', label: 'User Subscriptions', icon: CreditCard },
    { id: 'vendors', label: 'Vendors', icon: Store },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'orders', label: 'Orders', icon: Activity },
    { id: 'queries', label: 'Queries', icon: MessageSquare },
    { id: 'support', label: 'Support', icon: LifeBuoy },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#f3f8ea] to-[#e9f5d0] flex font-sans text-slate-900">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Cravvio<span className="text-emerald-600">.</span></span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Main Menu</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${activeTab === item.id
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <item.icon className={`w-5 h-5 mr-3 transition-colors ${activeTab === item.id ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button className="w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <Settings className="w-5 h-5 mr-3 text-slate-400" />
            Settings
          </button>
          <button className="w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors mt-1">
            <LogOut className="w-5 h-5 mr-3 text-rose-500" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">

        {/* TOP HEADER */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 w-96 border border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search vendors, users, or orders..."
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center space-x-5">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold mr-3 border border-emerald-200 group-hover:shadow-sm transition-all">
                {admin.owner.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold leading-tight text-slate-900">{admin.owner}</p>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
              <ChevronDown className="w-4 h-4 ml-2 text-slate-400" />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-8 max-w-7xl mx-auto w-full">

          {/* TOAST NOTIFICATION */}
          {toast.show && (
            <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-xl flex items-center z-50`}>
              <span className="font-medium text-sm">{toast.message}</span>
            </div>
          )}

          {/* DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Overview</h1>
                  <p className="text-slate-500 mt-1">Here's what's happening with Cravvio today.</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition shadow-sm flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-slate-400" /> Last 30 Days
                  </button>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition shadow-sm shadow-emerald-600/20 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" /> Download Report
                  </button>
                </div>
              </div>

              {/* Use AdminStats component */}
              <AdminStats />

              {/* TWO COLUMN SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Recent Activity</h3>
                    <button className="text-sm text-emerald-600 font-medium hover:text-emerald-700">View All</button>
                  </div>
                  <div className="p-6 flex-1">
                    <div className="space-y-6">
                      {recentActivity.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>No recent activity yet.</p>
                    <p className="text-sm mt-1">Events will appear here as orders, support tickets, and chatbot escalations arrive.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                            <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                          </div>
                          <div className="text-xs text-slate-500 text-right">
                            <p>{new Date(activity.createdAt).toLocaleString()}</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold ${activity.type === 'order' ? 'bg-emerald-100 text-emerald-700' : activity.type === 'support' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {activity.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                    </div>
                  </div>
                </div>

                {/* System Health */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-semibold text-lg">Platform Health</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-slate-700">System Status</span>
                        <span className="text-emerald-600 font-semibold">Operational</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-slate-700">API Response</span>
                        <span className="text-emerald-600 font-semibold">Fast</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-sm text-slate-500 mb-1">Last Backup</p>
                      <p className="text-sm font-semibold text-slate-900">2 hours ago</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Version</p>
                      <p className="text-sm font-semibold text-slate-900">v2.1.0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBSCRIPTIONS VIEW */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Subscription Management</h1>
                  <p className="text-slate-500 mt-1">Create subscriptions for individuals or all users. Payments are managed in the Payments panel.</p>
                </div>
              </div>
              <AdminSubscriptions />
            </div>
          )}

          {/* USER SUBSCRIPTIONS VIEW */}
          {activeTab === 'user-subscriptions' && (
            <div className="space-y-6 animate-fade-in">
              <AdminUserSubscriptions />
            </div>
          )}

          {/* VENDORS VIEW */}
          {activeTab === 'vendors' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Vendor Management</h1>
                  <p className="text-slate-500 mt-1">Onboard, review, and manage platform partners.</p>
                </div>
              </div>
              <AdminVendors />
            </div>
          )}

          {/* USERS VIEW */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
                  <p className="text-slate-500 mt-1">Manage user accounts, profiles, and access.</p>
                </div>
              </div>
              <AdminUsers />
            </div>
          )}

          {/* ORDERS VIEW */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Order Management</h1>
                  <p className="text-slate-500 mt-1">Track and manage all orders across the platform.</p>
                </div>
              </div>
              <AdminOrders />
            </div>
          )}

          {/* QUERIES VIEW */}
          {activeTab === 'queries' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Chatbot Queries</h1>
                  <p className="text-slate-500 mt-1">Review and resolve unresolved chatbot queries.</p>
                </div>
              </div>
              <AdminQueries />
            </div>
          )}

          {/* SUPPORT VIEW */}
          {activeTab === 'support' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Support Requests</h1>
                  <p className="text-slate-500 mt-1">Handle customer support tickets and requests.</p>
                </div>
              </div>
              <SupportRequests />
            </div>
          )}

        </div>
      </main>

      <CravvioChatbot />
    </div>
  );
}
