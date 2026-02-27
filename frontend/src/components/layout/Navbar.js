'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, Heart, User, Menu, X, ChevronDown, MapPin } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import useCartStore from '@/store/useCartStore';
import api from '@/lib/api';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const router = useRouter();
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetchCart();
    api.get('/categories').then((r) => setCategories(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const res = await api.get(`/products/search?q=${searchQuery}`);
          setSearchResults(res.data.data || []);
        } catch { setSearchResults([]); }
      } else setSearchResults([]);
    }, 350);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const cartCount = cart?.totalItems || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'white',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.10)' : '0 1px 0 #e5e7eb',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: 68, gap: 16 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontFamily: 'Sora', fontWeight: 800, fontSize: 18,
              boxShadow: '0 4px 14px rgba(27,94,32,0.3)',
            }}>KJN</div>
            <div style={{ display: 'none' }} className="logo-text">
              <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 18, color: '#1B5E20', lineHeight: 1.1 }}>KJN Shop</div>
              <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 600 }}>Farm Equipment</div>
            </div>
          </Link>

          {/* Search bar — desktop */}
          <div style={{ flex: 1, maxWidth: 520, position: 'relative' }} className="search-desktop">
            <form onSubmit={handleSearch}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', width: 18 }} />
                <input
                  className="input"
                  style={{ paddingLeft: 44, paddingRight: 16, borderRadius: 99, background: '#F9FAFB', border: '2px solid #e5e7eb', height: 44 }}
                  placeholder="Search for farm equipment, tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                />
              </div>
            </form>
            {searchOpen && searchResults.length > 0 && (
              <div style={{
                position: 'absolute', top: '110%', left: 0, right: 0,
                background: 'white', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                border: '1px solid #e5e7eb', zIndex: 300, overflow: 'hidden',
              }}>
                {searchResults.map((p) => (
                  <Link key={p.id} href={`/products/${p.slug}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid #f3f4f6' }}
                    onMouseDown={() => router.push(`/products/${p.slug}`)}>
                    {p.image && <img src={p.image} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: '#16A34A', fontWeight: 700 }}>₹{p.sellingPrice?.toLocaleString()}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Nav Links — desktop */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="nav-desktop">
            <div style={{ position: 'relative' }}
              onMouseEnter={() => setCatMenuOpen(true)}
              onMouseLeave={() => setCatMenuOpen(false)}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '8px 14px', borderRadius: 8, border: 'none',
                background: 'transparent', fontWeight: 700, fontSize: 14, color: '#374151',
                transition: 'all 0.2s',
              }}
                onClick={() => setCatMenuOpen(prev => !prev)}>
                Categories <ChevronDown style={{ width: 16 }} />
              </button>
              {catMenuOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0,
                  background: 'white', borderRadius: 12,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  border: '1px solid #e5e7eb', zIndex: 300,
                  minWidth: 220, padding: 8,
                }}>
                  {categories.map((cat) => (
                    <Link key={cat.id} href={`/categories/${cat.slug}`}
                      style={{ display: 'block', padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#374151', transition: 'all 0.2s' }}
                      onMouseOver={e => e.target.style.background = '#F1F8E9'}
                      onMouseOut={e => e.target.style.background = 'transparent'}>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/blog" style={{ padding: '8px 14px', fontWeight: 700, fontSize: 14, color: '#374151', borderRadius: 8 }}>Blog</Link>
            <Link href="/menu" style={{ padding: '8px 14px', fontWeight: 700, fontSize: 14, color: '#374151', borderRadius: 8 }}>More</Link>
            <Link href="/contact-us" style={{ padding: '8px 14px', fontWeight: 700, fontSize: 14, color: '#374151', borderRadius: 8 }}>Contact</Link>
          </nav>

          {/* Right Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            {/* Search icon — mobile */}
            <button className="icon-btn-mobile"
              onClick={() => router.push('/search')}
              style={{ width: 40, height: 40, borderRadius: 10, border: 'none', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search style={{ width: 20, color: '#374151' }} />
            </button>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link href="/account/wishlist"
                style={{ width: 40, height: 40, borderRadius: 10, border: 'none', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart style={{ width: 20, color: '#374151' }} />
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart"
              style={{ position: 'relative', width: 40, height: 40, borderRadius: 10, border: 'none', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag style={{ width: 20, color: '#374151' }} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  background: '#FF6F00', color: 'white',
                  width: 18, height: 18, borderRadius: '50%',
                  fontSize: 10, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{cartCount > 9 ? '9+' : cartCount}</span>
              )}
            </Link>

            {/* Account */}
            {isAuthenticated ? (
              <div style={{ position: 'relative' }} className="account-dropdown">
                <button style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px',
                  borderRadius: 99, border: '2px solid #e5e7eb', background: 'white',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 800 }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="nav-desktop">{user?.name?.split(' ')[0]}</span>
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn btn-primary btn-sm">Login</Link>
            )}
          </div>
        </div>
      </header>

      <style>{`
        @media (max-width: 767px) {
          .search-desktop { display: none !important; }
          .nav-desktop { display: none !important; }
          .logo-text { display: block !important; }
        }
        @media (min-width: 768px) {
          .icon-btn-mobile { display: none !important; }
          .logo-text { display: block !important; }
        }
        .icon-btn-mobile:hover, a:hover { opacity: 0.85; }
      `}</style>
    </>
  );
}