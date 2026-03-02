'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search, SlidersHorizontal, ChevronRight, X,
  ChevronDown, Package, Check, ArrowUpDown
} from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';

const RS = String.fromCharCode(8377);

/* ---------- tiny shimmer skeleton ---------- */
function Skel({ h = 16, w = '100%', r = 6 }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: r,
      background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  );
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      <Skel h={200} r={0} />
      <div className="p-3 space-y-2">
        <Skel h={11} w="55%" />
        <Skel h={14} />
        <Skel h={14} w="75%" />
        <Skel h={17} w="45%" />
        <Skel h={34} r={10} />
      </div>
    </div>
  );
}

/* ---------- sort options ---------- */
const SORTS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name',       label: 'Name A-Z' },
  { value: 'discount',   label: 'Best Discount' },
];

/* ---------- collapsible filter section ---------- */
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-3 px-1 text-sm font-bold text-gray-800 hover:text-primary-900 transition-colors"
      >
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform text-gray-400 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

/* ---------- main page ---------- */
export default function ProductsPage() {
  const searchParams = useSearchParams();

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands,     setBrands]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [metaLoading, setMetaLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  /* filter state */
  const [search,   setSearch]   = useState(searchParams.get('search')   || '');
  const [sort,     setSort]     = useState(searchParams.get('sort')     || 'newest');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [brand,    setBrand]    = useState(searchParams.get('brand')    || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [page,     setPage]     = useState(Number(searchParams.get('page') || 1));
  const [featured, setFeatured] = useState(searchParams.get('featured') === 'true');

  /* mobile drawer */
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* sort dropdown */
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  /* close sort dropdown on outside click */
  useEffect(() => {
    const handler = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* lock body scroll when drawer open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  /* fetch meta once */
  useEffect(() => {
    Promise.all([
      api.get('/categories?limit=50'),
      api.get('/brands?limit=50'),
    ]).then(([catR, brandR]) => {
      setCategories(catR.data.data   || []);
      setBrands(brandR.data.data     || []);
    }).catch(() => {}).finally(() => setMetaLoading(false));
  }, []);

  /* fetch products when filters change */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)   params.set('search',   search);
      if (sort)     params.set('sort',     sort);
      if (category) params.set('category', category);
      if (brand)    params.set('brand',    brand);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (featured) params.set('featured', 'true');
      params.set('page',  String(page));
      params.set('limit', '20');
      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.data       || []);
      setPagination(res.data.pagination || { total: 0, page: 1, totalPages: 1 });
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, sort, category, brand, minPrice, maxPrice, featured, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* helpers */
  const resetPage = () => setPage(1);
  const clearAll  = () => {
    setSearch(''); setSort('newest'); setCategory('');
    setBrand(''); setMinPrice(''); setMaxPrice('');
    setFeatured(false); setPage(1);
  };

  const activeFiltersCount = [
    category, brand, minPrice || maxPrice, featured,
  ].filter(Boolean).length;

  const activeCategory = categories.find(c => c.slug === category);
  const activeBrand    = brands.find(b => b.slug === brand);
  const activeSortLabel = SORTS.find(s => s.value === sort)?.label || 'Newest First';

  /* ---- filter panel content (shared by sidebar + drawer) ---- */
  const FilterPanel = (
    <div className="space-y-0 divide-y divide-gray-100">
      {/* Sort (inside panel on mobile only — desktop has its own dropdown) */}
      <FilterSection title="Sort By" defaultOpen={true}>
        <div className="space-y-1 pt-1">
          {SORTS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setSort(opt.value); resetPage(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                sort === opt.value
                  ? 'bg-primary-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Check className={`w-3.5 h-3.5 flex-shrink-0 ${sort === opt.value ? 'opacity-100' : 'opacity-0'}`} />
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Category */}
      {categories.length > 0 && (
        <FilterSection title="Category">
          <div className="space-y-1 pt-1 max-h-52 overflow-y-auto pr-1">
            <button
              onClick={() => { setCategory(''); resetPage(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                !category ? 'bg-primary-900 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Check className={`w-3.5 h-3.5 flex-shrink-0 ${!category ? 'opacity-100' : 'opacity-0'}`} />
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setCategory(cat.slug); resetPage(); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  category === cat.slug ? 'bg-primary-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Check className={`w-3.5 h-3.5 flex-shrink-0 ${category === cat.slug ? 'opacity-100' : 'opacity-0'}`} />
                {cat.name}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Brand */}
      {brands.length > 0 && (
        <FilterSection title="Brand" defaultOpen={false}>
          <div className="space-y-1 pt-1 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => { setBrand(''); resetPage(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                !brand ? 'bg-primary-900 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Check className={`w-3.5 h-3.5 flex-shrink-0 ${!brand ? 'opacity-100' : 'opacity-0'}`} />
              All Brands
            </button>
            {brands.map(b => (
              <button
                key={b.id}
                onClick={() => { setBrand(b.slug); resetPage(); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  brand === b.slug ? 'bg-primary-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Check className={`w-3.5 h-3.5 flex-shrink-0 ${brand === b.slug ? 'opacity-100' : 'opacity-0'}`} />
                {b.name}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price */}
      <FilterSection title="Price Range" defaultOpen={false}>
        <div className="pt-2 space-y-2">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 font-semibold mb-1">Min ({RS})</label>
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={e => { setMinPrice(e.target.value); resetPage(); }}
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-900 focus:outline-none"
              />
            </div>
            <span className="text-gray-400 mt-5 font-bold">-</span>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 font-semibold mb-1">Max ({RS})</label>
              <input
                type="number"
                placeholder="Any"
                value={maxPrice}
                onChange={e => { setMaxPrice(e.target.value); resetPage(); }}
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-900 focus:outline-none"
              />
            </div>
          </div>
          {/* Quick price presets */}
          <div className="flex flex-wrap gap-1.5">
            {[['0','500'],['500','1000'],['1000','5000'],['5000','']].map(([mn, mx]) => {
              const label = mx ? `${RS}${mn}-${mx}` : `${RS}${mn}+`;
              const active = minPrice === mn && maxPrice === mx;
              return (
                <button
                  key={label}
                  onClick={() => { setMinPrice(mn); setMaxPrice(mx); resetPage(); }}
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
      </FilterSection>

      {/* Featured toggle */}
      <FilterSection title="Availability" defaultOpen={false}>
        <div className="pt-1">
          <button
            onClick={() => { setFeatured(v => !v); resetPage(); }}
            className="flex items-center gap-3 w-full group"
          >
            <div className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${featured ? 'bg-primary-900' : 'bg-gray-200'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${featured ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">Featured Products Only</span>
          </button>
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* ── Mobile Filter Drawer Overlay ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile Filter Drawer ── */}
      <div className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 flex flex-col transition-transform duration-300 lg:hidden ${
        drawerOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-primary-900" />
            <h2 className="font-heading font-bold text-base text-gray-900">Filters</h2>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary-900 text-white text-xs font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {FilterPanel}
        </div>

        {/* Drawer footer */}
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={() => { clearAll(); setDrawerOpen(false); }}
            className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-gray-300 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={() => setDrawerOpen(false)}
            className="flex-1 py-2.5 bg-primary-900 text-white rounded-xl text-sm font-bold hover:bg-primary-800 transition-colors"
          >
            Show {pagination.total} Results
          </button>
        </div>
      </div>

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-3 pb-1">
            <Link href="/" className="hover:text-primary-900 font-semibold transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-800 font-semibold">Products</span>
            {activeCategory && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-800 font-semibold">{activeCategory.name}</span>
              </>
            )}
          </div>

          {/* Title + Search row */}
          <div className="flex items-center gap-3 py-3">
            {/* Mobile filter button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 flex-shrink-0 hover:border-primary-900 transition-colors relative"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary-900 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => { setSearch(e.target.value); resetPage(); }}
                className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-900 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
              />
              {search && (
                <button onClick={() => { setSearch(''); resetPage(); }} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Sort dropdown - desktop */}
            <div className="hidden lg:block relative flex-shrink-0" ref={sortRef}>
              <button
                onClick={() => setSortOpen(v => !v)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-primary-900 transition-colors min-w-44"
              >
                <ArrowUpDown className="w-4 h-4 text-gray-500" />
                <span className="flex-1 text-left">{activeSortLabel}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden py-1">
                  {SORTS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSort(opt.value); resetPage(); setSortOpen(false); }}
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
      </div>

    
      {(activeFiltersCount > 0 || search) && (
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-2.5 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-semibold flex-shrink-0">Active:</span>
            {search && (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold">
                &quot;{search}&quot;
                <button onClick={() => { setSearch(''); resetPage(); }}><X className="w-3 h-3" /></button>
              </span>
            )}
            {activeCategory && (
              <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-900 border border-primary-200 px-3 py-1 rounded-full text-xs font-bold">
                {activeCategory.name}
                <button onClick={() => { setCategory(''); resetPage(); }}><X className="w-3 h-3" /></button>
              </span>
            )}
            {activeBrand && (
              <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold">
                {activeBrand.name}
                <button onClick={() => { setBrand(''); resetPage(); }}><X className="w-3 h-3" /></button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
                {minPrice && maxPrice ? `${RS}${minPrice}-${RS}${maxPrice}` : minPrice ? `Min ${RS}${minPrice}` : `Max ${RS}${maxPrice}`}
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); resetPage(); }}><X className="w-3 h-3" /></button>
              </span>
            )}
            {featured && (
              <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold">
                Featured
                <button onClick={() => { setFeatured(false); resetPage(); }}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={clearAll}
              className="ml-auto text-xs font-bold text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

  
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6 items-start">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-36">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary-900" />
                  <span className="font-heading font-bold text-sm text-gray-900">Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-primary-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                {activeFiltersCount > 0 && (
                  <button onClick={clearAll} className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">
                    Reset
                  </button>
                )}
              </div>
              <div className="px-4 py-2">
                {metaLoading ? (
                  <div className="space-y-3 py-3">
                    {Array(4).fill(0).map((_, i) => <Skel key={i} h={12} r={4} />)}
                  </div>
                ) : FilterPanel}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Result count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 font-semibold">
                {loading ? 'Loading...' : (
                  <span>
                    <span className="font-extrabold text-gray-900">{pagination.total}</span> products found
                  </span>
                )}
              </p>
              {/* mobile sort row */}
              <div className="lg:hidden flex items-center gap-2 overflow-x-auto">
                {SORTS.slice(0, 3).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSort(opt.value); resetPage(); }}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      sort === opt.value ? 'bg-primary-900 text-white' : 'bg-white border border-gray-200 text-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {Array(12).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-20 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs">Try adjusting or clearing your filters to find what you are looking for</p>
                <button
                  onClick={clearAll}
                  className="px-6 py-2.5 bg-primary-900 text-white rounded-xl font-bold text-sm hover:bg-primary-800 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-10 flex-wrap">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-gray-200 disabled:opacity-40 hover:border-primary-900 transition-colors"
                    >
                      Prev
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                      .reduce((acc, p, i, arr) => {
                        if (i > 0 && arr[i - 1] !== p - 1) acc.push('dot-' + p);
                        acc.push(p);
                        return acc;
                      }, [])
                      .map(p =>
                        typeof p === 'string' ? (
                          <span key={p} className="w-10 text-center text-gray-400 font-bold">...</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
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
                      onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
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
