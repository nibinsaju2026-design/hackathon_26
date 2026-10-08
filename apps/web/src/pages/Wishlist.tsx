import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:8080/api/wishlist', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setWishlist(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div>Loading wishlist...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Saved Items</h2>
      
      {wishlist.length === 0 ? (
        <div className="bg-gray-800 p-8 text-center rounded-lg border border-gray-700">
          <p className="text-gray-400">Your wishlist is empty. Start exploring!</p>
          <Link to="/" className="inline-block mt-4 text-blue-400 hover:underline">Browse Marketplace</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map(item => (
            <Link key={item.id} to={`/listing/${item.listing.id}`} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-colors">
              <div className="h-48 bg-gray-700 flex items-center justify-center">
                {item.listing.imageUrl ? <img src={item.listing.imageUrl} alt={item.listing.title} className="w-full h-full object-cover" /> : <span className="text-gray-500">No Image</span>}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg truncate">{item.listing.title}</h3>
                <p className="text-blue-400 font-bold text-xl mt-1">₹{item.listing.price}</p>
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span className={item.listing.availability === 'AVAILABLE' ? 'text-green-400' : 'text-yellow-400'}>{item.listing.availability}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
