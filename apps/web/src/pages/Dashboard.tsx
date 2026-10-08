import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    fetch('http://localhost:8080/api/dashboard', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => res.json())
    .then(data => setMetrics(data.metrics))
    .catch(console.error);

  }, [navigate]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-gray-400 mt-1">Welcome back, {user.name} ({user.role})</p>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded border border-gray-700 transition-colors">
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm font-medium">Active Listings</h3>
          <p className="text-3xl font-bold mt-2">{metrics?.activeListings ?? 0}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm font-medium">Offers Received</h3>
          <p className="text-3xl font-bold mt-2 text-blue-400">{metrics?.offersReceived ?? 0}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm font-medium">Completed Deals</h3>
          <p className="text-3xl font-bold mt-2 text-green-400">{metrics?.completedDeals ?? 0}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 bg-gray-900 flex justify-between items-center">
          <h3 className="font-semibold">Your Listings</h3>
          <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-sm transition-colors">Create Listing</button>
        </div>
        <div className="p-6">
           <p className="text-gray-400">Listings will appear here...</p>
        </div>
      </div>
    </div>
  );
}
