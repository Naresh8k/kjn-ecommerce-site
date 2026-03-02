'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Grid3x3, ChevronRight, Package, ArrowRight, Search } from 'lucide-react';
import api from '@/lib/api';

const NO_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%23D1D5DB' stroke-width='1'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');

  useEffect(() => {
    api.get('/categories?limit=100')
      .then(r => {
        const data = r.data.data || [];
        setCategories(data);
        setFiltered(data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    setFiltered(q ? categories.filter(c => c.name.toLowerCase().includes(q)) : categories);
  }, [search, categories]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* ── Hero band ── */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-green-600 text-white overflow-hidden relative">
        {/* decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-white/5" />
        <div className="container mx-auto px-4 py-10 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-white/60 font-semibold mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-bold">All Categories</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <Grid3x3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="font-heading font-extrabold text-3xl text-white">Shop by Category</h1>
              </div>
              <p className="text-white/70 text-sm font-medium">
                {loading ? 'Loading...' : `${categories.length} categories · Find what you need`}
              </p>
            </div>
            {/* Search inside hero */}
            <div className="relative w-full sm:w-72 flex-shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/50 text-sm font-medium focus:outline-none focus:bg-white/25 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-7">

        {/* Result info */}
        {!loading && search && (
          <p className="text-sm text-gray-500 font-semibold mb-5">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;<span className="text-gray-900 font-bold">{search}</span>&rdquo;
          </p>
        )}

        {/* Skeleton grid */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="font-heading font-extrabold text-xl text-gray-800 mb-2">No categories found</h3>
            <p className="text-gray-500 text-sm mb-5">Try a different search term.</p>
            <button
              onClick={() => setSearch('')}
              className="px-6 py-2.5 bg-primary-900 hover:bg-primary-800 text-white font-bold text-sm rounded-xl transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Category grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(cat => (
              <Link key={cat.id} href={`/categories/${cat.slug}`} className="group block">
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 group-hover:border-primary-900/30 group-hover:shadow-large transition-all duration-300 h-full flex flex-col">

                  {/* Image */}
                  <div className="relative aspect-[4/3] bg-primary-50 overflow-hidden">
                    <img
                      src={cat.image || NO_IMG}
                      alt={cat.name}
                      onError={e => { e.currentTarget.src = NO_IMG; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* green overlay on hover */}
                    <div className="absolute inset-0 bg-primary-900/0 group-hover:bg-primary-900/30 transition-colors duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-primary-900 font-extrabold text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                        Explore <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="font-heading font-extrabold text-sm text-gray-900 leading-snug mb-1 line-clamp-2 group-hover:text-primary-900 transition-colors">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-[11px] text-gray-400 font-medium line-clamp-1 mb-2 flex-1">
                        {cat.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                      <span className="text-[11px] text-primary-900 font-extrabold">
                        Browse Products
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary-900 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
