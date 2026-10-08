import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Order } from '../lib/types';
import useRequireAuth from '../lib/useRequireAuth';
import { useToast } from '../components/ToastProvider';
import { EmptyState, PageHeading, StatusPill } from '../components/UI';

export default function Orders() {
  const user = useRequireAuth();
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<Order | null>(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setOrders(await api<Order[]>('/api/orders', { auth: true }));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load transactions.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, []);

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reviewing) return;
    try {
      await api(`/api/orders/${reviewing.id}/review`, { method: 'POST', auth: true, body: JSON.stringify({ rating: Number(rating), comment: comment.trim() || undefined }) });
      toast('Thanks for sharing your experience.');
      setReviewing(null);
      setComment('');
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not submit your review.', 'error');
    }
  };

  if (!user) return null;
  return (
    <div>
      <PageHeading eyebrow="Your trades" title="Transactions" description="Every campus exchange, in one place." />
      {loading ? <div className="glass-panel p-8 muted animate-pulse">Loading transaction history…</div> : error ? <EmptyState title="Transactions unavailable" description={error} action={<button className="button-secondary" onClick={() => void load()}>Try again</button>} /> : orders.length === 0 ? <EmptyState title="No transactions yet" description="When an offer is accepted, the transaction will appear here." action={<Link to="/browse" className="button-primary">Explore the marketplace</Link>} /> : (
        <div className="data-table-wrap glass-panel"><table className="data-table"><thead><tr><th>Item</th><th>Student</th><th>Agreed price</th><th>Status</th><th>Review</th></tr></thead><tbody>{orders.map((order) => {
          const other = order.buyer.id === user.id ? order.seller.name : order.buyer.name;
          const canReview = order.status === 'COMPLETED' && order.buyer.id === user.id && !order.review;
          return <tr key={order.id}><td><Link to={`/listing/${order.listing.id}`} className="font-semibold hover:text-[var(--accent)]">{order.listing.title}</Link></td><td className="muted">{other}</td><td>₹{Number(order.price).toLocaleString('en-IN')}</td><td><StatusPill status={order.status} /></td><td>{order.review ? <span className="muted"><Star size={13} className="inline text-yellow-400" fill="currentColor" /> {order.review.rating}/5</span> : canReview ? <button className="button-secondary !min-h-[32px] !px-3 !text-[10px]" onClick={() => setReviewing(order)}>Leave review</button> : <span className="muted">—</span>}</td></tr>;
        })}</tbody></table></div>
      )}
      {reviewing && <div className="modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setReviewing(null); }}>
        <section className="auth-card glass-panel" role="dialog" aria-modal="true" aria-labelledby="review-title">
          <h2 id="review-title" className="text-xl font-bold">How did it go?</h2><p>Leave a review for your exchange of {reviewing.listing.title}.</p>
          <form className="grid gap-4" onSubmit={submitReview}>
            <label><span className="field-label">Rating</span><select className="select-field" value={rating} onChange={(event) => setRating(event.target.value)}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5 stars</option>)}</select></label>
            <label><span className="field-label">Comment <span className="muted">(optional)</span></span><textarea className="textarea-field" maxLength={1000} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Share a helpful note…" /></label>
            <div className="flex justify-end gap-2"><button type="button" className="button-secondary" onClick={() => setReviewing(null)}>Cancel</button><button type="submit" className="button-primary">Send review</button></div>
          </form>
        </section>
      </div>}
    </div>
  );
}
