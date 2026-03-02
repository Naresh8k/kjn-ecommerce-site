'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Star, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';
import api from '@/lib/api';

const NO_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 24 24' fill='none' stroke='%23D1D5DB' stroke-width='1'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";

export default function ProductCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding]         = useState(false);
  const { addToCart }               = useCartStore();
  const { isAuthenticated }         = useAuthStore();

  const discount = product.discountPercent ||
    (product.mrp > product.sellingPrice
      ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
      : 0);

  const handleAddToCart = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (product.stockQuantity === 0) return;
    setAdding(true);
    try {
      await addToCart(product.id, 1);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    } finally { setAdding(false); }
  };

  const handleWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    try {
      const res = await api.post(`/user/wishlist/${product.id}`);
      setWishlisted(res.data.wishlisted);
      toast.success(res.data.wishlisted ? 'Saved!' : 'Removed from wishlist');
    } catch { toast.error('Something went wrong'); }
  };

  const outOfStock = product.stockQuantity === 0;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-300 hover:shadow-xl transition-all duration-300 h-full flex flex-col">

        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50" style={{ paddingTop: '85%' }}>
          <img
            src={product.image || NO_IMAGE}
            alt={product.name}
            loading="lazy"
            onError={e => { e.target.onerror = null; e.target.src = NO_IMAGE; }}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Top badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-extrabold px-2 py-0.5 rounded-full">
                {discount}% OFF
              </span>
            )}
            {outOfStock && (
              <span className="bg-gray-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
          >
            <Heart
              className="w-4 h-4 transition-colors"
              style={{ fill: wishlisted ? '#ef4444' : 'none', color: wishlisted ? '#ef4444' : '#9CA3AF' }}
            />
          </button>

          {/* Quick add overlay */}
          {!outOfStock && (
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="w-full py-2.5 bg-primary-900 hover:bg-primary-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                <Zap className="w-3.5 h-3.5" />
                {adding ? 'Adding...' : 'Quick Add'}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          {/* Brand / Category */}
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1 truncate">
            {product.brand?.name || product.category?.name || ''}
          </p>

          {/* Name */}
          <h3 className="text-sm font-bold text-gray-800 leading-snug mb-2 line-clamp-2 flex-1">
            {product.name}
          </h3>

          {/* Rating */}
          {product.averageRating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star
                    key={s}
                    className="w-3 h-3"
                    style={{
                      fill: s <= Math.round(product.averageRating) ? '#F59E0B' : 'none',
                      color: s <= Math.round(product.averageRating) ? '#F59E0B' : '#D1D5DB'
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">({product.totalReviews})</span>
            </div>
          )}

          {/* Price row */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base font-extrabold text-gray-900">
              &#8377;{Number(product.sellingPrice).toLocaleString('en-IN')}
            </span>
            {product.mrp > product.sellingPrice && (
              <span className="text-xs text-gray-400 line-through">
                &#8377;{Number(product.mrp).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={adding || outOfStock}
            className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border-2 transition-all duration-200 ${
              outOfStock
                ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                : 'border-primary-900 text-primary-900 hover:bg-primary-900 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {outOfStock ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}