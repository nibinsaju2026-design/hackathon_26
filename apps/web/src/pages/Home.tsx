import { useEffect, useState } from 'react';
import { ArrowRight, BadgeCheck, BookOpen, Clock3, HeartHandshake, History, Search, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Listing } from '../lib/types';
import { ListingCard } from '../components/UI';

const features = [
  { icon: Search, title: 'Searchable listings', text: 'Find the exact thing you need, without scrolling through old chats.' },
  { icon: Clock3, title: 'Clear availability', text: 'Know at a glance what is available, reserved, or already sold.' },
  { icon: ShieldCheck, title: 'Verified students', text: 'Trade within a community built around Pondicherry University.' },
  { icon: HeartHandshake, title: 'Offers & negotiation', text: 'Make an offer and agree on a campus pickup that works for you.' },
  { icon: History, title: 'Transaction history', text: 'Keep a clear record of completed campus transactions.' },
];

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingError, setListingError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api<{ data: Listing[] }>('/api/listings?limit=3')
      .then((result) => { setListings(result.data); setListingError(''); })
      .catch((err) => setListingError(err instanceof Error ? err.message : 'Could not load recent listings.'));
  }, []);

  const [query, setQuery] = useState('');
  const browse = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(`/browse?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="animate-fade-in">
      <section className="hero glass-panel">
        <div className="hero-content">
          <span className="hero-kicker"><Sparkles size={14} /> The campus marketplace, reimagined</span>
          <h1>Buy and sell on campus, <span className="gradient-text">without WhatsApp chaos.</span></h1>
          <p>A better way for Pondicherry University students to pass things on, find a great deal, and make campus life a little easier.</p>
          <form className="search-hero" onSubmit={browse}>
            <Search size={19} className="muted" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search books, cycles, electronics..." aria-label="Search listings" />
            <button className="button-primary" type="submit">Search <ArrowRight size={15} /></button>
          </form>
          <div className="hero-ctas">
            <Link to="/login" className="button-primary"><BadgeCheck size={16} /> Sign in with university email</Link>
            <Link to="/browse" className="button-secondary">Explore listings</Link>
          </div>
          <div className="hero-proof"><ShieldCheck size={15} /> A student-to-student marketplace, just for Pondicherry University</div>
        </div>
      </section>

      <section className="problem-solution">
        <article className="info-card glass-panel">
          <span className="eyebrow">The old way</span>
          <h2>Great finds get lost in the scroll.</h2>
          <p>WhatsApp groups bury listings under messages. Prices are hard to compare, availability is anyone’s guess, and sellers have to keep reposting.</p>
        </article>
        <article className="info-card glass-panel">
          <span className="eyebrow">A campus-first fix</span>
          <h2>Everything you need, all in one place.</h2>
          <p>Browse searchable listings, check status, make a structured offer, and arrange a pickup—right here in your university community.</p>
        </article>
      </section>

      <section className="feature-section">
        <div className="section-heading"><div><p className="eyebrow">Made for campus life</p><h2>Less hunting. Better handoffs.</h2></div></div>
        <div className="feature-grid">
          {features.map(({ icon: Icon, title, text }) => (
            <article className="feature-card glass-panel" key={title}>
              <span className="feature-icon"><Icon size={17} /></span><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="feature-section">
        <div className="section-heading">
          <div><p className="eyebrow">Fresh from campus</p><h2>Recently listed</h2></div>
          <Link className="button-secondary" to="/browse">See all listings <ArrowRight size={14} /></Link>
        </div>
        {listingError
          ? <div className="info-card glass-panel flex items-center gap-3 muted"><BookOpen size={18} /><span>Recent listings could not be loaded: {listingError}. You can retry from <Link className="text-[var(--accent)]" to="/browse">Explore</Link>.</span></div>
          : listings.length > 0
            ? <div className="listing-grid">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>
            : <div className="info-card glass-panel flex items-center gap-3 muted"><BookOpen size={18} /> Be the first to post something for your campus community.</div>}
      </section>

      <section className="info-card glass-panel flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div><p className="eyebrow">Your campus. Your community.</p><h2 className="m-0 text-xl">Ready to find your next campus essential?</h2></div>
        <Link to="/browse" className="button-primary">Start exploring <TrendingUp size={15} /></Link>
      </section>
    </div>
  );
}
