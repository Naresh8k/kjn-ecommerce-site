'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';
import useCartStore from '@/store/useCartStore';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/user/wishlist');
      setWishlist(res.data.data || []);
    } finally { setLoading(false); }
  };

  const handleRemove = async (productId) => {
    try {
      await api.post(`/user/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((w) => w.productId !== productId));
      toast.success('Removed from wishlist');
    } catch { toast.error('Failed'); }
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      toast.success('Added to cart! 🛒');
    } catch { toast.error('Failed to add to cart'); }
  };

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '24px 0 80px' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Heart style={{ width: 24, color: '#ef4444', fill: '#ef4444' }} />
          <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 26 }}>My Wishlist</h1>
          {wishlist.length > 0 && <span style={{ background: '#ef4444', color: 'white', padding: '2px 10px', borderRadius: 99, fontSize: 13, fontWeight: 700 }}>{wishlist.length}</span>}
        </div>

        {loading ? (
          <div className="products-grid">
            {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 260, borderRadius: 12 }} />)}
          </div>
        ) : wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Heart style={{ width: 64, height: 64, color: '#e5e7eb', margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Your wishlist is empty</h3>
            <p style={{ color: '#6B7280', marginBottom: 24 }}>Save items you love by tapping the heart icon</p>
            <Link href="/" className="btn btn-primary">Shop Now <ArrowRight style={{ width: 16 }} /></Link>
          </div>
        ) : (
          <div className="products-grid">
            {wishlist.map((item) => (
              <div key={item.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.25s' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}>
                <Link href={`/products/${item.slug}`}>
                  <div style={{ position: 'relative', aspectRatio: '1', background: '#f9fafb' }}>
                    <img src={item.image || 'https://via.placeholder.com/100?text=No+Image'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src = 'https://via.placeholder.com/100?text=No+Image'} />
                    {item.discountPercent > 0 && (
                      <span className="badge badge-discount" style={{ position: 'absolute', top: 10, left: 10 }}>{item.discountPercent}% off</span>
                    )}
                  </div>
                </Link>
                <div style={{ padding: '12px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 15, color: '#1B5E20' }}>₹{item.sellingPrice?.toLocaleString('en-IN')}</span>
                    {item.mrp > item.sellingPrice && <span style={{ fontSize: 12, color: '#9CA3AF', textDecoration: 'line-through' }}>₹{item.mrp?.toLocaleString('en-IN')}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleAddToCart(item.productId)}
                      className="btn btn-primary btn-sm" style={{ flex: 1, fontSize: 12 }}>
                      <ShoppingBag style={{ width: 13 }} /> Add to Cart
                    </button>
                    <button onClick={() => handleRemove(item.productId)}
                      style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Heart style={{ width: 14, fill: '#ef4444', color: '#ef4444' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}