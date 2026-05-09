import React, { useState, useEffect } from 'react';
import { apiClient } from './config/api';

const AdminQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      setError(null);
      const response = await apiClient.get('/api/admin/chatbot-queries');
      console.log('API Response:', response.data);
      const queriesList = response.data.queries || response.data || [];
      setQueries(Array.isArray(queriesList) ? queriesList : []);
    } catch (error) {
      console.error('Error fetching queries:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || error.message || 'Failed to fetch queries');
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  const [replyText, setReplyText] = useState({});

  const resolveQuery = async (id) => {
    try {
      const response = await apiClient.put(`/api/admin/chatbot-queries/${id}/resolve`, {
        adminResponse: replyText[id] || 'Resolved by admin',
      });
      setQueries(queries.filter(q => q._id !== id));
      setReplyText((prev) => ({ ...prev, [id]: '' }));
      alert('Query resolved successfully');
      console.log('Resolve response', response.data);
    } catch (error) {
      console.error('Error resolving query:', error);
      alert('Unable to resolve query. See console for details.');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Unresolved Chatbot Queries</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p><strong>Error:</strong> {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Unresolved Chatbot Queries</h2>
      {queries.length === 0 ? (
        <p className="text-gray-600">No unresolved queries.</p>
      ) : (
        <div className="space-y-4">
          {queries.map(query => (
            <div key={query._id} className="bg-white p-4 rounded shadow border border-gray-200">
              <p><strong>ID:</strong> <code>{query._id}</code></p>
              <p><strong>Query:</strong> {query.query}</p>
              <p><strong>Role:</strong> <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded">{query.role}</span></p>
              <p><strong>Direct to Admin:</strong> <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${query.direct ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'}`}>
                {query.direct ? 'Yes' : 'No'}
              </span></p>
              <p><strong>Name:</strong> {query.userName || 'Guest'}</p>
              <p><strong>Email:</strong> {query.userEmail || 'N/A'}</p>
              {query.userId && <p><strong>User ID:</strong> <code>{query.userId}</code></p>}
              <p><strong>Status:</strong> <span className={query.status === 'resolved' ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'}>{query.status}</span></p>
              <p><strong>Date:</strong> {new Date(query.createdAt).toLocaleString()}</p>
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Admin Response</label>
                <textarea
                  value={replyText[query._id] || ''}
                  onChange={(e) => setReplyText((prev) => ({ ...prev, [query._id]: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20"
                  rows={3}
                  placeholder="Write a response summary or resolution note..."
                />
              </div>
              <button
                onClick={() => resolveQuery(query._id)}
                className="mt-3 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Resolve Query
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminQueries;