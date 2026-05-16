import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from './config/api';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/user/notifications?type=${filter}&limit=20`);
      setNotifications(response.data.notifications || []);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Failed to load notifications");
      }
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    const icons = {
      vendor_registration: "🏪",
      user_registration: "👤",
      system_alert: "⚙",
      vendor_approval: "✅",
    };
    return icons[type] || "📬";
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#f9fdf4] p-6 text-gray-800">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-semibold text-[#6AA200] mb-6">Notifications</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filter === "all"
                ? "bg-[#6AA200] text-white"
                : "bg-white text-[#6AA200] border border-[#6AA200]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("vendor_registration")}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filter === "vendor_registration"
                ? "bg-[#6AA200] text-white"
                : "bg-white text-[#6AA200] border border-[#6AA200]"
            }`}
          >
            Vendor
          </button>
          <button
            onClick={() => setFilter("user_registration")}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filter === "user_registration"
                ? "bg-[#6AA200] text-white"
                : "bg-white text-[#6AA200] border border-[#6AA200]"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setFilter("system_alert")}
            className={`px-4 py-2 rounded-lg font-semibold ${
              filter === "system_alert"
                ? "bg-[#6AA200] text-white"
                : "bg-white text-[#6AA200] border border-[#6AA200]"
            }`}
          >
            System
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-lg shadow ${
                  notif.read ? "bg-gray-50" : "bg-white border-l-4 border-[#6AA200]"
                } hover:shadow-md transition`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{getIcon(notif.type)}</span>
                  <div className="flex-1">
                    <p className="text-gray-800 font-semibold">{notif.message}</p>
                    <p className="text-sm text-gray-600 mt-1">{formatTime(notif.timestamp)}</p>
                  </div>
                  {!notif.read && (
                    <div className="h-3 w-3 bg-[#6AA200] rounded-full mt-1"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;