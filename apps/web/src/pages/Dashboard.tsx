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

  if (!user) return (
    <div className="flex items-center justify-center h-[60vh] animate-pulse">
      <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="animate-fade-in relative z-10">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-[100px] pointer-events-none -z-10 mix-blend-screen"></div>
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-4">
        <div>
          <h2 className="text-4xl font-display font-extrabold tracking-tight text-white mb-1">Dashboard</h2>
          <div className="flex items-center gap-2">
            <p className="text-gray-400 font-medium text-lg">Welcome back, {user.name}</p>
            <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-wider rounded-md border border-primary-500/30">{user.role}</span>
          </div>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="glass-button px-5 py-2.5 text-sm font-medium text-gray-300 w-full md:w-auto self-start md:self-auto">
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-panel p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Active Listings</h3>
          <p className="text-4xl font-display font-extrabold text-white">{metrics?.activeListings ?? 0}</p>
        </div>
        <div className="glass-panel p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-colors"></div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Offers Received</h3>
          <p className="text-4xl font-display font-extrabold text-primary-400">{metrics?.offersReceived ?? 0}</p>
        </div>
        <div className="glass-panel p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors"></div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Completed Deals</h3>
          <p className="text-4xl font-display font-extrabold text-green-400">{metrics?.completedDeals ?? 0}</p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="px-8 py-5 border-b border-border bg-surface-hover/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="font-display font-bold text-xl text-white">Your Listings</h3>
          <button className="primary-gradient px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-95 w-full md:w-auto flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Create Listing
          </button>
        </div>
        <div className="p-12 text-center">
           <div className="w-16 h-16 rounded-full bg-surface-hover border border-white/5 flex items-center justify-center mx-auto text-gray-500 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
           </div>
           <h4 className="text-lg font-semibold text-gray-300 mb-2">No listings yet</h4>
           <p className="text-gray-500 text-sm max-w-sm mx-auto">You haven't posted any items for sale. Click the button above to create your first listing.</p>
        </div>
      </div>
    </div>
  );
}
