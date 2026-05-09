import React, { useEffect, useState } from 'react';
import { apiClient } from './config/api';

export default function About() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    apiClient.get('/api/public/about')
      .then((res) => {
        if (!mounted) return;
        setData(res.data?.data || null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Failed to load');
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-6">No content available.</div>;

  return (
    <div className="container p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
      <h2 className="text-xl text-gray-700 mb-4">{data.subtitle}</h2>
      <p className="mb-4">{data.description}</p>

      <div className="mb-4">
        <h3 className="font-semibold">Contact</h3>
        <p>{data.contact.email} · {data.contact.phone}</p>
        <p>{data.contact.address}</p>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Team</h3>
        <ul>
          {data.team.map((m, i) => (
            <li key={i}>{m.name} — {m.role}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
