import React, { useState, useEffect } from "react";
import { apiClient } from './config/api';

const SupportRequests = () => {
  const [supportRequests, setSupportRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSupportRequests();
  }, []);

  const fetchSupportRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/support');
      setSupportRequests(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch support requests");
      console.error("Error fetching support requests:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-4">Loading support requests...</div>;

  return (
    <div className="support-requests">
      <h3 className="text-xl font-bold mb-4">Support Requests</h3>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {supportRequests.length === 0 ? (
        <p className="text-gray-500">No support requests yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                <th className="border border-gray-300 px-4 py-2 text-left">User</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Subject</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {supportRequests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">{request._id}</td>
                  <td className="border border-gray-300 px-4 py-2">{request.user?.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{request.subject}</td>
                  <td className="border border-gray-300 px-4 py-2">{request.status}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SupportRequests;
