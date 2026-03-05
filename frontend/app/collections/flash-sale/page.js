'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Zap, ArrowLeft, Clock, Flame, Timer, ArrowRight,
  Package, ShoppingBag, Heart, Star, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';

const RS = String.fromCharCode(8377);
function fmt(n) { return Number(n).toLocaleString('en-IN'); }

/* ─── Countdown Timer ──────────────────── */
function Countdown({ endDate, compact = false }) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate) - new Date();
      if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, expired: true };
      return {
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        expired: false,
      };
    };
    setTimeLeft(calc());
    const t = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(t);
  }, [endDate]);

  if (timeLeft.expired) return <span className="text-red-400 font-bold text-xs">EXPIRED</span>;

  if (compact) {
    const pad = n => String(n).padStart(2, '0');
    return (
      <span className="font-mono font-bold text-xs text-orange-600 tabular-nums">
        {timeLeft.d > 0 && `${pad(timeLeft.d)}d `}{pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
      </span>
    );
  }

  return (
    <div className="flex gap-2">
      {[
        { val: timeLeft.d, label: 'Days' },
        { val: timeLeft.h, label: 'Hrs' },
        { val: timeLeft.m, label: 'Min' },
        { val: timeLeft.s, label: 'Sec' },
      ].map(({ val, label }) => (
        <div key={label} className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 text-center min-w-[52px]">
          <div className="text-xl font-extrabold text-white font-mono leading-tight tabular-nums">{String(val).padStart(2, '0')}</div>
          <div className="text-[10px] text-white/60 font-medium">{label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Flash Product Card ─────────────────── */
function FlashCard({ fs }) {
  const product = fs.product;
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  if (!product) return null;

  const discountPct = Math.round((1 - parseFloat(fs.flashPrice) / parseFloat(product.mrp)) * 100);
  const savingAmt = parseFloat(product.mrp) - parseFloat(fs.flashPrice);
  const img = product.image || product.images?.[0]?.image;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      await addToCart(product.id, 1);
      toast.success(`${product.name} added to cart! 🛒`);
    } catch {
      toast.error('Failed to add to cart');
    } finally { setAdding(false); }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login to save items'); return; }
    try {
      const res = await api.post(`/user/wishlist/${product.id}`);
      setWishlisted(res.data.wishlisted);
      toast.success(res.data.wishlisted ? 'Saved! ❤️' : 'Removed from wishlist');
    } catch { toast.error('Something went wrong'); }
  };

  return (
    <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0" style={{ paddingTop: '85%' }}>
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-200" />
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none">
          <span className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
            <Zap className="w-3 h-3" /> FLASH
          </span>
          {discountPct > 0 && (
            <span className="bg-yellow-400 text-yellow-900 text-[10px] font-extrabold px-2 py-1 rounded-lg shadow-sm">
              -{discountPct}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-10"
        >
          <Heart
            className="w-4 h-4 transition-colors"
            style={{ fill: wishlisted ? '#ef4444' : 'none', color: wishlisted ? '#ef4444' : '#9CA3AF' }}
          />
        </button>

        {/* Countdown ribbon */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent py-2 px-3 flex items-center gap-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Timer className="w-3 h-3 text-orange-300 flex-shrink-0" />
          <Countdown endDate={fs.endDate} compact />
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        {product.category && (
          <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full w-fit">
            {product.category.name}
          </span>
        )}

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug hover:text-orange-600 transition-colors min-h-[2.5em]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.reviews?.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => {
                const avg = product.reviews.reduce((a,b) => a + b.rating, 0) / product.reviews.length;
                return <Star key={s} className="w-3 h-3" style={{ fill: s <= Math.round(avg) ? '#F59E0B' : 'none', color: s <= Math.round(avg) ? '#F59E0B' : '#D1D5DB' }} />;
              })}
            </div>
            <span className="text-[10px] text-gray-500">({product.reviews.length})</span>
          </div>
        )}

        {/* Prices */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-red-600">{RS}{fmt(fs.flashPrice)}</span>
          <span className="text-xs text-gray-400 line-through">{RS}{fmt(product.mrp)}</span>
        </div>

        {savingAmt > 0 && (
          <p className="text-xs font-bold text-green-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Save {RS}{fmt(savingAmt)}
          </p>
        )}

        {/* Countdown (always visible at bottom) */}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span>Ends </span>
          <Countdown endDate={fs.endDate} compact />
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={adding || product.stockQuantity === 0}
          className={`mt-auto w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
            product.stockQuantity === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : adding
                ? 'bg-orange-100 text-orange-500 cursor-wait'
                : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 shadow-sm hover:shadow-md hover:shadow-orange-200 active:scale-95'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          {product.stockQuantity === 0 ? 'Out of Stock' : adding ? 'Adding…' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

/* ════ MAIN PAGE ════ */
export default function FlashSalePage() {
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('discount');

  useEffect(() => {
    api.get('/flash-sales/active')
      .then(r => setFlashSales(r.data.data || []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // Get the nearest end date for the hero countdown
  const nearestEnd = flashSales.length > 0
    ? flashSales.reduce((min, fs) => {
        const d = new Date(fs.endDate);
        return d < min ? d : min;
      }, new Date(flashSales[0].endDate))
    : null;

  const sorted = [...flashSales].sort((a, b) => {
    if (sortBy === 'discount') {
      const da = (1 - parseFloat(a.flashPrice) / parseFloat(a.product?.mrp || 1));
      const db = (1 - parseFloat(b.flashPrice) / parseFloat(b.product?.mrp || 1));
      return db - da;
    }
    if (sortBy === 'price_asc') return parseFloat(a.flashPrice) - parseFloat(b.flashPrice);
    if (sortBy === 'price_desc') return parseFloat(b.flashPrice) - parseFloat(a.flashPrice);
    if (sortBy === 'ending_soon') return new Date(a.endDate) - new Date(b.endDate);
    return 0;
  });

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7F1D1D 0%, #DC2626 45%, #EA580C 100%)' }}>
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-36 h-36 rounded-full bg-yellow-400/10 pointer-events-none" />

        <div className="container mx-auto px-4 py-10 md:py-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left flex-1">
              {/* Live pill */}
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Flash Sale Live Now
              </div>

              <h1 className="font-heading font-extrabold text-3xl md:text-5xl text-white leading-tight mb-3">
                Today's Flash Deals
                <span className="block text-yellow-300 text-2xl md:text-4xl mt-1">
                  Up to {flashSales.length > 0 ? Math.max(...flashSales.map(fs => Math.round((1 - parseFloat(fs.flashPrice) / parseFloat(fs.product?.mrp || 1)) * 100))) : 0}% OFF
                </span>
              </h1>
              <p className="text-white/80 text-sm md:text-base mb-6 max-w-lg">
                Massive discounts on our bestselling products. Hurry — these deals won&apos;t last!
              </p>

              {nearestEnd && (
                <div className="mb-6">
                  <p className="text-xs text-white/60 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 justify-center md:justify-start">
                    <Timer className="w-3.5 h-3.5" /> Sale ends in
                  </p>
                  <Countdown endDate={nearestEnd} />
                </div>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-4 justify-center md:justify-start flex-wrap">
                <div className="text-white/90 text-sm font-semibold">
                  <span className="font-extrabold text-xl text-white">{flashSales.length}</span> deals live
                </div>
                <div className="w-px h-5 bg-white/30" />
                <div className="text-white/90 text-sm font-semibold">Limited stock only</div>
              </div>
            </div>

            <div className="flex-shrink-0 text-[90px] md:text-[120px] leading-none select-none filter drop-shadow-2xl">
              🔥
            </div>
          </div>
        </div>
      </section>

      {/* ── Breadcrumb ── */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-900 font-semibold flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-bold text-gray-900">Flash Sale</span>
          {!loading && <span className="text-gray-400 font-semibold">({flashSales.length})</span>}
        </div>
      </div>

      {/* ── Products ── */}
      <div className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" style={{ paddingTop: '85%' }} />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2" />
                  <div className="h-9 bg-gray-200 rounded-xl animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : flashSales.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <Zap className="w-12 h-12 text-red-300" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-gray-900 mb-2">No Active Flash Sales</h2>
            <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">Our team is preparing the next round of deals. Check back soon!</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-7 py-3 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors"
            >
              Browse All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Controls row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="font-heading font-bold text-xl text-gray-900">
                  {flashSales.length} Flash Deal{flashSales.length !== 1 ? 's' : ''} Available
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">All prices include taxes. Add to cart to lock in the flash price.</p>
              </div>
              {/* Sort */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:border-orange-400 cursor-pointer min-w-[180px]"
              >
                <option value="discount">Highest Discount</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="ending_soon">Ending Soon</option>
              </select>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sorted.map(fs => <FlashCard key={fs.id} fs={fs} />)}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 text-center">
              <p className="text-gray-500 text-sm mb-4">Looking for more deals?</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 border-2 border-gray-900 text-gray-900 font-bold px-7 py-3 rounded-full text-sm hover:bg-gray-900 hover:text-white transition-all"
              >
                Browse All Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
