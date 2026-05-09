import React, { useState, useEffect } from "react";
import { apiClient } from './config/api';

const VendorSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });

  useEffect(() => {
    fetchVendorTickets();
  }, []);

  const fetchVendorTickets = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/vendor/support-tickets');
      setTickets(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tickets");
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/vendor/support-tickets', formData);
      setFormData({ subject: "", message: "" });
      fetchVendorTickets();
      alert("Support ticket submitted successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit ticket");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;

  return (
    <div className="vendor-support p-6">
      <h2 className="text-2xl font-bold mb-6">Vendor Support Center</h2>

      {error && <div className="text-red-500 mb-4 p-3 bg-red-100 rounded">{error}</div>}

      {/* Submit New Ticket Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-4">Create New Support Ticket</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Enter issue subject"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Describe your issue in detail"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Submit Ticket
          </button>
        </form>
      </div>

      {/* Tickets List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Your Support Tickets</h3>
        {tickets.length === 0 ? (
          <p className="text-gray-500">No support tickets yet.</p>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="border border-gray-200 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-lg">{ticket.subject}</h4>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{ticket.message}</p>
                <p className="text-sm text-gray-500">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorSupport;
