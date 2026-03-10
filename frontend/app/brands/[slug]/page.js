'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  SlidersHorizontal, ChevronRight, X, ChevronDown, Check,
  ArrowUpDown, Package
} from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';

const RS = '\u20B9';

const SORTS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'discount',   label: 'Best Discount' },
];

const PRICE_PRESETS = [
  ['0', '500'],
  ['500', '1000'],
  ['1000', '5000'],
  ['5000', ''],
];

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      <div className="skeleton" style={{ height: 200 }} />
      <div className="p-3 space-y-2">
        <div className="skeleton h-2.5 rounded w-3/5" />
        <div className="skeleton h-3.5 rounded" />
        <div className="skeleton h-3.5 rounded w-4/5" />
        <div className="skeleton h-5 rounded w-2/5" />
        <div className="skeleton h-9 rounded-xl" />
      </div>
    </div>
  );
}

export default function BrandPage() {
  const { slug } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  const LIMIT = 12;

  const fetchProducts = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: LIMIT, sort });
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      const res = await api.get(`/brands/${slug}/products?${params}`);
      setBrand(res.data.brand || null);
      setProducts(res.data.data || []);
      const pagination = res.data.pagination || {};
      setTotal(pagination.total || 0);
      setTotalPages(Math.ceil((pagination.total || 0) / LIMIT));
      setPage(pg);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [slug, sort, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(1); }, [slug, sort]);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const applyFilters = () => { fetchProducts(1); setSortOpen(false); };
  const clearFilters = () => { setMinPrice(''); setMaxPrice(''); fetchProducts(1); };

  const activeSortLabel = SORTS.find((s) => s.value === sort)?.label || 'Newest First';
  const hasActiveFilters = !!(minPrice || maxPrice);

  const paginationPages = (() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
      .reduce((acc, p, i, arr) => {
        if (i > 0 && arr[i - 1] !== p - 1) acc.push('dot-' + p);
        acc.push(p);
        return acc;
      }, []);
  })();

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)' }} className="py-7">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1.5 text-xs text-white/70 mb-3">
            <Link href="/" className="text-white/80 hover:text-white font-semibold transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/brands" className="text-white/80 hover:text-white font-semibold transition-colors">Brands</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold">{brand?.name || '...'}</span>
          </div>
          <h1 className="font-heading font-extrabold text-white mb-1" style={{ fontSize: 'clamp(20px, 4vw, 30px)' }}>
            {brand?.name || 'Loading...'}
          </h1>
          <p className="text-white/70 text-sm font-semibold">{total} products</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-5">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-colors relative ${
              showFilters
                ? 'bg-primary-900 border-primary-900 text-white'
                : 'bg-white border-gray-200 text-gray-700 hover:border-primary-900'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center">
                !
              </span>
            )}
          </button>

          {/* Sort dropdown */}
          <div className="relative ml-auto" ref={sortRef}>
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-primary-900 transition-colors min-w-44"
            >
              <ArrowUpDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="flex-1 text-left">{activeSortLabel}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl border border-gray-200 shadow-xl z-30 overflow-hidden py-1">
                {SORTS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSort(opt.value); setSortOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors ${
                      sort === opt.value ? 'bg-primary-50 text-primary-900' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 flex-shrink-0 ${sort === opt.value ? 'text-primary-900' : 'opacity-0'}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-sm text-gray-900">Filter by Price</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
            <div className="flex gap-3 flex-wrap items-end">
              <div>
                <label className="block text-xs text-gray-500 font-semibold mb-1">Min ({RS})</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-32 px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-900 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-semibold mb-1">Max ({RS})</label>
                <input
                  type="number"
                  placeholder="Any"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-32 px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-900 focus:outline-none transition-colors"
                />
              </div>
              <button
                onClick={applyFilters}
                className="px-5 py-2 bg-primary-900 text-white rounded-xl text-sm font-bold hover:bg-primary-800 transition-colors"
              >
                Apply
              </button>
            </div>
            {/* Quick presets */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {PRICE_PRESETS.map(([mn, mx]) => {
                const label = mx ? `${RS}${mn}–${mx}` : `${RS}${mn}+`;
                const active = minPrice === mn && maxPrice === mx;
                return (
                  <button
                    key={label}
                    onClick={() => { setMinPrice(mn); setMaxPrice(mx); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      active ? 'bg-primary-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-xs text-gray-500 font-semibold">Active:</span>
            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
                {minPrice && maxPrice
                  ? `${RS}${minPrice}–${RS}${maxPrice}`
                  : minPrice
                  ? `Min ${RS}${minPrice}`
                  : `Max ${RS}${maxPrice}`}
                <button onClick={clearFilters}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array(LIMIT).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">Try adjusting or clearing your filters</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 bg-primary-900 text-white rounded-xl font-bold text-sm hover:bg-primary-800 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 font-semibold mb-3">
              <span className="font-extrabold text-gray-900">{total}</span> products found
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-10 flex-wrap">
                <button
                  onClick={() => fetchProducts(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-gray-200 disabled:opacity-40 hover:border-primary-900 transition-colors"
                >
                  Prev
                </button>
                {paginationPages.map((p) =>
                  typeof p === 'string' ? (
                    <span key={p} className="w-10 text-center text-gray-400 font-bold">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => fetchProducts(p)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                        page === p
                          ? 'bg-primary-900 text-white shadow-sm'
                          : 'border-2 border-gray-200 text-gray-700 hover:border-primary-900'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => fetchProducts(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-gray-200 disabled:opacity-40 hover:border-primary-900 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
