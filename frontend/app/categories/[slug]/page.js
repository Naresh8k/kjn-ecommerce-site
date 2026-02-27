'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal, ChevronRight, X } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';

export default function CategoryPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '' });

  const fetchProducts = async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 12, sort });
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      const res = await api.get(`/categories/${slug}/products?${params}`);
      setData(res.data.category);
      setProducts(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setPage(pg);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(1); }, [slug, sort]);

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', padding: '28px 0 24px', color: 'white' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 8, opacity: 0.8 }}>
            <Link href="/" style={{ color: 'white' }}>Home</Link>
            <ChevronRight style={{ width: 12 }} />
            <Link href="/categories" style={{ color: 'white' }}>Categories</Link>
            <ChevronRight style={{ width: 12 }} />
            <span>{data?.name}</span>
          </div>
          <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 'clamp(20px, 4vw, 32px)', color: 'white', marginBottom: 4 }}>
            {data?.name || 'Loading...'}
          </h1>
          <p style={{ fontSize: 13, opacity: 0.8 }}>{total} products</p>
        </div>
      </div>

      <div className="container" style={{ padding: '20px 16px' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          <button onClick={() => setShowFilters(!showFilters)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '2px solid #e5e7eb', background: showFilters ? '#1B5E20' : 'white', color: showFilters ? 'white' : '#374151', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            <SlidersHorizontal style={{ width: 16 }} /> Filters
          </button>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '2px solid #e5e7eb', fontWeight: 600, fontSize: 13, background: 'white' }}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="discount">Best Discount</option>
          </select>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div style={{ background: 'white', borderRadius: 14, padding: '20px', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>Filter by Price</h3>
              <button onClick={() => { setFilters({ minPrice: '', maxPrice: '' }); fetchProducts(1); }} style={{ color: '#DC2626', fontSize: 12, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <input className="input" style={{ maxWidth: 150 }} placeholder="Min ₹" type="number"
                value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
              <input className="input" style={{ maxWidth: 150 }} placeholder="Max ₹" type="number"
                value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
              <button onClick={() => fetchProducts(1)} className="btn btn-primary btn-sm">Apply</button>
            </div>
          </div>
        )}

        {/* Products */}
        {loading ? (
          <div className="products-grid">
            {Array(12).fill(0).map((_, i) => (
              <div key={i}>
                <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
                <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton" style={{ height: 12, borderRadius: 4, width: '60%' }} />
                  <div className="skeleton" style={{ height: 14, borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 20, borderRadius: 4, width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>No products found</h3>
            <p style={{ color: '#6B7280' }}>Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            {/* Pagination */}
            {total > 12 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                {Array(Math.ceil(total / 12)).fill(0).map((_, i) => (
                  <button key={i} onClick={() => fetchProducts(i + 1)}
                    style={{ width: 40, height: 40, borderRadius: 10, border: '2px solid', borderColor: page === i + 1 ? '#1B5E20' : '#e5e7eb', background: page === i + 1 ? '#1B5E20' : 'white', color: page === i + 1 ? 'white' : '#374151', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}