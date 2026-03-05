'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronRight, ChevronLeft, Truck, Shield, RefreshCw,
  Headphones, ArrowRight, Zap, TrendingUp, Star, Package,
  Flame, Clock
} from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';

const NO_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%23D1D5DB' stroke-width='1'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";

function Skel({ h = 20, w = '100%', r = 8 }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: r,
      background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite'
    }} />
  );
}

function SectionHead({ label, tag, href }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 bg-primary-900 rounded-full" />
        <div>
          <h2 className="font-heading font-extrabold text-xl text-gray-900 leading-none">{label}</h2>
          {tag && <p className="text-xs text-gray-500 mt-0.5 font-medium">{tag}</p>}
        </div>
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-sm font-bold text-primary-900 hover:text-primary-800 transition-colors">
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      <Skel h={200} r={0} />
      <div className="p-3 space-y-2">
        <Skel h={12} w="60%" r={4} />
        <Skel h={14} r={4} />
        <Skel h={14} w="80%" r={4} />
        <Skel h={18} w="50%" r={4} />
      </div>
    </div>
  );
}

// Recently Viewed Products Component
function RecentlyViewed() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setProducts(viewed.slice(0, 6));
    }
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <SectionHead label="Continue Where You Left Off" tag="Your recently viewed products" />
          <button
            onClick={() => { if (typeof window !== 'undefined') { localStorage.removeItem('recentlyViewed'); setProducts([]); } }}
            className="text-xs text-primary-900 font-semibold hover:underline"
          >
            Clear history
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}

// Live Happy Customers Component
function LiveHappyCustomers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    api.get('/orders/happy/customers?limit=8')
      .then((res) => setCustomers(res.data.data || []))
      .catch(() => { });
  }, []);

  if (!customers.length) return null;

  return (
    <section className="py-8 md:py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <SectionHead label="Happy Customers" tag="Real farmers, real purchases" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {customers.map((c, i) => (
            <div
              key={c.id}
              className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-2xl flex-shrink-0">😊</div>
              <div className="min-w-0">
                <p className="font-bold text-sm leading-tight">
                  <span className="text-primary-900">{c.name}</span> from {c.city}, {c.state}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Order <strong>{c.orderNumber}</strong> delivered
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Flash Sale Countdown Component
function FlashSaleCountdown() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      setTime({
        h: Math.floor(diff / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    updateTimer();
    const t = setInterval(updateTimer, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = n => String(n).padStart(2, '0');

  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)' }}>
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5" />
      <div className="container mx-auto px-4 py-6 md:py-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Flame className="w-6 h-6 text-yellow-300" />
              <h3 className="font-heading font-extrabold text-xl md:text-2xl text-white">
                Today&apos;s Flash Sale
              </h3>
            </div>
            <p className="text-white/80 text-sm mb-3">Limited time offer on our bestselling products</p>
            <div className="flex gap-2 justify-center md:justify-start mb-4">
              {[['Hours', time.h], ['Min', time.m], ['Sec', time.s]].map(([label, val]) => (
                <div key={label} className="text-center">
                  <div className="bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2 text-white font-extrabold text-xl md:text-2xl font-mono min-w-[52px]">
                    {pad(val)}
                  </div>
                  <div className="text-[10px] text-white/60 mt-1 font-medium">{label}</div>
                </div>
              ))}
            </div>
            <Link
              href="/collections/flash-sale"
              className="inline-flex items-center gap-2 bg-yellow-300 text-yellow-900 font-extrabold text-sm px-6 py-2.5 rounded-full hover:bg-yellow-200 transition-colors"
            >
              Shop Flash Sale <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="text-6xl md:text-8xl">🔥</div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newest, setNewest] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [flashSaleActive, setFlashSaleActive] = useState(false);
  const timerRef = useRef(null);

  // First slide: flash-sale hero if active, else static hero; admin banners follow
  const allSlides = [
    { type: flashSaleActive ? 'flashSale' : 'static' },
    ...banners.map(b => ({ type: 'banner', ...b })),
  ];

  useEffect(() => {
    (async () => {
      try {
        const [catR, featR, newR, bannerR, brandR, flashR] = await Promise.all([
          api.get('/categories?limit=20'),
          api.get('/products?featured=true&limit=10'),
          api.get('/products?sort=newest&limit=10'),
          api.get('/banners'),
          api.get('/brands?limit=20'),
          api.get('/collections/flash-sale?limit=1').catch(() => ({ data: { data: [] } })),
        ]);
        setCategories(catR.data.data || []);
        setFeatured(featR.data.data || []);
        setNewest(newR.data.data || []);
        setBanners((bannerR.data.data || []).filter(b => b.isActive && (b.image || b.imageUrl)));
        setBrands(brandR.data.data || []);
        setFlashSaleActive((flashR.data.data || []).length > 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (allSlides.length <= 1) return;
    timerRef.current = setInterval(() => setSlide(p => (p + 1) % allSlides.length), 4500);
    return () => clearInterval(timerRef.current);
  }, [allSlides.length]);

  const prevSlide = () => {
    clearInterval(timerRef.current);
    setSlide(p => (p - 1 + allSlides.length) % allSlides.length);
  };
  const nextSlide = () => {
    clearInterval(timerRef.current);
    setSlide(p => (p + 1) % allSlides.length);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}.hide-scroll::-webkit-scrollbar{display:none}.hide-scroll{-ms-overflow-style:none;scrollbar-width:none}`}</style>

      {/* HERO CAROUSEL — flash sale hero or static + admin banners */}
      <section className="relative bg-primary-900 overflow-hidden">
        {loading ? (
          <Skel h={380} r={0} />
        ) : (
          <div className="relative overflow-hidden" style={{ height: 'clamp(220px, 42vw, 480px)' }}>
            {/* Track */}
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${slide * 100}%)` }}
            >
              {allSlides.map((s, i) => (
                s.type === 'flashSale' ? (
                  /* ── Flash Sale hero (replaces static when flash sale is active) ── */
                  <div key="flashSale" className="flex-shrink-0 w-full h-full relative" style={{ background: 'linear-gradient(135deg, #B71C1C 0%, #E53935 50%, #FF5722 100%)' }}>
                    <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
                    <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white/5" />
                    <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-yellow-400/10" />
                    <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
                      <div className="text-center text-white max-w-2xl">
                        <span className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-200 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
                          <Flame className="w-4 h-4" /> Flash Sale Live Now
                        </span>
                        <h1 className="font-heading font-extrabold text-white leading-tight mb-4" style={{ fontSize: 'clamp(26px,5vw,56px)' }}>
                          Massive Discounts<br />Only for Today!
                        </h1>
                        <p className="text-white/80 mb-7 text-sm md:text-base max-w-lg mx-auto">
                          Grab the best deals on sprayers, motors, tools and more before they&apos;re gone.
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center">
                          <Link href="/collections/flash-sale" className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 font-extrabold px-7 py-3 rounded-full text-sm hover:bg-yellow-300 transition-colors shadow-lg">
                            Shop Flash Sale <ArrowRight className="w-4 h-4" />
                          </Link>
                          <Link href="/products" className="inline-flex items-center gap-2 border-2 border-white text-white font-bold px-7 py-3 rounded-full text-sm hover:bg-white/10 transition-colors">
                            Browse All Products
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : s.type === 'static' ? (
                  /* ── Default static hero (shows when no flash sale) ── */
                  <div key="static" className="flex-shrink-0 w-full h-full relative" style={{ background: 'linear-gradient(135deg,#1B5E20 0%,#2E7D32 60%,#388E3C 100%)' }}>
                    <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
                    <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-white/5" />
                    <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-white/5" />
                    <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
                      <div className="text-center text-white max-w-2xl">
                        <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
                          Premium Agricultural Equipment
                        </span>
                        <h1 className="font-heading font-extrabold text-white leading-tight mb-4" style={{ fontSize: 'clamp(26px,5vw,56px)' }}>
                          Trusted by Farmers<br />Across Andhra Pradesh
                        </h1>
                        <p className="text-white/80 mb-7 text-sm md:text-base max-w-lg mx-auto">
                          Sprayers, seeders, motors, tools and more at the best prices.
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center">
                          <Link href="/products" className="inline-flex items-center gap-2 bg-white text-primary-900 font-extrabold px-7 py-3 rounded-full text-sm hover:bg-primary-50 transition-colors shadow-lg">
                            Shop Now <ArrowRight className="w-4 h-4" />
                          </Link>
                          <Link href="/categories" className="inline-flex items-center gap-2 border-2 border-white text-white font-bold px-7 py-3 rounded-full text-sm hover:bg-white/10 transition-colors">
                            Browse Categories
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── Admin banner slide ── */
                  <div
                    key={i}
                    className="flex-shrink-0 w-full h-full block relative cursor-pointer"
                    onClick={() => s.linkUrl && s.linkUrl !== '#' && window.location.assign(s.linkUrl)}
                  >
                    <img
                      src={s.image || s.imageUrl}
                      alt={s.title || 'Banner'}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.onerror = null; e.target.src = NO_IMG; }}
                    />
                    {s.title && (
                      <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-transparent flex items-center px-10 md:px-20">
                        <div className="text-white max-w-lg">
                          <p className="text-xs font-semibold uppercase tracking-widest mb-2 opacity-80">Special Offer</p>
                          <h2 className="font-heading font-extrabold text-3xl md:text-5xl leading-tight mb-4">{s.title}</h2>
                          {s.linkUrl && (
                            <span
                              onClick={e => { e.stopPropagation(); window.location.assign(s.linkUrl); }}
                              className="inline-flex items-center gap-2 bg-white text-primary-900 font-bold px-6 py-2.5 rounded-full text-sm hover:bg-primary-50 transition-colors cursor-pointer"
                            >
                              Shop Now <ArrowRight className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>

            {/* Prev / Next arrows — always shown when >1 slide */}
            {allSlides.length > 1 && (
              <>
                <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center z-10">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center z-10">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {allSlides.map((_, i) => (
                    <button key={i} onClick={() => setSlide(i)}
                      className="transition-all duration-300 rounded-full"
                      style={{ width: i === slide ? 24 : 8, height: 8, background: i === slide ? '#fff' : 'rgba(255,255,255,0.5)' }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* TRUST BADGES */}
      <section className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {[
              { icon: Truck, title: 'Free Delivery', sub: 'On orders above \u20b9500' },
              { icon: Shield, title: 'Genuine Products', sub: '100% authentic brands' },
              { icon: RefreshCw, title: 'Easy Returns', sub: '7-day return policy' },
              { icon: Headphones, title: '24/7 Support', sub: 'WhatsApp & Phone' },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3 px-4 py-4 md:py-5">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary-900" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CATEGORIES */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <SectionHead label="Shop by Category" tag="Find what you need fast" href="/categories" />
          {loading ? (
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skel h={72} w={72} r={999} />
                  <Skel h={12} w={60} r={4} />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto hide-scroll">
              <div className="flex gap-4 pb-2 min-w-max md:grid md:grid-cols-8 md:min-w-0">
                {categories.slice(0, 16).map(cat => (
                  <Link key={cat.id} href={`/categories/${cat.slug}`} className="flex flex-col items-center gap-2 group w-20 md:w-auto">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-primary-900 transition-all bg-gray-50 flex items-center justify-center flex-shrink-0">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={e => { e.target.onerror = null; e.target.src = NO_IMG; }}
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-gray-700 text-center leading-tight line-clamp-2 w-full group-hover:text-primary-900 transition-colors">
                      {cat.name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PROMO BANNERS */}
      <section className="py-4 bg-gray-50">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg,#1B5E20,#43A047)', minHeight: 140 }}>
            <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute right-8 -top-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="p-6 text-white relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Up to 30% off</p>
              <h3 className="font-heading font-extrabold text-xl mb-3">Farm Equipment<br />Super Sale</h3>
              <Link href="/products" className="inline-flex items-center gap-1.5 bg-white text-primary-900 text-xs font-bold px-4 py-2 rounded-full hover:bg-primary-50 transition-colors">
                Shop Now <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg,#E65100,#FF8F00)', minHeight: 140 }}>
            <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/10" />
            <div className="absolute right-8 -top-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="p-6 text-white relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Prepaid Orders</p>
              <h3 className="font-heading font-extrabold text-xl mb-3">Extra 1.5% off<br />on All Prepaid</h3>
              <Link href="/products" className="inline-flex items-center gap-1.5 bg-white text-orange-700 text-xs font-bold px-4 py-2 rounded-full hover:bg-orange-50 transition-colors">
                Grab Deal <Zap className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {(loading || featured.length > 0) && (
        <section className="py-8 md:py-12 bg-white">
          <div className="container mx-auto px-4">
            <SectionHead label="Featured Products" tag="Handpicked by our experts" href="/products?featured=true" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {loading
                ? Array(5).fill(0).map((_, i) => <ProductSkeleton key={i} />)
                : featured.map(p => <ProductCard key={p.id} product={p} />)
              }
            </div>
          </div>
        </section>
      )}

      {/* BRANDS STRIP */}
      {(loading || brands.length > 0) && (
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <SectionHead label="Top Brands" tag="Trusted names in agriculture" href="/brands" />
            <div className="overflow-x-auto hide-scroll">
              <div className="flex gap-4 pb-2 min-w-max md:flex-wrap md:justify-center md:min-w-0">
                {loading
                  ? Array(8).fill(0).map((_, i) => <Skel key={i} h={72} w={120} r={12} />)
                  : brands.map(b => (
                    <Link key={b.id} href={`/brands/${b.slug}`}
                      className="flex-shrink-0 w-28 h-16 bg-white rounded-xl border border-gray-100 hover:border-primary-900 hover:shadow-md transition-all flex items-center justify-center p-3">
                      {b.logo
                        ? <img src={b.logo} alt={b.name} className="max-w-full max-h-full object-contain"
                          onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                        />
                        : <span className="text-xs font-bold text-gray-600 text-center">{b.name}</span>
                      }
                    </Link>
                  ))
                }
              </div>
            </div>
          </div>
        </section>
      )}

      {/* NEW ARRIVALS */}
      {(loading || newest.length > 0) && (
        <section className="py-8 md:py-12 bg-white">
          <div className="container mx-auto px-4">
            <SectionHead label="New Arrivals" tag="Just added to our store" href="/products?sort=newest" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {loading
                ? Array(5).fill(0).map((_, i) => <ProductSkeleton key={i} />)
                : newest.map(p => <ProductCard key={p.id} product={p} />)
              }
            </div>
          </div>
        </section>
      )}

      {/* WHY CHOOSE US */}
      <section className="py-10 md:py-16" style={{ background: 'linear-gradient(135deg,#0F2412 0%,#1B5E20 100%)' }}>
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="font-heading font-extrabold text-2xl md:text-4xl mb-2">Why Farmers Choose KJN</h2>
          <p className="text-white/70 mb-10 text-sm md:text-base">Serving the farming community since day one</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { val: '1000+', label: 'Products', icon: Package },
              { val: '50+', label: 'Brands', icon: Star },
              { val: '10K+', label: 'Happy Customers', icon: TrendingUp },
              { val: '4.8', label: 'Avg Rating', icon: Star },
            ].map(({ val, label, icon: Icon }) => (
              <div key={label} className="bg-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
                <Icon className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="font-heading font-extrabold text-2xl md:text-3xl text-white mb-1">{val}</div>
                <div className="text-xs text-white/60 font-semibold">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HAPPY CUSTOMERS */}
      <LiveHappyCustomers />

      {/* RECENTLY VIEWED */}
      <RecentlyViewed />

      {/* APP CTA */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs font-bold text-primary-900 uppercase tracking-widest mb-2">Mobile App</p>
              <h3 className="font-heading font-extrabold text-2xl text-gray-900 mb-2">Shop Smarter on the App</h3>
              <p className="text-gray-600 text-sm mb-5">Exclusive app-only deals and real-time order tracking.</p>
              <a href="https://play.google.com/store/apps/details?id=app.shoopy.kjn_trading_company" target="_blank" rel="noopener noreferrer">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-12" />
              </a>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              {[
                { val: '1000+', label: 'Products' },
                { val: '10K+', label: 'Downloads' },
                { val: '4.8', label: 'Rating' },
              ].map(({ val, label }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 px-6 py-4 text-center shadow-sm">
                  <div className="font-heading font-extrabold text-xl text-primary-900">{val}</div>
                  <div className="text-xs text-gray-500 font-semibold mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}