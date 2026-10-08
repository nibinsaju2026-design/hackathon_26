import { BadgeCheck, PackageSearch, ShieldCheck, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Listing } from '../lib/types';

export function PageHeading({ eyebrow, title, description, action }: {
  eyebrow?: string; title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const key = status.toLowerCase();
  return <span className={`status-pill status-${key}`}>{status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (char) => char.toUpperCase())}</span>;
}

export function VerifiedBadge({ small = false }: { small?: boolean }) {
  return (
    <span className={`verified-badge ${small ? 'verified-small' : ''}`} title="Verified Pondicherry University student">
      <BadgeCheck size={small ? 13 : 15} /> {small ? 'Verified' : 'Verified student'}
    </span>
  );
}

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link to={`/listing/${listing.id}`} className="listing-card glass-panel group">
      <div className="listing-image-wrap">
        {listing.imageUrl
          ? <img src={listing.imageUrl} alt={listing.title} className="listing-image" />
          : <div className="listing-placeholder"><PackageSearch size={34} /><span>Campus find</span></div>}
        <span className="category-tag">{listing.category}</span>
        <StatusPill status={listing.availability} />
      </div>
      <div className="listing-content">
        <div className="flex items-start justify-between gap-3">
          <h3 className="listing-title">{listing.title}</h3>
          <p className="listing-price">₹{Number(listing.price).toLocaleString('en-IN')}</p>
        </div>
        <p className="listing-condition">{listing.condition}{listing.hostel ? ` · ${listing.hostel}` : ''}</p>
        <div className="seller-line">
          <div className="avatar avatar-small">{listing.seller?.name?.charAt(0).toUpperCase() ?? 'S'}</div>
          <span className="seller-name">{listing.seller?.name ?? 'Campus seller'}</span>
          {listing.seller?.verified && <ShieldCheck size={15} className="verified-icon" aria-label="Verified student" />}
        </div>
      </div>
    </Link>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="empty-state glass-panel">
      <div className="empty-icon"><PackageSearch size={25} /></div>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="listing-grid">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="glass-panel skeleton-card" aria-label="Loading listing">
          <div className="skeleton-block skeleton-image" />
          <div className="skeleton-block skeleton-line" />
          <div className="skeleton-block skeleton-line short" />
          <div className="skeleton-block skeleton-line tiny" />
        </div>
      ))}
    </div>
  );
}

export function Rating({ value, count }: { value: string | number | null; count?: number }) {
  return <span className="rating"><Star size={15} fill="currentColor" /> {value ?? 'New'}{count !== undefined && <span className="muted"> ({count})</span>}</span>;
}
