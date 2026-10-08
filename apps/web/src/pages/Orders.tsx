import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:8080/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [navigate]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;

    try {
      const res = await fetch(`http://localhost:8080/api/orders/${selectedOrderId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating: Number(rating), comment })
      });

      if (res.ok) {
        setReviewModalOpen(false);
        // Refresh orders to show the new review
        window.location.reload(); 
      } else {
        alert('Failed to submit review');
      }
    } catch (err) {
      alert('Error submitting review');
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
      
      {orders.length === 0 ? (
        <div className="bg-gray-800 p-8 text-center rounded-lg border border-gray-700">
          <p className="text-gray-400">You haven't made or received any orders yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => (
            <div key={order.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
              <div>
                <p className="font-semibold text-lg">{order.listing?.title || 'Unknown Item'}</p>
                <div className="text-sm text-gray-400 mt-1">
                  <p>Order ID: {order.id}</p>
                  <p>Status: <span className={order.status === 'COMPLETED' ? 'text-green-400' : 'text-yellow-400'}>{order.status}</span></p>
                  <p>Locked Price: ₹{order.price}</p>
                </div>
              </div>
              
              <div className="text-right">
                {order.status === 'COMPLETED' && !order.review && (
                   <button 
                     onClick={() => { setSelectedOrderId(order.id); setReviewModalOpen(true); }}
                     className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition-colors"
                   >
                     Leave Review
                   </button>
                )}
                {order.review && (
                  <div className="text-sm text-yellow-400">
                    ★ {order.review.rating} / 5
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-sm border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Leave a Review</h3>
            <form onSubmit={submitReview} className="flex flex-col gap-3">
              <select 
                value={rating} 
                onChange={e => setRating(e.target.value)}
                className="bg-gray-900 border border-gray-700 p-2 rounded"
              >
                <option value="5">5 Stars - Excellent</option>
                <option value="4">4 Stars - Good</option>
                <option value="3">3 Stars - Average</option>
                <option value="2">2 Stars - Poor</option>
                <option value="1">1 Star - Terrible</option>
              </select>
              <textarea 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
                placeholder="Optional feedback..."
                className="bg-gray-900 border border-gray-700 p-2 rounded h-24 resize-none"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setReviewModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
