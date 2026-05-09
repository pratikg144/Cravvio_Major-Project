import React, { useState, useEffect } from "react";
import { apiClient } from "./config/api";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    owner: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
  });

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/auth/admin/profile');
      const admin = response.data.admin;
      setAdminData(admin);
      setFormValues({
        owner: admin.owner || "",
        email: admin.email || "",
        phone: admin.phone || "",
        address: admin.address || "",
        pincode: admin.pincode || "",
      });
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Failed to load admin profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if ( !formValues.phone || !formValues.address || !formValues.pincode) {
      alert("Please fill all required fields");
      return;
    }

    try {
      await apiClient.put('/api/auth/admin/profile', {
        owner: formValues.owner,
        phone: formValues.phone,
        address: formValues.address,
        pincode: formValues.pincode,
      });
      alert("Settings updated successfully!");
      setIsEditing(false);
      fetchAdminProfile();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update settings");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fdf4] p-6 text-gray-800">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-semibold text-[#6AA200] mb-6">Admin Settings</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {adminData && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            {!isEditing ? (
              <div className="space-y-4 mb-6">
                
                <div>
                  <label className="block text-sm font-semibold text-[#6AA200]">Email</label>
                  <p className="text-gray-700">{adminData.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#6AA200]">Phone</label>
                  <p className="text-gray-700">{adminData.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#6AA200]">Address</label>
                  <p className="text-gray-700">{adminData.address}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#6AA200]">Pincode</label>
                  <p className="text-gray-700">{adminData.pincode}</p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-6 w-full bg-[#6AA200] text-white px-4 py-2 rounded-md hover:bg-[#507a00]"
                >
                  Edit Settings
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formValues.email}
                    disabled
                    className="w-full border rounded-md p-2 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#6AA200]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formValues.address}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#6AA200]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formValues.pincode}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#6AA200]"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      fetchAdminProfile();
                    }}
                    className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#6AA200] text-white px-4 py-2 rounded-md hover:bg-[#507a00]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;