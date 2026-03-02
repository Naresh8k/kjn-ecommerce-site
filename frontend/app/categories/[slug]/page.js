'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  SlidersHorizontal, ChevronRight, X, ChevronDown,
  Package, Check, ArrowUpDown, Home, Grid3x3
} from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';

const RS = String.fromCharCode(8377);

const NO_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%23D1D5DB' stroke-width='1'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";

const SORTS = [
  { value: 'newest',     label: 'Newest First'        },
  { value: 'price_asc',  label: 'Price: Low to High'  },
  { value: 'price_desc', label: 'Price: High to Low'  },
  { value: 'name',       label: 'Name A–Z'            },
  { value: 'discount',   label: 'Best Discount'       },
];

const PRICE_PRESETS = [
  { min: '',     max: '500',   label: 'Under ₹500'     },
  { min: '500',  max: '1000',  label: '₹500 – ₹1000'  },
  { min: '1000', max: '5000',  label: '₹1000 – ₹5000' },
  { min: '5000', max: '',      label: 'Above ₹5000'    },
];

/* ── Skeleton ── */
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded-full w-2/3" />
        <div className="h-4 bg-gray-200 rounded-full" />
        <div className="h-4 bg-gray-100 rounded-full w-4/5" />
        <div className="h-5 bg-gray-200 rounded-full w-2/5" />
        <div className="h-8 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

/* ── Collapsible filter section ── */
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-3 px-1 text-sm font-bold text-gray-800 hover:text-primary-900 transition-colors"
      >
        {title}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

/* ── Main page ── */
export default function CategoryPage() {
  const { slug } = useParams();

  const [category,    setCategory]    = useState(null);
  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [pagination,  setPagination]  = useState({ total: 0, page: 1, totalPages: 1 });
  const [page,        setPage]        = useState(1);
  const [sort,        setSort]        = useState('newest');
  const [minPrice,    setMinPrice]    = useState('');
  const [maxPrice,    setMaxPrice]    = useState('');
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [sortOpen,    setSortOpen]    = useState(false);
  const sortRef = useRef(null);

  /* lock body scroll when drawer open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  /* close sort dropdown on outside click */
  useEffect(() => {
    const h = e => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const fetchProducts = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 20, sort });
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      const res = await api.get(`/categories/${slug}/products?${params}`);
      setCategory(res.data.category || null);
      setProducts(res.data.data     || []);
      setPagination(res.data.pagination || { total: 0, page: pg, totalPages: 1 });
      setPage(pg);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [slug, sort, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(1); }, [slug, sort]);

  const clearFilters = () => { setMinPrice(''); setMaxPrice(''); fetchProducts(1); };
  const hasFilters   = minPrice || maxPrice;
  const activeSortLabel = SORTS.find(s => s.value === sort)?.label || 'Newest First';

  /* ── Shared filter panel ── */
  const FilterPanel = (
    <div className="divide-y divide-gray-100">
      {/* Sort */}
      <FilterSection title="Sort By">
        <div className="space-y-0.5 pt-1">
          {SORTS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setSort(opt.value); setDrawerOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                sort === opt.value ? 'bg-primary-900 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Check className={`w-3.5 h-3.5 flex-shrink-0 ${sort === opt.value ? 'opacity-100' : 'opacity-0'}`} />
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price Range" defaultOpen={false}>
        <div className="pt-2 space-y-3">
          {/* Inputs */}
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <label className="block text-[11px] text-gray-500 font-bold uppercase mb-1">Min ({RS})</label>
              <input
                type="number" placeholder="0" value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-900 focus:outline-none"
              />
            </div>
            <span className="text-gray-300 font-bold mt-5">–</span>
            <div className="flex-1">
              <label className="block text-[11px] text-gray-500 font-bold uppercase mb-1">Max ({RS})</label>
              <input
                type="number" placeholder="Any" value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-900 focus:outline-none"
              />
            </div>
          </div>
          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5">
            {PRICE_PRESETS.map(({ min, max, label }) => {
              const active = minPrice === min && maxPrice === max;
              return (
                <button
                  key={label}
                  onClick={() => { setMinPrice(min); setMaxPrice(max); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    active ? 'bg-primary-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {/* Apply */}
          <button
            onClick={() => { fetchProducts(1); setDrawerOpen(false); }}
            className="w-full py-2 bg-primary-900 hover:bg-primary-800 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setDrawerOpen(false)} />
      )}

      {/* ── Mobile drawer ── */}
      <div className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 flex flex-col transition-transform duration-300 lg:hidden ${
        drawerOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-primary-900" />
            <span className="font-heading font-bold text-base text-gray-900">Filters & Sort</span>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2">{FilterPanel}</div>
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button onClick={() => { clearFilters(); setDrawerOpen(false); }}
            className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-gray-300 transition-colors">
            Clear All
          </button>
          <button onClick={() => setDrawerOpen(false)}
            className="flex-1 py-2.5 bg-primary-900 text-white rounded-xl text-sm font-bold hover:bg-primary-800 transition-colors">
            Show {pagination.total} Results
          </button>
        </div>
      </div>

      {/* ── Category Hero ── */}
      <div className="relative overflow-hidden bg-primary-900">
        {/* Background image with overlay */}
        {category?.image && (
          <img
            src={category.image}
            alt={category.name}
            onError={e => { e.currentTarget.style.display = 'none'; }}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 via-primary-900/80 to-primary-900/60" />
        <div className="relative z-10 container mx-auto px-4 py-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-white/60 font-semibold mb-4 flex-wrap">
            <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <Home className="w-3 h-3" /> Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/categories" className="hover:text-white flex items-center gap-1 transition-colors">
              <Grid3x3 className="w-3 h-3" /> Categories
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-bold">{category?.name || '...'}</span>
          </div>

          <div className="flex items-end gap-6">
            {/* Category thumbnail */}
            {category?.image && (
              <div className="hidden sm:block w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 flex-shrink-0 bg-white/10">
                <img
                  src={category.image}
                  alt={category.name}
                  onError={e => { e.currentTarget.src = NO_IMG; }}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white mb-1 leading-tight">
                {category?.name || 'Loading...'}
              </h1>
              {category?.description && (
                <p className="text-white/70 text-sm font-medium mb-2 max-w-xl">{category.description}</p>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-full">
                  <Package className="w-3 h-3" />
                  {loading ? '...' : `${pagination.total} products`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky toolbar ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-2.5 flex items-center gap-3">
          {/* Mobile filter button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-primary-900 transition-colors flex-shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filter & Sort</span>
            {hasFilters && <span className="w-4 h-4 rounded-full bg-primary-900 text-white text-[10px] font-bold flex items-center justify-center">!</span>}
          </button>

          {/* Result count */}
          <p className="text-sm text-gray-500 font-semibold flex-1">
            {loading ? 'Loading...' : (
              <span><span className="font-extrabold text-gray-900">{pagination.total}</span> products</span>
            )}
          </p>

          {/* Desktop sort dropdown */}
          <div className="hidden lg:block relative flex-shrink-0" ref={sortRef}>
            <button
              onClick={() => setSortOpen(v => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-primary-900 transition-colors min-w-44"
            >
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <span className="flex-1 text-left">{activeSortLabel}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 py-1 overflow-hidden">
                {SORTS.map(opt => (
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
      </div>

      {/* ── Active filter chips ── */}
      {hasFilters && (
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-2 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-semibold">Active:</span>
            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
                {minPrice && maxPrice ? `${RS}${minPrice}–${RS}${maxPrice}` : minPrice ? `Min ${RS}${minPrice}` : `Max ${RS}${maxPrice}`}
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); fetchProducts(1); }}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button onClick={clearFilters} className="ml-auto text-xs font-bold text-red-500 hover:text-red-700">
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* ── Body: sidebar + grid ── */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6 items-start">

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-[88px]">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary-900" />
                  <span className="font-heading font-bold text-sm text-gray-900">Filters</span>
                </div>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:text-red-700">
                    Reset
                  </button>
                )}
              </div>
              <div className="px-4 py-2">{FilterPanel}</div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Mobile sort chips */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-1">
              {SORTS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    sort === opt.value ? 'bg-primary-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Skeleton */}
            {loading && (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {Array(20).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            )}

            {/* Empty state */}
            {!loading && products.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 py-20 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs">
                  Try adjusting or clearing your filters to see more results.
                </p>
                {hasFilters && (
                  <button onClick={clearFilters}
                    className="px-6 py-2.5 bg-primary-900 text-white rounded-xl font-bold text-sm hover:bg-primary-800 transition-colors">
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Products */}
            {!loading && products.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-10 flex-wrap">
                    <button
                      onClick={() => fetchProducts(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-gray-200 disabled:opacity-40 hover:border-primary-900 transition-colors"
                    >
                      Prev
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                      .reduce((acc, p, i, arr) => {
                        if (i > 0 && arr[i - 1] !== p - 1) acc.push('ellipsis-' + p);
                        acc.push(p);
                        return acc;
                      }, [])
                      .map(p =>
                        typeof p === 'string' ? (
                          <span key={p} className="w-10 text-center text-gray-400 font-bold text-sm">…</span>
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
                      )
                    }

                    <button
                      onClick={() => fetchProducts(Math.min(pagination.totalPages, page + 1))}
                      disabled={page === pagination.totalPages}
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
      </div>
    </div>
  );
}
