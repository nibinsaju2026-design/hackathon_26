import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, Check, CircleDollarSign, PackageCheck, PackagePlus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { DashboardData, Offer } from '../lib/types';
import useRequireAuth from '../lib/useRequireAuth';
import { useToast } from '../components/ToastProvider';
import { EmptyState, PageHeading, StatusPill } from '../components/UI';

type DashboardTab = 'listings' | 'received' | 'sent' | 'history';
const tabs: { id: DashboardTab; label: string }[] = [
  { id: 'listings', label: 'My listings' },
  { id: 'received', label: 'Offers received' },
  { id: 'sent', label: 'Offers sent' },
  { id: 'history', label: 'Transaction history' }
];

export default function Dashboard() {
  const user = useRequireAuth();
  const toast = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<DashboardTab>('listings');
  const [counterId, setCounterId] = useState('');
  const [counterPrice, setCounterPrice] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await api<DashboardData>('/api/dashboard', { auth: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const processOffer = async (offer: Offer, action: 'ACCEPT' | 'REJECT' | 'COUNTER', price?: number) => {
    setBusyId(offer.id);
    try {
      await api(`/api/offers/${offer.id}`, { method: 'PATCH', auth: true, body: JSON.stringify({ action, ...(price ? { price } : {}) }) });
      toast(action === 'ACCEPT' ? 'Offer accepted. A transaction is now in progress.' : action === 'REJECT' ? 'Offer declined.' : 'Counter-offer sent.');
      setCounterId('');
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not update this offer.', 'error');
    } finally {
      setBusyId('');
    }
  };

  const completeOrder = async (id: string) => {
    setBusyId(id);
    try {
      await api(`/api/orders/${id}/complete`, { method: 'POST', auth: true });
      toast('Transaction marked as complete.');
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not update this transaction.', 'error');
    } finally {
      setBusyId('');
    }
  };

  if (!user) return null;
  const offerCards = (offers: Offer[], received: boolean) => offers.length ? offers.map((offer) => {
    const canAct = received ? offer.status === 'PENDING' : offer.status === 'COUNTERED';
    const person = received ? offer.buyer?.name : offer.listing?.seller?.name;
    return (
      <article key={offer.id} className="offer-card glass-panel">
        <div className="offer-card-head">
          <div className="min-w-0"><Link className="font-semibold text-sm hover:text-[var(--accent)]" to={`/listing/${offer.listingId}`}>{offer.listing?.title ?? 'Marketplace item'}</Link><p className="muted text-xs mt-1">{received ? 'Offer from' : 'Offer to'} {person ?? 'student'}{received && offer.buyer?.verified && <BadgeCheck size={13} className="inline ml-1 verified-icon" />}</p></div>
          <StatusPill status={offer.status} />
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-3"><strong className="text-lg text-[var(--accent)]">₹{Number(offer.price).toLocaleString('en-IN')}</strong><span className="offer-chip">{offer.pickupPoint ?? 'Pickup to arrange'}</span><span className="offer-chip">{offer.pickupDate ?? 'Date TBD'}{offer.pickupTime ? ` · ${offer.pickupTime}` : ''}</span></div>
        {offer.message && <p className="detail-description !text-xs !mb-0 mt-3">{offer.message}</p>}
        {canAct && <div className="offer-actions">
          <button className="button-primary !min-h-[34px] !px-3 !text-xs" disabled={busyId === offer.id} onClick={() => void processOffer(offer, 'ACCEPT')}><Check size={13} /> Accept</button>
          <button className="button-secondary !min-h-[34px] !px-3 !text-xs" disabled={busyId === offer.id} onClick={() => { setCounterId(counterId === offer.id ? '' : offer.id); setCounterPrice(String(offer.price)); }}><CircleDollarSign size={13} /> Counter</button>
          <button className="button-danger !min-h-[34px] !px-3 !text-xs" disabled={busyId === offer.id} onClick={() => void processOffer(offer, 'REJECT')}><X size={13} /> Decline</button>
          {counterId === offer.id && <form className="flex w-full gap-2 mt-2" onSubmit={(event) => { event.preventDefault(); void processOffer(offer, 'COUNTER', Number(counterPrice)); }}>
            <input className="field !w-auto flex-1" type="number" min="1" required value={counterPrice} onChange={(event) => setCounterPrice(event.target.value)} aria-label="Counter-offer price" />
            <button className="button-primary !min-h-[40px]" type="submit" disabled={busyId === offer.id}>Send counter</button>
          </form>}
        </div>}
      </article>
    );
  }) : <EmptyState title="No offers here yet" description={received ? 'When a student makes an offer on one of your listings, it will show up here.' : 'When you make an offer on a campus listing, you can track it here.'} action={!received && <Link to="/browse" className="button-primary">Browse listings</Link>} />;

  return (
    <div>
      <PageHeading eyebrow="Your marketplace" title={`Good to see you, ${user.name.split(' ')[0]}.`} description="Keep track of your listings, negotiate offers, and see how your campus trades are going." action={<Link to="/post" className="button-primary"><PackagePlus size={15} /> Post an item</Link>} />
      <div className="metric-grid">
        <div className="metric-card glass-panel"><p>Active listings</p><strong>{data?.metrics.activeListings ?? '—'}</strong></div>
        <div className="metric-card glass-panel"><p>Offers to review</p><strong className="text-[var(--accent)]">{data?.metrics.offersReceived ?? '—'}</strong></div>
        <div className="metric-card glass-panel"><p>Completed deals</p><strong className="text-[var(--teal)]">{data?.metrics.completedDeals ?? '—'}</strong></div>
      </div>
      <div className="tabs" role="tablist" aria-label="Dashboard sections">
        {tabs.map((item) => <button key={item.id} className={`tab ${tab === item.id ? 'tab-active' : ''}`} role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)}>{item.label}{item.id === 'received' && (data?.metrics.offersReceived ?? 0) > 0 ? ` · ${data?.metrics.offersReceived}` : ''}</button>)}
      </div>
      {loading ? <div className="glass-panel p-8 muted animate-pulse">Loading your marketplace activity…</div> : error ? <EmptyState title="Dashboard unavailable" description={error} action={<button className="button-secondary" onClick={() => void load()}>Try again</button>} /> : (
        tab === 'listings' ? data?.listings.length ? <div className="data-table-wrap glass-panel"><table className="data-table"><thead><tr><th>Item</th><th>Price</th><th>Condition</th><th>Status</th><th>Listed</th></tr></thead><tbody>{data.listings.map((listing) => <tr key={listing.id}><td><Link to={`/listing/${listing.id}`} className="font-semibold hover:text-[var(--accent)]">{listing.title}</Link><span className="block muted text-[10px] mt-1">{listing.category}</span></td><td>₹{Number(listing.price).toLocaleString('en-IN')}</td><td className="muted">{listing.condition}</td><td><StatusPill status={listing.availability} /></td><td className="muted">{new Date(listing.createdAt).toLocaleDateString('en-IN')}</td></tr>)}</tbody></table></div> : <EmptyState title="Your first listing is waiting" description="Give an item a second life with someone else on campus." action={<Link to="/post" className="button-primary"><PackagePlus size={14} /> Post an item</Link>} />
        : tab === 'received' ? offerCards(data?.offersReceived ?? [], true)
        : tab === 'sent' ? offerCards(data?.offersSent ?? [], false)
        : data?.orders.length ? <div className="data-table-wrap glass-panel"><table className="data-table"><thead><tr><th>Item</th><th>Other student</th><th>Price</th><th>Status</th><th>Action</th></tr></thead><tbody>{data.orders.map((order) => { const other = order.buyer.id === user.id ? order.seller.name : order.buyer.name; return <tr key={order.id}><td><Link to={`/listing/${order.listing.id}`} className="font-semibold hover:text-[var(--accent)]">{order.listing.title}</Link></td><td className="muted">{other}</td><td>₹{Number(order.price).toLocaleString('en-IN')}</td><td><StatusPill status={order.status} />{order.review && <span className="block muted text-[10px] mt-1">Rated {order.review.rating}/5</span>}</td><td>{order.status === 'PENDING' ? <button className="button-secondary !min-h-[32px] !px-3 !text-[10px]" disabled={busyId === order.id} onClick={() => void completeOrder(order.id)}><PackageCheck size={13} /> Complete</button> : <span className="muted text-xs">—</span>}</td></tr>; })}</tbody></table></div> : <EmptyState title="Your story starts here" description="Completed and in-progress campus transactions will appear in this history." action={<Link to="/browse" className="button-primary">Find something</Link>} />
      )}
    </div>
  );
}
