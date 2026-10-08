import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      fetch(`http://localhost:8080/api/listings?search=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(resData => {
          setListings(resData.data || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="glass-panel p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px] -z-10 mix-blend-screen"></div>
        <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-4 tracking-tight bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
          Student Marketplace
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-lg">
          Buy and sell textbooks, electronics, and dorm essentials safely within the verified Pondicherry University network.
        </p>
        <div className="max-w-xl mx-auto relative group">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..." 
            className="w-full glass-panel !bg-surface-hover border-border rounded-xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.1)] group-hover:bg-white/[0.05]"
          />
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          // Skeleton Loaders
          [...Array(8)].map((_, i) => (
            <div key={i} className="glass-panel overflow-hidden animate-pulse">
              <div className="h-48 bg-surface-hover"></div>
              <div className="p-5 space-y-4">
                <div className="h-6 bg-surface-hover rounded-md w-3/4"></div>
                <div className="h-8 bg-surface-hover rounded-md w-1/3"></div>
                <div className="flex gap-2"><div className="h-4 bg-surface-hover rounded-md w-1/4"></div><div className="h-4 bg-surface-hover rounded-md w-1/4"></div></div>
              </div>
            </div>
          ))
        ) : listings.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-500">
            <p className="text-xl">No items found matching "{searchQuery}"</p>
          </div>
        ) : (
          listings.map((listing, i) => (
            <Link 
              key={listing.id} 
              to={`/listing/${listing.id}`} 
              className="glass-panel overflow-hidden group hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="h-52 bg-surface-hover relative overflow-hidden">
                {listing.imageUrl ? (
                  <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-medium">No Image</div>
                )}
                <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-semibold border border-white/10 text-white shadow-lg">
                  {listing.category}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg text-white mb-1 truncate">{listing.title}</h3>
                <p className="text-primary-400 font-display font-bold text-2xl mb-3">₹{listing.price.toLocaleString('en-IN')}</p>
                <div className="flex items-center justify-between text-xs font-medium text-gray-400 mb-4">
                  <span className="px-2 py-1 bg-surface-hover rounded-md border border-white/5">{listing.condition}</span>
                  <span className={`px-2 py-1 rounded-md border ${listing.availability === 'AVAILABLE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                    {listing.availability}
                  </span>
                </div>
                <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-sm font-bold shadow-md">
                    {listing.seller.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-200">{listing.seller.name}</span>
                    {listing.seller.verified && <span className="text-blue-400 text-[10px] uppercase tracking-wider font-bold">Verified Student</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
