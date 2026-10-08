import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, BadgeCheck, CalendarDays, MapPin, Send, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getStoredUser } from '../lib/api';
import type { Listing, Offer } from '../lib/types';
import { useToast } from '../components/ToastProvider';
import { EmptyState, PageHeading, StatusPill, VerifiedBadge } from '../components/UI';

export default function ListingDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const currentUser = getStoredUser();
  const toast = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [pickupPoint, setPickupPoint] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadOffers = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      setOffers(await api<Offer[]>(`/api/listings/${id}/offers`, { auth: true }));
    } catch (err) {
      setOffers([]);
      if (!(err instanceof Error) || !err.message.startsWith("Only this listing's seller or offer participants")) {
        toast(err instanceof Error ? err.message : 'Could not load offer history.', 'error');
      }
    }
  }, [id, toast]);

  useEffect(() => {
    setLoading(true);
    setError('');
    api<Listing>(`/api/listings/${id}`)
      .then((result) => { setListing(result); setPrice(String(result.price)); })
      .catch((err) => setError(err instanceof Error ? err.message : 'Listing not found.'))
      .finally(() => setLoading(false));
    void loadOffers();
  }, [id, loadOffers]);

  const submitOffer = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      await api(`/api/listings/${id}/offers`, {
        method: 'POST',
        auth: true,
        body: JSON.stringify({ price: Number(price), pickupPoint, pickupDate, pickupTime, message: message.trim() || undefined })
      });
      toast('Your offer has been sent to the seller.');
      setMessage('');
      await loadOffers();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not send the offer.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="glass-panel p-8 animate-pulse muted">Loading this campus listing…</div>;
  if (error || !listing) return <EmptyState title="Listing unavailable" description={error || 'This listing may have been removed.'} action={<Link to="/browse" className="button-secondary"><ArrowLeft size={14} /> Back to browsing</Link>} />;

  const isSeller = currentUser?.id === listing.sellerId;

  return (
    <div>
      <div className="mb-5"><Link to="/browse" className="nav-link"><ArrowLeft size={15} /> Back to listings</Link></div>
      <div className="listing-detail-grid">
        <div className="detail-column">
          <div className="gallery-frame glass-panel">
            {listing.imageUrl ? <img src={listing.imageUrl} alt={listing.title} /> : <div className="listing-placeholder"><span className="text-lg">No photo for this listing</span></div>}
            <span className="category-tag">{listing.category}</span>
          </div>
          <section className="detail-card glass-panel">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="eyebrow">{listing.category}</p><h1 className="page-title !text-3xl">{listing.title}</h1></div>
              <p className="listing-price !text-2xl">₹{Number(listing.price).toLocaleString('en-IN')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-4"><StatusPill status={listing.availability} /><span className="offer-chip">{listing.condition}</span>{listing.hostel && <span className="offer-chip"><MapPin size={12} /> {listing.hostel}</span>}<span className="muted text-xs">Listed {new Date(listing.createdAt).toLocaleDateString('en-IN')}</span></div>
            <h2 className="mt-7 text-base font-semibold">About this item</h2>
            <p className="detail-description">{listing.description}</p>
          </section>
          <section className="detail-card glass-panel">
            <h2 className="text-base font-semibold">Meet the seller</h2>
            <Link to={`/profile/${listing.seller?.id ?? listing.sellerId}`} className="seller-profile-link">
              <span className="avatar">{listing.seller?.name?.charAt(0).toUpperCase() ?? 'S'}</span>
              <span className="flex-1"><strong className="block">{listing.seller?.name ?? 'Campus seller'}</strong><span className="muted text-xs">Pondicherry University community member</span></span>
              {listing.seller?.verified && <VerifiedBadge />}
            </Link>
          </section>
        </div>
        <aside className="offer-panel glass-panel">
          {isSeller ? (
            <>
              <p className="eyebrow">Your listing</p><h2 className="m-0 text-xl">Offers & interest</h2>
              <p className="page-description !text-xs">Manage the offers from your dashboard.</p>
              <Link to="/dashboard" className="button-primary w-full mt-4">Open dashboard</Link>
            </>
          ) : (
            <>
              <p className="eyebrow">Make it yours</p><h2 className="m-0 text-xl">Make an offer</h2>
              <p className="page-description !text-xs">Suggest a price and where you can meet on campus.</p>
              {listing.availability !== 'AVAILABLE' ? <div className="info-box mt-4">This item is no longer available to offer on.</div> : !currentUser ? (
                <div className="mt-5 grid gap-3"><div className="info-box">Sign in with your university email to make an offer.</div><Link to="/login" className="button-primary w-full">Sign in to make an offer</Link></div>
              ) : (
                <form onSubmit={submitOffer} className="grid gap-3 mt-5">
                  <label><span className="field-label">Your offer (₹)</span><input className="field" type="number" min="1" step="1" required value={price} onChange={(event) => setPrice(event.target.value)} /></label>
                  <label><span className="field-label">Campus pickup spot</span><input className="field" required value={pickupPoint} onChange={(event) => setPickupPoint(event.target.value)} placeholder="e.g. Main canteen" /></label>
                  <div className="grid grid-cols-2 gap-3">
                    <label><span className="field-label"><CalendarDays size={12} className="inline mr-1" />Date</span><input className="field" type="date" required value={pickupDate} onChange={(event) => setPickupDate(event.target.value)} /></label>
                    <label><span className="field-label">Time</span><input className="field" type="time" required value={pickupTime} onChange={(event) => setPickupTime(event.target.value)} /></label>
                  </div>
                  <label><span className="field-label">A note to the seller <span className="muted">(optional)</span></span><textarea className="textarea-field !min-h-[78px]" maxLength={500} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Say hello or share a pickup detail…" /></label>
                  <button className="button-primary w-full mt-1" type="submit" disabled={submitting}><Send size={14} /> {submitting ? 'Sending…' : 'Send offer'}</button>
                </form>
              )}
            </>
          )}
          {currentUser && (
            <div className="mt-6 pt-5 border-t border-[var(--border)]">
              <h3 className="m-0 text-sm font-semibold flex items-center gap-2"><BadgeCheck size={15} className="verified-icon" /> Offer history</h3>
              {offers.length === 0 ? <p className="muted text-xs mt-3">Offer history will appear here for the seller and students who have made an offer.</p> : (
                <div className="offer-list">
                  {offers.map((offer) => <article key={offer.id} className="offer-card glass-panel !shadow-none">
                    <div className="offer-card-head"><strong>₹{Number(offer.price).toLocaleString('en-IN')}</strong><StatusPill status={offer.status} /></div>
                    <p className="muted text-xs my-2">{offer.buyer?.name ?? 'Student'} · {new Date(offer.createdAt).toLocaleDateString('en-IN')}</p>
                    {offer.message && <p className="detail-description !text-xs !m-0">{offer.message}</p>}
                    <p className="muted text-[10px] mt-2">{offer.pickupPoint} · {offer.pickupDate} at {offer.pickupTime}</p>
                  </article>)}
                </div>
              )}
            </div>
          )}
          <div className="info-box mt-5 flex items-start gap-2"><ShieldCheck size={15} className="mt-0.5 shrink-0" /> Keep exchanges on campus and agree on the details before you meet.</div>
        </aside>
      </div>
    </div>
  );
}
