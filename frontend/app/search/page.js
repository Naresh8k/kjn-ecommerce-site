'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [query, setQuery] = useState(q);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    if (!q) return;
    setQuery(q);
    const search = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(q)}&sort=${sort}`);
        setResults(res.data.data || []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    };
    search();
  }, [q, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '24px 0 80px' }}>
      <div className="container">
        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
          <div style={{ position: 'relative', maxWidth: 600 }}>
            <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', width: 20 }} />
            <input className="input" style={{ paddingLeft: 48, paddingRight: 120, borderRadius: 99, height: 52, fontSize: 15 }}
              placeholder="Search products..." value={query}
              onChange={(e) => setQuery(e.target.value)} autoFocus />
            {query && (
              <button type="button" onClick={() => setQuery('')} style={{ position: 'absolute', right: 110, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X style={{ width: 18, color: '#9CA3AF' }} />
              </button>
            )}
            <button type="submit" className="btn btn-primary btn-sm" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
              Search
            </button>
          </div>
        </form>

        {/* Results Header */}
        {q && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 14, color: '#6B7280' }}>
              {loading ? 'Searching...' : `${results.length} results for `}
              {!loading && <strong style={{ color: '#1F2937' }}>"{q}"</strong>}
            </p>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '2px solid #e5e7eb', fontWeight: 600, fontSize: 13, background: 'white' }}>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="discount">Best Discount</option>
            </select>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="products-grid">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} style={{ borderRadius: 12 }}>
                <div className="skeleton" style={{ height: 180, borderRadius: 12 }} />
                <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton" style={{ height: 12, borderRadius: 4, width: '60%' }} />
                  <div className="skeleton" style={{ height: 14, borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 20, borderRadius: 4, width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="products-grid">
            {results.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : q ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>No results found</h3>
            <p style={{ color: '#6B7280', fontSize: 14 }}>Try different keywords or browse our categories</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🌾</div>
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Search for products</h3>
            <p style={{ color: '#6B7280', fontSize: 14 }}>Find farm equipment, tools and more</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense><SearchContent /></Suspense>;
}