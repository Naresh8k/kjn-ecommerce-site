'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag, Heart, Star, Truck, Shield, RefreshCw,
  ChevronRight, Minus, Plus, Share2, CheckCircle, Zap,
  MapPin, Tag, Timer, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';
import WriteReview from '@/components/product/WriteReview';

const RS = String.fromCharCode(8377);
function fmt(n) { return Number(n).toLocaleString('en-IN'); }


function FlashCountdown({ endDate }) {
  const [t, setT] = useState({ h: 0, m: 0, s: 0, expired: false });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate) - new Date();
      if (diff <= 0) return { h: 0, m: 0, s: 0, expired: true };
      return {
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        expired: false,
      };
    };
    setT(calc());
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  if (t.expired) return null;
  const pad = n => String(n).padStart(2, '0');
  return (
    <div className="flex items-center gap-2">
      {[['h', t.h], ['m', t.m], ['s', t.s]].map(([lbl, val]) => (
        <div key={lbl} className="bg-white/20 rounded-lg px-2.5 py-1 text-center min-w-[38px]">
          <div className="text-sm font-extrabold text-white font-mono leading-none">{pad(val)}</div>
          <div className="text-[9px] text-white/70 uppercase mt-0.5">{lbl}</div>
        </div>
      ))}
    </div>
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [flashSale, setFlashSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeInfo, setPincodeInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [imgZoom, setImgZoom] = useState(false);
  const [reviewData, setReviewData] = useState(null);   // fetched on tab open
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewFilter, setReviewFilter] = useState(null); // star filter
  const [zoomedReviewImg, setZoomedReviewImg] = useState(null);
  const [productEligibility, setProductEligibility] = useState(null); // canReview for this product
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${slug}`);
        const p = res.data.data;
        setProduct(p);
        // Check for active flash sale on this product
        const fsRes = await api.get('/flash-sales/active').catch(() => ({ data: { data: [] } }));
        const fs = (fsRes.data.data || []).find(s => s.product?.id === p.id || s.productId === p.id);
        if (fs) setFlashSale(fs);
      } catch { router.push('/'); }
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [slug]);

  const effectivePrice = flashSale
    ? parseFloat(flashSale.flashPrice)
    : product
      ? parseFloat(product.sellingPrice) + (selectedVariant ? parseFloat(selectedVariant.additionalPrice) : 0)
      : 0;

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(product.id, quantity, selectedVariant?.id || null);
      toast.success('Added to cart! 🛒');
    } catch { toast.error('Failed to add to cart'); }
    finally { setAdding(false); }
  };

  const handleBuyNow = async () => {
    setAdding(true);
    try {
      await addToCart(product.id, quantity, selectedVariant?.id || null);
      router.push('/cart');
    } catch { toast.error('Failed'); }
    finally { setAdding(false); }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login to save items'); return; }
    try {
      const res = await api.post(`/user/wishlist/${product.id}`);
      setWishlisted(res.data.wishlisted);
      toast.success(res.data.wishlisted ? 'Saved! ❤️' : 'Removed from wishlist');
    } catch { toast.error('Something went wrong'); }
  };

  const checkPincode = async () => {
    if (pincode.length !== 6) { toast.error('Enter valid 6-digit pincode'); return; }
    try {
      const res = await api.get(`/shipping/check/${pincode}`);
      setPincodeInfo(res.data);
    } catch { toast.error('Unable to check pincode'); }
  };

  const fetchReviews = async (productId, star = null) => {
    setReviewsLoading(true);
    try {
      const params = new URLSearchParams({ limit: 20 });
      if (star) params.set('rating', star);
      const res = await api.get(`/reviews/product/${productId}?${params}`);
      setReviewData(res.data.data);
    } catch { /* silent */ }
    finally { setReviewsLoading(false); }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'reviews' && product) {
      if (!reviewData) fetchReviews(product.id);
      if (productEligibility === null) {
        api.get(`/reviews/can-review/${product.id}`)
          .then(r => setProductEligibility(r.data))
          .catch(() => setProductEligibility({ canReview: false, reason: 'error' }));
      }
    }
  };

  const handleFilterChange = (star) => {
    const next = reviewFilter === star ? null : star;
    setReviewFilter(next);
    if (product) fetchReviews(product.id, next);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  // ── Savings calc ──
  const mrp = product ? parseFloat(product.mrp) : 0;
  const savings = mrp > effectivePrice ? mrp - effectivePrice : 0;
  const savingsPct = mrp > 0 ? Math.round((savings / mrp) * 100) : 0;

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-green-700 animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Loading product…</p>
      </div>
    </div>
  );

  if (!product) return null;

  const images = product.images?.length ? product.images : product.image ? [{ image: product.image }] : [];

  return (
    <div className="bg-gray-50 min-h-screen pb-28 md:pb-0">

      {/* ── Flash Sale Banner ── */}
      {flashSale && (
        <div className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white">
          <div className="container mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Zap className="w-4 h-4 text-yellow-200 flex-shrink-0" />
              <span>⚡ FLASH SALE — Save {RS}{fmt(savings)} ({savingsPct}% off)</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
              <Timer className="w-3.5 h-3.5" /> Ends in:
              <FlashCountdown endDate={flashSale.endDate} />
            </div>
          </div>
        </div>
      )}

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
          <Link href="/" className="hover:text-green-800 font-semibold transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/categories/${product.category?.slug}`} className="hover:text-green-800 font-semibold transition-colors">{product.category?.name}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="font-bold text-gray-700 truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14">

          {/* ════ IMAGE GALLERY ════ */}
          <div className="flex gap-3">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex flex-col gap-2 flex-shrink-0">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      activeImg === i ? 'border-green-700 shadow-md scale-105' : 'border-gray-200 hover:border-green-400'
                    }`}
                  >
                    <img src={img.image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="flex-1 relative">
              <div
                onClick={() => setImgZoom(true)}
                className="relative bg-white rounded-2xl overflow-hidden aspect-square shadow-sm border border-gray-100 cursor-zoom-in group"
              >
                <img
                  src={images[activeImg]?.image || ''}
                  alt={product.name}
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                  className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                  {flashSale ? (
                    <span className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg shadow">
                      <Zap className="w-3 h-3" /> FLASH DEAL
                    </span>
                  ) : savingsPct > 0 ? (
                    <span className="bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg shadow">
                      {savingsPct}% OFF
                    </span>
                  ) : null}
                  {!product.inStock && (
                    <span className="bg-gray-700 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow">Out of Stock</span>
                  )}
                </div>

                {/* Action buttons top-right */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); handleShare(); }}
                    className="w-9 h-9 rounded-xl bg-white shadow border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleWishlist(); }}
                    className="w-9 h-9 rounded-xl bg-white shadow border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Heart className="w-4 h-4 transition-colors" style={{ fill: wishlisted ? '#ef4444' : 'none', color: wishlisted ? '#ef4444' : '#9CA3AF' }} />
                  </button>
                </div>
              </div>

              {/* Dot nav */}
              {images.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`rounded-full transition-all ${activeImg === i ? 'w-5 h-2 bg-green-700' : 'w-2 h-2 bg-gray-300'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ════ PRODUCT INFO ════ */}
          <div className="flex flex-col gap-5">

            {/* Badges row */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.brand && (
                <span className="bg-green-50 text-green-800 border border-green-200 text-xs font-bold px-3 py-1 rounded-full">
                  {product.brand.name}
                </span>
              )}
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full">
                {product.category?.name}
              </span>
              {product.inStock
                ? <span className="flex items-center gap-1 text-green-700 text-xs font-bold"><CheckCircle className="w-3.5 h-3.5" /> In Stock</span>
                : <span className="text-red-600 text-xs font-bold">Out of Stock</span>}
            </div>

            {/* Name */}
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.averageRating && (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 bg-green-800 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-white" />
                  {product.averageRating}
                </div>
                <span className="text-sm text-gray-500">{product.totalReviews} reviews</span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className="w-3.5 h-3.5"
                      style={{ fill: s <= Math.round(product.averageRating) ? '#F59E0B' : 'none', color: s <= Math.round(product.averageRating) ? '#F59E0B' : '#D1D5DB' }} />
                  ))}
                </div>
              </div>
            )}

            {/* Price Card */}
            <div className={`rounded-2xl p-5 border ${flashSale ? 'bg-gradient-to-br from-red-50 to-orange-50 border-orange-200' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'}`}>
              {flashSale && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-full">
                    <Zap className="w-3.5 h-3.5" /> Flash Sale Price
                  </span>
                  <FlashCountdown endDate={flashSale.endDate} />
                </div>
              )}
              <div className="flex items-baseline gap-3 flex-wrap mb-2">
                <span className={`font-heading font-extrabold text-4xl ${flashSale ? 'text-red-600' : 'text-green-800'}`}>
                  {RS}{fmt(effectivePrice)}
                </span>
                {mrp > effectivePrice && (
                  <span className="text-xl text-gray-400 line-through font-medium">{RS}{fmt(mrp)}</span>
                )}
                {savingsPct > 0 && (
                  <span className="bg-red-500 text-white text-sm font-extrabold px-2.5 py-1 rounded-full">
                    {savingsPct}% OFF
                  </span>
                )}
              </div>
              {savings > 0 && (
                <p className="text-sm font-bold text-green-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  You save {RS}{fmt(savings)} on this product!
                </p>
              )}
              {flashSale && product.sellingPrice && parseFloat(product.sellingPrice) > effectivePrice && (
                <p className="text-xs text-gray-500 mt-1.5">
                  Regular price: <span className="line-through">{RS}{fmt(product.sellingPrice)}</span>
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">Inclusive of all taxes. GST: {product.gstPercent}%</p>
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div>
                <p className="font-bold text-sm text-gray-700 mb-3">
                  {product.variants[0]?.variantName}:
                  {selectedVariant && <span className="text-green-700 ml-2">{selectedVariant.variantValue}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                      className={`px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${
                        selectedVariant?.id === v.id
                          ? 'border-green-700 bg-green-50 text-green-800'
                          : 'border-gray-200 text-gray-700 hover:border-green-400 hover:bg-green-50'
                      }`}
                    >
                      {v.variantValue}
                      {v.additionalPrice > 0 && <span className="text-xs ml-1 opacity-70">+{RS}{fmt(v.additionalPrice)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + CTA */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Stepper */}
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-4 h-4 text-gray-700" />
                </button>
                <span className="w-12 text-center font-extrabold text-base text-gray-900 select-none">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-11 h-11 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-700" />
                </button>
              </div>
              <span className="text-xs text-gray-500 font-semibold">Max 10 per order</span>
            </div>

            {/* Desktop CTA buttons */}
            <div className="hidden md:flex gap-3 flex-wrap">
              <button
                onClick={handleAddToCart}
                disabled={adding || !product.inStock}
                className="flex-1 min-w-[150px] flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-green-800 text-green-800 font-extrabold text-sm hover:bg-green-800 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                {adding ? 'Adding…' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={adding || !product.inStock}
                className={`flex-1 min-w-[150px] py-3.5 rounded-2xl font-extrabold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                  flashSale
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-orange-200'
                    : 'bg-green-800 hover:bg-green-700 shadow-green-200'
                }`}
              >
                {flashSale ? '⚡ Buy at Flash Price' : 'Buy Now'}
              </button>
            </div>

            {/* Delivery Check */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-green-700" />
                </div>
                <span className="font-bold text-sm text-gray-900">Check Delivery</span>
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:border-green-700 focus:outline-none font-semibold"
                  placeholder="Enter 6-digit pincode"
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={e => e.key === 'Enter' && checkPincode()}
                />
                <button onClick={checkPincode} className="px-5 py-2.5 bg-green-800 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-colors">
                  Check
                </button>
              </div>
              {pincodeInfo && (
                <div className={`mt-3 p-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                  pincodeInfo.serviceable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                }`}>
                  {pincodeInfo.serviceable ? <Truck className="w-4 h-4 flex-shrink-0" /> : <X className="w-4 h-4 flex-shrink-0" />}
                  <div>
                    {pincodeInfo.message}
                    {pincodeInfo.serviceable && <p className="text-xs text-gray-500 font-normal mt-0.5">Free shipping on orders above {RS}500</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: 'Genuine Product', sub: '100% authentic' },
                { icon: Truck, label: 'Fast Delivery', sub: '2-5 business days' },
                { icon: RefreshCw, label: '7-Day Return', sub: 'Hassle-free' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-2 p-3 bg-white border border-gray-100 rounded-2xl text-center">
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-green-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800 leading-tight">{label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════ TABS ════ */}
        <div className="bg-white rounded-2xl mt-8 overflow-hidden shadow-sm border border-gray-100">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {[
              { id: 'description', label: 'Description' },
              { id: 'specs', label: 'Specifications' },
              { id: 'reviews', label: `Reviews (${product.totalReviews || 0})` },
            ].map(tab => (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                className={`flex-1 min-w-[120px] px-5 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id ? 'border-green-700 text-green-800 bg-green-50/40' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {/* ── Description ── */}
            {activeTab === 'description' && (
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                {product.description || <p className="text-gray-400 italic">No description available.</p>}
              </div>
            )}

            {/* ── Specifications ── */}
            {activeTab === 'specs' && (
              <div className="divide-y divide-gray-50">
                {product.specifications
                  ? Object.entries(product.specifications).map(([k, v]) => (
                    <div key={k} className="flex py-3 gap-4">
                      <span className="w-2/5 font-bold text-sm text-gray-700 flex-shrink-0">{k}</span>
                      <span className="text-sm text-gray-500">{v}</span>
                    </div>
                  ))
                  : <p className="text-gray-400 italic text-sm">No specifications available.</p>}
              </div>
            )}

            {/* ── Reviews (Flipkart-style) ── */}
            {activeTab === 'reviews' && (
              <div className="space-y-8">

                {/* Rating Summary */}
                {reviewData && reviewData.totalAll > 0 && (
                  <div className="flex flex-col md:flex-row gap-6 pb-6 border-b border-gray-100">
                    {/* Big score */}
                    <div className="flex flex-col items-center justify-center bg-green-50 rounded-2xl p-6 min-w-[140px] text-center flex-shrink-0">
                      <div className="text-5xl font-extrabold text-green-800 leading-none">{reviewData.average}</div>
                      <div className="flex gap-0.5 mt-2 justify-center">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className="w-4 h-4"
                            style={{ fill: s <= Math.round(parseFloat(reviewData.average)) ? '#16a34a' : 'none', color: s <= Math.round(parseFloat(reviewData.average)) ? '#16a34a' : '#D1D5DB' }} />
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 font-semibold">{reviewData.totalAll} rating{reviewData.totalAll !== 1 ? 's' : ''}</div>
                    </div>

                    {/* Distribution bars */}
                    <div className="flex-1 space-y-2.5">
                      {(reviewData.distribution || []).map(({ star, count, percent }) => (
                        <button key={star} onClick={() => handleFilterChange(star)}
                          className={`w-full flex items-center gap-3 group transition-opacity ${
                            reviewFilter && reviewFilter !== star ? 'opacity-40' : 'opacity-100'
                          }`}>
                          <div className="flex items-center gap-1 w-10 flex-shrink-0">
                            <span className="text-xs font-bold text-gray-700">{star}</span>
                            <Star className="w-3.5 h-3.5" style={{ fill: '#F59E0B', color: '#F59E0B' }} />
                          </div>
                          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 font-semibold w-8 text-right flex-shrink-0">{count}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* All customer photos strip */}
                {reviewData && (() => {
                  const allImgs = (reviewData.reviews || []).flatMap(r => r.images || []);
                  return allImgs.length > 0 ? (
                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-3">Customer Photos</p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {allImgs.map((img, idx) => (
                          <button key={idx} onClick={() => setZoomedReviewImg(img.url)}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 border-gray-100 hover:border-green-400 transition-all flex-shrink-0 group">
                            <img src={img.url} alt="Customer photo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Star filter chips */}
                {reviewData && reviewData.totalAll > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => handleFilterChange(null)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                        !reviewFilter ? 'bg-green-800 text-white border-green-800' : 'border-gray-300 text-gray-600 hover:border-green-600'
                      }`}>All</button>
                    {[5,4,3,2,1].map(s => (
                      <button key={s} onClick={() => handleFilterChange(s)}
                        className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                          reviewFilter === s ? 'bg-green-800 text-white border-green-800' : 'border-gray-300 text-gray-600 hover:border-green-600'
                        }`}>
                        {s} <Star className="w-3 h-3" style={{ fill: 'currentColor' }} />
                      </button>
                    ))}
                  </div>
                )}

                {/* Review cards */}
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="animate-pulse flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-1/4" />
                          <div className="h-3 bg-gray-200 rounded w-1/3" />
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reviewData && reviewData.reviews?.length > 0 ? (
                  <div className="space-y-6">
                    {reviewData.reviews.map(r => (
                      <div key={r.id} className="pb-6 border-b border-gray-50 last:border-0">
                        <div className="flex gap-4">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-700 to-green-500 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
                            {r.user?.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            {/* Name + stars + badge */}
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-bold text-sm text-gray-900">{r.user?.name}</span>
                              <div className="flex gap-0.5">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} className="w-3.5 h-3.5"
                                    style={{ fill: s <= r.rating ? '#F59E0B' : 'none', color: s <= r.rating ? '#F59E0B' : '#D1D5DB' }} />
                                ))}
                              </div>
                              <span className="text-xs font-bold text-gray-500">{r.rating}/5</span>
                              {r.isVerifiedPurchase && (
                                <span className="flex items-center gap-0.5 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">
                                  <CheckCircle className="w-2.5 h-2.5" /> Verified Purchase
                                </span>
                              )}
                            </div>
                            {/* Date */}
                            <p className="text-[11px] text-gray-400 mb-2">
                              {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            {/* Title */}
                            {r.title && <p className="font-bold text-sm text-gray-800 mb-1">{r.title}</p>}
                            {/* Body */}
                            {r.body && <p className="text-sm text-gray-600 leading-relaxed">{r.body}</p>}
                            {/* Customer images */}
                            {r.images?.length > 0 && (
                              <div className="flex gap-2 mt-3 flex-wrap">
                                {r.images.map((img, idx) => (
                                  <button key={idx} onClick={() => setZoomedReviewImg(img.url)}
                                    className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 hover:border-green-400 transition-all flex-shrink-0">
                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reviewData && reviewData.reviews?.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold text-sm">
                      {reviewFilter ? `No ${reviewFilter}-star reviews yet.` : 'No reviews yet. Be the first to review!'}
                    </p>
                  </div>
                ) : null}

                {/* Write Review Form */}
                <div className="pt-4 border-t border-gray-100">
                  {productEligibility?.reason !== 'already_reviewed' && (
                    <h4 className="font-extrabold text-base text-gray-900 mb-4">Write a Review</h4>
                  )}
                  <WriteReview
                    productId={product.id}
                    onReviewAdded={(review) => {
                      fetchReviews(product.id, reviewFilter);
                      setProductEligibility({ canReview: false, reason: 'already_reviewed', existingReview: review });
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Zoomed review image modal */}
        {zoomedReviewImg && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setZoomedReviewImg(null)}>
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white">
              <X className="w-5 h-5" />
            </button>
            <img src={zoomedReviewImg} alt="Review" className="max-w-full max-h-full object-contain rounded-xl" onClick={e => e.stopPropagation()} />
          </div>
        )}
      </div>

      {/* ════ MOBILE STICKY CTA ════ */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 md:hidden z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="flex-shrink-0">
          <p className="text-xs text-gray-500 font-semibold leading-none mb-0.5">Price</p>
          <p className={`font-extrabold text-lg leading-none ${flashSale ? 'text-red-600' : 'text-green-800'}`}>
            {RS}{fmt(effectivePrice)}
          </p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={adding || !product.inStock}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-green-800 text-green-800 font-extrabold text-sm hover:bg-green-50 transition-all disabled:opacity-50"
        >
          <ShoppingBag className="w-4 h-4" />
          {adding ? 'Adding…' : 'Add to Cart'}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={adding || !product.inStock}
          className={`flex-1 py-3 rounded-xl font-extrabold text-sm text-white transition-all disabled:opacity-50 ${
            flashSale ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-green-800 hover:bg-green-700'
          }`}
        >
          {flashSale ? '⚡ Buy Now' : 'Buy Now'}
        </button>
      </div>

      {/* ════ IMAGE ZOOM MODAL ════ */}
      {imgZoom && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setImgZoom(false)}
        >
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <img
            src={images[activeImg]?.image || ''}
            alt={product.name}
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setActiveImg(i); }}
                  className={`rounded-full transition-all ${activeImg === i ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

