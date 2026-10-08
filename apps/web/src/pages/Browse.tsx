import { useCallback, useEffect, useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { Listing } from '../lib/types';
import { EmptyState, ListingCard, PageHeading, SkeletonGrid } from '../components/UI';

const categories = ['All items', 'Books', 'Electronics', 'Cycles', 'Hostel Items', 'Furniture'];
const conditions = ['Any condition', 'Like New', 'Good', 'Fair', 'Well Used'];

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [category, setCategory] = useState(params.get('category') ?? 'All items');
  const [condition, setCondition] = useState('');
  const [hostel, setHostel] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError('');
    const query = new URLSearchParams();
    if (search.trim()) query.set('search', search.trim());
    if (category !== 'All items') query.set('category', category);
    if (condition) query.set('condition', condition);
    if (hostel.trim()) query.set('hostel', hostel.trim());
    if (minPrice) query.set('minPrice', minPrice);
    if (maxPrice) query.set('maxPrice', maxPrice);
    query.set('limit', '48');
    try {
      const result = await api<{ data: Listing[] }>(`/api/listings?${query.toString()}`);
      setListings(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load listings.');
    } finally {
      setLoading(false);
    }
  }, [search, category, condition, hostel, minPrice, maxPrice]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadListings(); }, 250);
    return () => window.clearTimeout(timer);
  }, [loadListings]);

  useEffect(() => {
    const querySearch = params.get('search') ?? '';
    const queryCategory = params.get('category') ?? 'All items';
    if (querySearch !== search) setSearch(querySearch);
    if (queryCategory !== category) setCategory(queryCategory);
  }, [params]);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (search) next.set('search', search); else next.delete('search');
    if (category !== 'All items') next.set('category', category); else next.delete('category');
    if (next.toString() !== params.toString()) setParams(next, { replace: true });
  }, [search, category, params, setParams]);

  const resetFilters = () => {
    setSearch(''); setCategory('All items'); setCondition(''); setHostel(''); setMinPrice(''); setMaxPrice('');
  };

  return (
    <div>
      <PageHeading eyebrow="Discover" title="Find it on campus." description="Good finds, right around the corner. Search and filter listings from your university community." />
      <div className="filter-bar glass-panel">
        <label className="filter-item"><span className="field-label">Search</span><div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 muted" /><input className="field !pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="What are you looking for?" /></div></label>
        <label className="filter-item"><span className="field-label">Condition</span><select className="select-field" value={condition} onChange={(event) => setCondition(event.target.value)}><option value="">Any condition</option>{conditions.slice(1).map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="filter-item"><span className="field-label">Hostel</span><input className="field" value={hostel} onChange={(event) => setHostel(event.target.value)} placeholder="Any hostel" /></label>
        <label className="filter-item"><span className="field-label">Min price (₹)</span><input className="field" type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="0" /></label>
        <label className="filter-item"><span className="field-label">Max price (₹)</span><input className="field" type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Any" /></label>
        <button className="button-secondary" onClick={resetFilters} type="button"><RotateCcw size={14} /> Clear</button>
      </div>
      <div className="chip-row" aria-label="Filter by category">
        {categories.map((value) => <button key={value} type="button" className={`category-chip ${category === value ? 'active' : ''}`} onClick={() => setCategory(value === 'All items' ? value : category === value ? 'All items' : value)}>{value}</button>)}
      </div>
      <div className="section-heading"><p className="muted text-sm">{loading ? 'Finding campus listings…' : `${listings.length} ${listings.length === 1 ? 'item' : 'items'} found`}</p></div>
      {loading ? <SkeletonGrid /> : error ? <EmptyState title="Couldn't load listings" description={error} action={<button className="button-secondary" onClick={() => void loadListings()}>Try again</button>} /> : listings.length === 0 ? <EmptyState title="No listings match those filters" description="Try a different search, or clear a filter to see more campus finds." action={<button className="button-secondary" onClick={resetFilters}>Clear filters</button>} /> : <div className="listing-grid">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}</div>}
    </div>
  );
}
