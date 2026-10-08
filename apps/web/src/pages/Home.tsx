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

  if (loading) return <div>Loading marketplace...</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold">Discover Campus Items</h2>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for textbooks, electronics..." 
          className="w-full md:w-80 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {listings.map(listing => (
          <Link key={listing.id} to={`/listing/${listing.id}`} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-colors">
            <div className="h-48 bg-gray-700 flex items-center justify-center">
              {listing.imageUrl ? <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" /> : <span className="text-gray-500">No Image</span>}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-lg">{listing.title}</h3>
              <p className="text-blue-400 font-bold text-xl mt-1">₹{listing.price}</p>
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>{listing.condition}</span>
                <span className={listing.availability === 'AVAILABLE' ? 'text-green-400' : 'text-yellow-400'}>{listing.availability}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-xs flex items-center justify-center">
                  {listing.seller.name.charAt(0)}
                </div>
                <span className="text-sm">{listing.seller.name}</span>
                {listing.seller.verified && <span className="text-blue-400 text-xs ml-auto">✓ Verified</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
