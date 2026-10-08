import { useEffect, useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Listing } from '../lib/types';
import useRequireAuth from '../lib/useRequireAuth';
import { useToast } from '../components/ToastProvider';
import { EmptyState, ListingCard, PageHeading, SkeletonGrid } from '../components/UI';

type WishlistEntry = { id: string; listing: Listing };

export default function Wishlist() {
  const user = useRequireAuth();
  const toast = useToast();
  const [items, setItems] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    setLoading(true);
    try { setItems(await api<WishlistEntry[]>('/api/wishlist', { auth: true })); setError(''); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load saved items.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const remove = async (listingId: string) => {
    try {
      await api(`/api/wishlist/${listingId}`, { method: 'DELETE', auth: true });
      setItems((current) => current.filter((entry) => entry.listing.id !== listingId));
      toast('Removed from your saved items.');
    } catch (err) { toast(err instanceof Error ? err.message : 'Could not remove this item.', 'error'); }
  };

  if (!user) return null;
  return (
    <div>
      <PageHeading eyebrow="Keep an eye on it" title="Saved items" description="Listings you want to come back to." action={<Link to="/browse" className="button-secondary"><Heart size={14} /> Browse items</Link>} />
      {loading ? <SkeletonGrid count={3} /> : error ? <EmptyState title="Saved items unavailable" description={error} action={<button className="button-secondary" onClick={() => void load()}>Try again</button>} /> : items.length === 0 ? <EmptyState title="Your saved list is empty" description="Save a campus find so it is easy to spot later." action={<Link to="/browse" className="button-primary">Explore listings</Link>} /> : (
        <div className="listing-grid">{items.map(({ id, listing }) => <div className="relative" key={id}><ListingCard listing={listing} /><button className="button-danger absolute right-3 bottom-3 !min-h-[32px] !px-3 !text-[10px]" onClick={() => void remove(listing.id)} aria-label={`Remove ${listing.title} from saved items`}><Trash2 size={13} /> Remove</button></div>)}</div>
      )}
    </div>
  );
}
