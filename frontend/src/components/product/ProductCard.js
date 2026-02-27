'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Star, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';
import api from '@/lib/api';

export default function ProductCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      await addToCart(product.id, 1);
      toast.success('Added to cart!', { icon: '🛒' });
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login to save items'); return; }
    try {
      const res = await api.post(`/user/wishlist/${product.id}`);
      setWishlisted(res.data.wishlisted);
      toast.success(res.data.wishlisted ? 'Saved to wishlist!' : 'Removed from wishlist');
    } catch { toast.error('Something went wrong'); }
  };

  const discountPercent = product.discountPercent ||
    Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100);

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="product-card">
        {/* Image */}
        <div className="card-img-wrap">
          <img
            src={product.image || '/placeholder.jpg'}
            alt={product.name}
            loading="lazy"
          />
          {/* Badges */}
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {discountPercent > 0 && (
              <span className="badge badge-discount">{discountPercent}% off</span>
            )}
            {product.stockQuantity === 0 && (
              <span className="badge badge-out">Out of Stock</span>
            )}
          </div>
          {/* Wishlist */}
          <button onClick={handleWishlist} style={{
            position: 'absolute', top: 10, right: 10,
            width: 34, height: 34, borderRadius: '50%',
            background: 'white', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'all 0.2s',
          }}>
            <Heart style={{ width: 16, fill: wishlisted ? '#ef4444' : 'none', color: wishlisted ? '#ef4444' : '#9CA3AF' }} />
          </button>
          {/* Quick add — shows on hover */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            padding: '20px 12px 12px',
            transform: 'translateY(100%)',
            transition: 'transform 0.3s ease',
          }} className="quick-add">
            <button onClick={handleAddToCart} disabled={adding || product.stockQuantity === 0}
              style={{
                width: '100%', padding: '8px', borderRadius: 8, border: 'none',
                background: adding ? '#9CA3AF' : '#FF6F00',
                color: 'white', fontWeight: 700, fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
              <ShoppingBag style={{ width: 14 }} />
              {adding ? 'Adding...' : 'Quick Add'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '12px' }}>
          <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, marginBottom: 4 }}>{product.brand?.name || product.category?.name}</p>
          <h3 style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </h3>

          {/* Rating */}
          {product.averageRating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
              <div className="stars">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} style={{ width: 11, fill: s <= Math.round(product.averageRating) ? '#F59E0B' : 'none', color: s <= Math.round(product.averageRating) ? '#F59E0B' : '#D1D5DB' }} />
                ))}
              </div>
              <span style={{ fontSize: 11, color: '#6B7280' }}>({product.totalReviews})</span>
            </div>
          )}

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 16, color: '#1B5E20' }}>
              ₹{product.sellingPrice?.toLocaleString('en-IN')}
            </span>
            {product.mrp > product.sellingPrice && (
              <span style={{ fontSize: 12, color: '#9CA3AF', textDecoration: 'line-through' }}>
                ₹{product.mrp?.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Add to cart button */}
          <button onClick={handleAddToCart} disabled={adding || product.stockQuantity === 0}
            style={{
              width: '100%', marginTop: 10, padding: '9px',
              borderRadius: 8, border: '2px solid',
              borderColor: product.stockQuantity === 0 ? '#e5e7eb' : '#1B5E20',
              background: product.stockQuantity === 0 ? '#f9fafb' : 'transparent',
              color: product.stockQuantity === 0 ? '#9CA3AF' : '#1B5E20',
              fontWeight: 700, fontSize: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.2s',
            }}
            onMouseOver={e => { if (product.stockQuantity > 0) { e.currentTarget.style.background = '#1B5E20'; e.currentTarget.style.color = 'white'; } }}
            onMouseOut={e => { if (product.stockQuantity > 0) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1B5E20'; } }}>
            {product.stockQuantity === 0 ? 'Out of Stock' : adding ? 'Adding...' : <><ShoppingBag style={{ width: 13 }} /> Add to Bag</>}
          </button>
        </div>

        <style>{`.product-card:hover .quick-add { transform: translateY(0) !important; }`}</style>
      </div>
    </Link>
  );
}