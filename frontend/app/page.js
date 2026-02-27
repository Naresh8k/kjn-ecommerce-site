'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';

// Skeleton loader
const Skeleton = ({ w = '100%', h = 20, radius = 8 }) => (
  <div className="skeleton" style={{ width: w, height: h, borderRadius: radius }} />
);

export default function HomePage() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [fanProducts, setFanProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, newRes, fanRes, bannerRes] = await Promise.all([
          api.get('/categories'),
          api.get('/collections/new-launch'),
          api.get('/collections/fans'),
          api.get('/banners?position=hero'),
        ]);
        setCategories(catRes.data.data || []);
        setNewProducts(newRes.data.data || []);
        setFanProducts(fanRes.data.data || []);
        setBanners(bannerRes.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-rotate banner
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setCurrentBanner((p) => (p + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners.length]);

  return (
    <div>
      {/* Hero Banner */}
      <section style={{ background: '#F1F8E9', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ height: 320 }} className="skeleton" />
        ) : banners.length > 0 ? (
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', transition: 'transform 0.6s ease', transform: `translateX(-${currentBanner * 100}%)` }}>
              {banners.map((b, i) => (
                <a key={i} href={b.linkUrl || '#'} style={{ flex: '0 0 100%', display: 'block' }}>
                  <img src={b.imageUrl} alt={b.title} style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }} />
                </a>
              ))}
            </div>
            {banners.length > 1 && (
              <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                {banners.map((_, i) => (
                  <button key={i} onClick={() => setCurrentBanner(i)}
                    style={{ width: i === currentBanner ? 24 : 8, height: 8, borderRadius: 99, border: 'none', background: i === currentBanner ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'all 0.3s' }} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Fallback hero if no banners in DB */
          <div style={{
            background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)',
            padding: '64px 16px', textAlign: 'center', color: 'white',
          }}>
            <div className="container">
              <p style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginBottom: 8, letterSpacing: 2, textTransform: 'uppercase' }}>Premium Quality</p>
              <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 'clamp(28px, 5vw, 52px)', color: 'white', marginBottom: 16, lineHeight: 1.2 }}>
                Farm Equipment<br />at Best Prices
              </h1>
              <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
                Sprayers, Seeders, Motors, Tools & more. Trusted by farmers across Andhra Pradesh.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/categories/farm-equipments" className="btn btn-accent btn-lg">Shop Now <ArrowRight style={{ width: 18 }} /></Link>
                <Link href="/categories" className="btn btn-outline btn-lg" style={{ borderColor: 'white', color: 'white' }}>Browse All</Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <section style={{ background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div className="container" style={{ padding: '16px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {[
              { icon: Truck, title: 'Free Delivery', sub: 'On orders above ₹500' },
              { icon: Shield, title: 'Genuine Products', sub: '100% authentic brands' },
              { icon: RefreshCw, title: 'Easy Returns', sub: '7-day return policy' },
              { icon: Headphones, title: '24/7 Support', sub: 'WhatsApp & Phone' },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px' }}>
                <div style={{ width: 40, height: 40, background: '#E8F5E9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 20, color: '#1B5E20' }} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: '#1F2937' }}>{title}</p>
                  <p style={{ fontSize: 11, color: '#6B7280' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse Categories */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 className="section-title">Browse Categories</h2>
            <Link href="/categories" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1B5E20', fontWeight: 700, fontSize: 13 }}>
              View All <ChevronRight style={{ width: 16 }} />
            </Link>
          </div>
          <div className="category-grid">
            {loading
              ? Array(10).fill(0).map((_, i) => (
                <div key={i} style={{ borderRadius: 12, overflow: 'hidden' }}>
                  <Skeleton h={100} radius={12} />
                  <Skeleton h={16} radius={6} w="70%" />
                </div>
              ))
              : categories.map((cat) => (
                <Link key={cat.id} href={`/categories/${cat.slug}`}>
                  <div style={{
                    borderRadius: 12, overflow: 'hidden',
                    background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    transition: 'all 0.25s', cursor: 'pointer',
                    border: '2px solid transparent',
                  }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#C8E6C9'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; }}>
                    <div style={{ aspectRatio: '1', overflow: 'hidden', background: '#F1F8E9' }}>
                      <img src={cat.imageUrl || '/placeholder.jpg'} alt={cat.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                        onMouseOver={e => e.target.style.transform = 'scale(1.08)'}
                        onMouseOut={e => e.target.style.transform = 'scale(1)'} />
                    </div>
                    <div style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <p style={{ fontWeight: 700, fontSize: 12, color: '#1F2937', lineHeight: 1.3 }}>{cat.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* New Launch Products */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 className="section-title">Latest Products</h2>
              <p style={{ fontSize: 13, color: '#6B7280', marginTop: 12 }}>Freshly added items just for you</p>
            </div>
            <Link href="/collections/new-launch" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1B5E20', fontWeight: 700, fontSize: 13 }}>
              View All <ChevronRight style={{ width: 16 }} />
            </Link>
          </div>
          <div className="products-grid">
            {loading
              ? Array(8).fill(0).map((_, i) => (
                <div key={i} style={{ borderRadius: 12 }}>
                  <Skeleton h={180} radius={12} />
                  <div style={{ padding: 12 }}>
                    <Skeleton h={12} radius={4} w="60%" />
                    <Skeleton h={14} radius={4} />
                    <Skeleton h={14} radius={4} w="80%" />
                    <Skeleton h={20} radius={4} w="50%" />
                  </div>
                </div>
              ))
              : newProducts.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section style={{ background: 'linear-gradient(135deg, #FF6F00, #FFA000)', padding: '32px 16px' }}>
        <div className="container" style={{ textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 'clamp(20px, 4vw, 32px)', color: 'white', marginBottom: 8 }}>
            🚜 Special Offers for Farmers
          </h2>
          <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 24 }}>Get up to 1.5% extra discount on all prepaid orders!</p>
          <Link href="/collections/new-launch" className="btn" style={{ background: 'white', color: '#FF6F00', fontWeight: 800 }}>
            Shop Now & Save <ArrowRight style={{ width: 16 }} />
          </Link>
        </div>
      </section>

      {/* Fans Collection */}
      {fanProducts.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 className="section-title">Fans & Lighting</h2>
              <Link href="/collections/fans" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1B5E20', fontWeight: 700, fontSize: 13 }}>
                View All <ChevronRight style={{ width: 16 }} />
              </Link>
            </div>
            <div className="products-grid">
              {fanProducts.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* App Download Banner */}
      <section style={{ background: '#0F2412', padding: '40px 16px' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div style={{ color: 'white' }}>
            <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 'clamp(20px, 3vw, 28px)', color: 'white', marginBottom: 8 }}>
              📱 Download Our App
            </h2>
            <p style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 20 }}>Get exclusive app-only deals and track orders in real-time</p>
            <a href="https://play.google.com/store/apps/details?id=app.shoopy.kjn_trading_company" target="_blank" rel="noopener noreferrer">
              <img src="https://image.cdn.shpy.in/static/web-store/get-it-on-google-play-badge.png" alt="Get it on Google Play" style={{ height: 48 }} />
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 400 }}>
            {[
              { val: '1000+', label: 'Products' },
              { val: '50+', label: 'Brands' },
              { val: '10K+', label: 'Happy Farmers' },
              { val: '4.8★', label: 'App Rating' },
            ].map(({ val, label }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 24, color: '#4ade80' }}>{val}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}