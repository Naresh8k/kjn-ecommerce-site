'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Package, ChevronRight } from 'lucide-react';
import api from '@/lib/api';

const NO_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='40' viewBox='0 0 80 40'%3E%3Crect width='80' height='40' rx='6' fill='%23E8F5E9'/%3E%3Ctext x='40' y='26' text-anchor='middle' font-size='11' fill='%231B5E20' font-weight='700' font-family='system-ui'%3EBrand%3C/text%3E%3C/svg%3E";

function BrandSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col items-center p-4 gap-3">
      <div className="skeleton w-full h-24 rounded-xl" />
      <div className="skeleton h-3.5 w-20 rounded-full" />
      <div className="skeleton h-3 w-14 rounded-full" />
    </div>
  );
}

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/brands?limit=100')
      .then((r) => setBrands(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)' }} className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1.5 text-xs text-white/70 mb-3">
            <Link href="/" className="text-white/80 hover:text-white font-semibold transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold">Brands</span>
          </div>
          <h1 className="font-heading font-extrabold text-white mb-1" style={{ fontSize: 'clamp(22px, 4vw, 30px)' }}>
            All Brands
          </h1>
          {!loading && (
            <p className="text-white/70 text-sm font-semibold">{brands.length} brands available</p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search bar */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl bg-white focus:border-primary-900 focus:outline-none transition-colors"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array(12).fill(0).map((_, i) => <BrandSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="font-heading font-bold text-lg text-gray-800 mb-2">No brands found</h3>
            <p className="text-gray-500 text-sm mb-4">Try a different search term</p>
            <button
              onClick={() => setSearch('')}
              className="px-5 py-2 bg-primary-900 text-white rounded-xl font-bold text-sm hover:bg-primary-800 transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((b) => (
              <Link key={b.id} href={`/brands/${b.slug}`} className="group block">
                <div className="bg-white rounded-2xl border border-gray-100 hover:border-primary-300 hover:shadow-medium transition-all duration-250 flex flex-col items-center p-4 gap-2 cursor-pointer">
                  <div className="w-full h-24 flex items-center justify-center bg-primary-50 rounded-xl overflow-hidden mb-1">
                    {b.logo || b.logoUrl ? (
                      <img
                        src={b.logo || b.logoUrl}
                        alt={b.name}
                        className="max-w-full max-h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.onerror = null; e.target.src = NO_LOGO; }}
                      />
                    ) : (
                      <span className="font-heading font-extrabold text-primary-900 text-sm text-center px-2 leading-tight">
                        {b.name}
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-sm text-gray-800 text-center leading-tight line-clamp-2 group-hover:text-primary-900 transition-colors">
                    {b.name}
                  </p>
                  {b._count?.products != null && (
                    <span className="text-xs text-gray-400 font-semibold">{b._count.products} products</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
