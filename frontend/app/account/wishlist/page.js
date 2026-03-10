'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowRight, ArrowLeft, Trash2, Package, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';
import useCartStore from '@/store/useCartStore';

const NO_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%23D1D5DB' stroke-width='1'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";

function WishlistSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white rounded-2xl p-4 flex gap-4 animate-pulse border border-gray-100">
          <div className="w-24 h-24 rounded-xl bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-2.5 pt-1">
            <div className="h-3.5 bg-gray-200 rounded-full w-3/4" />
            <div className="h-3 bg-gray-100 rounded-full w-1/2" />
            <div className="h-5 bg-gray-200 rounded-full w-1/3" />
            <div className="flex gap-2 pt-1">
              <div className="h-9 bg-gray-200 rounded-xl flex-1" />
              <div className="h-9 w-9 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);
  const [removing, setRemoving] = useState(null);
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
    setRemoving(productId);
    try {
      await api.post(`/user/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((w) => w.productId !== productId));
      toast.success('Removed from wishlist');
    } catch { toast.error('Failed to remove'); }
    finally { setRemoving(null); }
  };

  const handleAddToCart = async (productId) => {
    setAddingToCart(productId);
    try {
      await addToCart(productId, 1);
      toast.success('Added to cart!');
    } catch { toast.error('Failed to add to cart'); }
    finally { setAddingToCart(null); }
  };

  const savings = (item) => item.mrp > item.sellingPrice
    ? Math.round(((item.mrp - item.sellingPrice) / item.mrp) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* ── Sticky Header ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between" style={{ maxWidth: 640 }}>
          <div className="flex items-center gap-3">
            <Link href="/account"
              className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </Link>
            <div>
              <h1 className="font-heading font-extrabold text-lg text-gray-900 leading-tight flex items-center gap-2">
                My Wishlist
                {wishlist.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center flex-shrink-0">
                    {wishlist.length > 9 ? '9+' : wishlist.length}
                  </span>
                )}
              </h1>
              {!loading && (
                <p className="text-[11px] text-gray-400 font-semibold">{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          {wishlist.length > 0 && (
            <Link href="/products"
              className="flex items-center gap-1.5 text-xs font-extrabold text-primary-900 border border-primary-100 bg-primary-50 px-3 py-1.5 rounded-xl hover:bg-primary-100 transition-colors">
              <ShoppingCart className="w-3.5 h-3.5" /> Browse More
            </Link>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 pt-5" style={{ maxWidth: 640 }}>

        {/* ── Loading ── */}
        {loading && <WishlistSkeleton />}

        {/* ── Empty State ── */}
        {!loading && wishlist.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-5">
              <Heart className="w-12 h-12 text-red-200" />
            </div>
            <h3 className="font-heading font-extrabold text-xl text-gray-800 mb-2">Your wishlist is empty</h3>
            <p className="text-sm text-gray-500 font-semibold mb-6 max-w-xs leading-relaxed">
              Save items you love by tapping the ❤️ icon on any product
            </p>
            <Link href="/products"
              className="flex items-center gap-2 px-7 py-3 bg-primary-900 hover:bg-primary-800 text-white font-extrabold text-sm rounded-xl transition-colors shadow-primary">
              <ShoppingBag className="w-4 h-4" /> Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ── Wishlist Items ── */}
        {!loading && wishlist.length > 0 && (
          <div className="space-y-3">
            {wishlist.map((item) => {
              const disc = savings(item);
              const isAdding = addingToCart === item.productId;
              const isRemoving = removing === item.productId;
              return (
                <div key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-soft hover:shadow-medium transition-all duration-200 overflow-hidden">
                  <div className="flex gap-0">

                    {/* ── Product Image ── */}
                    <Link href={`/products/${item.slug}`} className="flex-shrink-0 relative block">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gray-50 relative overflow-hidden">
                        <img
                          src={item.image || NO_IMAGE}
                          alt={item.name}
                          onError={e => { e.currentTarget.src = NO_IMAGE; }}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        {disc > 0 && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-lg leading-tight">
                            -{disc}%
                          </span>
                        )}
                        {!item.inStock && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white text-[10px] font-extrabold bg-black/60 px-2 py-0.5 rounded-full">Out of Stock</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* ── Product Info ── */}
                    <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
                      <div>
                        <Link href={`/products/${item.slug}`}>
                          <h3 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2 hover:text-primary-900 transition-colors mb-1.5">
                            {item.name}
                          </h3>
                        </Link>

                        {/* Price row */}
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-heading font-extrabold text-base text-primary-900">
                            ₹{item.sellingPrice?.toLocaleString('en-IN')}
                          </span>
                          {item.mrp > item.sellingPrice && (
                            <span className="text-xs text-gray-400 line-through font-semibold">
                              ₹{item.mrp?.toLocaleString('en-IN')}
                            </span>
                          )}
                          {disc > 0 && (
                            <span className="text-[11px] font-extrabold text-green-600">
                              {disc}% off
                            </span>
                          )}
                        </div>

                        {/* Savings pill */}
                        {item.mrp > item.sellingPrice && (
                          <p className="text-[11px] text-green-600 font-semibold mt-0.5">
                            You save ₹{(item.mrp - item.sellingPrice).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>

                      {/* ── Actions ── */}
                      <div className="flex items-center gap-2 mt-2.5">
                        <button
                          onClick={() => handleAddToCart(item.productId)}
                          disabled={isAdding || !item.inStock}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary-900 hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs transition-colors">
                          {isAdding
                            ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Adding...</>
                            : !item.inStock
                              ? 'Out of Stock'
                              : <><ShoppingBag className="w-3.5 h-3.5" /> Add to Cart</>}
                        </button>

                        <button
                          onClick={() => handleRemove(item.productId)}
                          disabled={isRemoving}
                          className="w-10 h-10 rounded-xl border border-red-100 bg-red-50 flex items-center justify-center hover:bg-red-100 active:scale-95 transition-all disabled:opacity-50 flex-shrink-0">
                          {isRemoving
                            ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            : <Trash2 className="w-4 h-4 text-red-500" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}