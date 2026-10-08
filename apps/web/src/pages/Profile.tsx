import { useEffect, useState } from 'react';
import { BadgeCheck, CalendarDays, PackageCheck, Star, Tag } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { api, getStoredUser } from '../lib/api';
import type { SellerProfile } from '../lib/types';
import { EmptyState, ListingCard, PageHeading, Rating, SkeletonGrid, VerifiedBadge } from '../components/UI';

export default function Profile() {
  const { id } = useParams();
  const user = getStoredUser();
  const profileId = id ?? user?.id;
  const isOwnProfile = !id || id === user?.id;
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profileId) {
      setError('Sign in to view your profile.');
      setLoading(false);
      return;
    }
    setLoading(true);
    api<SellerProfile>(`/api/sellers/${profileId}`)
      .then(setProfile)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load this profile.'))
      .finally(() => setLoading(false));
  }, [profileId]);

  if (loading) return <div className="animate-pulse"><div className="glass-panel h-36 mb-6" /><SkeletonGrid count={3} /></div>;
  if (error || !profile) return <EmptyState title="Profile unavailable" description={error || 'This campus profile could not be found.'} action={<Link to={user ? '/dashboard' : '/login'} className="button-primary">{user ? 'Back to dashboard' : 'Sign in'}</Link>} />;

  const activeListings = profile.listings.filter((listing) => listing.availability === 'AVAILABLE');
  const reservedListings = profile.listings.filter((listing) => listing.availability === 'RESERVED');
  const pastListings = profile.listings.filter((listing) => listing.availability === 'SOLD');

  return (
    <div>
      <PageHeading eyebrow="Campus community" title={isOwnProfile ? 'Your profile' : 'Student profile'} description="A little more about the person behind the listing." />
      <section className="profile-header glass-panel">
        <span className="avatar">{profile.name.charAt(0).toUpperCase()}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h1>{profile.name}</h1>{profile.verified && <VerifiedBadge />}</div>
          <p className="muted text-xs m-0">Pondicherry University student</p>
          <div className="profile-stats"><span><Rating value={profile.stats.averageRating} count={profile.stats.reviewCount} /></span><span><PackageCheck size={14} className="inline mr-1" />{profile.stats.completedDeals} past sales</span><span><CalendarDays size={14} className="inline mr-1" />Joined {new Date(profile.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span></div>
        </div>
        {isOwnProfile && <Link to="/dashboard" className="button-secondary"><Tag size={14} /> Dashboard</Link>}
      </section>
      <section className="feature-section">
        <div className="section-heading"><div><p className="eyebrow">Available now</p><h2>Current listings</h2></div></div>
        {activeListings.length ? <div className="listing-grid">{activeListings.map((listing) => <ListingCard key={listing.id} listing={{ ...listing, seller: { id: profile.id, name: profile.name, verified: profile.verified } }} />)}</div> : <EmptyState title="No active listings" description="This student has no items available right now." />}
      </section>
      {reservedListings.length > 0 && <section className="feature-section">
        <div className="section-heading"><div><p className="eyebrow">In progress</p><h2>Reserved listings</h2></div></div>
        <div className="listing-grid">{reservedListings.map((listing) => <ListingCard key={listing.id} listing={{ ...listing, seller: { id: profile.id, name: profile.name, verified: profile.verified } }} />)}</div>
      </section>}
      {pastListings.length > 0 && <section className="feature-section">
        <div className="section-heading"><div><p className="eyebrow">Passed on</p><h2>Past listings</h2></div></div>
        <div className="listing-grid">{pastListings.map((listing) => <ListingCard key={listing.id} listing={{ ...listing, seller: { id: profile.id, name: profile.name, verified: profile.verified } }} />)}</div>
      </section>}
      {profile.stats.reviewCount > 0 && <div className="info-box"><Star size={14} className="inline mr-1" /> Seller rating is based on {profile.stats.reviewCount} completed transaction review{profile.stats.reviewCount === 1 ? '' : 's'}.</div>}
      {isOwnProfile && user?.role !== 'SELLER' && <p className="muted mt-4 text-xs"><BadgeCheck size={13} className="inline mr-1" />You can create listings with this account—no separate seller signup needed.</p>}
    </div>
  );
}
