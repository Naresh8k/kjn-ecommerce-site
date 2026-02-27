'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Heart, Star, Truck, Shield, RefreshCw, ChevronRight, Minus, Plus, Share2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';

export default function ProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeInfo, setPincodeInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data.data);
      } catch { router.push('/'); }
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [slug]);

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  const currentPrice = product ? parseFloat(product.sellingPrice) + (selectedVariant ? parseFloat(selectedVariant.additionalPrice) : 0) : 0;

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '4px solid #E8F5E9', borderTop: '4px solid #1B5E20', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#6B7280', fontWeight: 600 }}>Loading product...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!product) return null;

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '10px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#1B5E20', fontWeight: 600 }}>Home</Link>
          <ChevronRight style={{ width: 12 }} />
          <Link href={`/categories/${product.category?.slug}`} style={{ color: '#1B5E20', fontWeight: 600 }}>{product.category?.name}</Link>
          <ChevronRight style={{ width: 12 }} />
          <span style={{ color: '#374151', fontWeight: 600 }}>{product.name}</span>
        </div>
      </div>

      <div className="container" style={{ padding: '24px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>

          {/* Images */}
          <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {product.images?.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{ border: `2px solid ${activeImg === i ? '#1B5E20' : '#e5e7eb'}`, borderRadius: 10, overflow: 'hidden', background: 'white', cursor: 'pointer', padding: 0 }}>
                  <img src={img.url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', background: 'white', borderRadius: 16, overflow: 'hidden', aspectRatio: '1', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              <img src={product.images?.[activeImg]?.url || '/placeholder.jpg'} alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 16 }} />
              {product.discountPercent > 0 && (
                <div style={{ position: 'absolute', top: 16, left: 16 }}>
                  <span className="badge badge-discount" style={{ fontSize: 13, padding: '4px 12px' }}>{product.discountPercent}% OFF</span>
                </div>
              )}
              <button onClick={handleShare} style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, background: 'white', border: '1px solid #e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Share2 style={{ width: 16, color: '#6B7280' }} />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div>
            {/* Brand & Category */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              {product.brand && <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{product.brand.name}</span>}
              <span style={{ background: '#FFF8E1', color: '#FF6F00', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{product.category?.name}</span>
            </div>

            <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 'clamp(18px, 3vw, 26px)', lineHeight: 1.3, marginBottom: 12, color: '#1F2937' }}>{product.name}</h1>

            {/* Rating */}
            {product.averageRating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#1B5E20', color: 'white', padding: '4px 10px', borderRadius: 99, fontSize: 13, fontWeight: 700 }}>
                  <Star style={{ width: 14, fill: 'white' }} />
                  {product.averageRating}
                </div>
                <span style={{ fontSize: 13, color: '#6B7280' }}>{product.totalReviews} reviews</span>
                {product.inStock
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16A34A', fontSize: 13, fontWeight: 700 }}><CheckCircle style={{ width: 14 }} /> In Stock</span>
                  : <span style={{ color: '#DC2626', fontSize: 13, fontWeight: 700 }}>Out of Stock</span>}
              </div>
            )}

            {/* Price */}
            <div style={{ background: 'linear-gradient(135deg, #E8F5E9, #F1F8E9)', borderRadius: 16, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 32, color: '#1B5E20' }}>₹{currentPrice.toLocaleString('en-IN')}</span>
                {product.mrp > currentPrice && (
                  <>
                    <span style={{ fontSize: 18, color: '#9CA3AF', textDecoration: 'line-through' }}>₹{parseFloat(product.mrp).toLocaleString('en-IN')}</span>
                    <span style={{ background: '#FF3B30', color: 'white', padding: '2px 10px', borderRadius: 99, fontSize: 13, fontWeight: 800 }}>{product.discountPercent}% OFF</span>
                  </>
                )}
              </div>
              <p style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>Inclusive of all taxes. GST: {product.gstPercent}%</p>
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: '#374151' }}>
                  Select {product.variants[0]?.variantName}:
                  {selectedVariant && <span style={{ color: '#1B5E20', marginLeft: 8 }}>{selectedVariant.variantValue}</span>}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {product.variants.map((v) => (
                    <button key={v.id} onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                      style={{
                        padding: '8px 16px', borderRadius: 10, border: `2px solid ${selectedVariant?.id === v.id ? '#1B5E20' : '#e5e7eb'}`,
                        background: selectedVariant?.id === v.id ? '#E8F5E9' : 'white',
                        color: selectedVariant?.id === v.id ? '#1B5E20' : '#374151',
                        fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                      }}>
                      {v.variantValue}
                      {v.additionalPrice > 0 && <span style={{ fontSize: 11, marginLeft: 4 }}>+₹{v.additionalPrice}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: '#374151' }}>Quantity:</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '2px solid #e5e7eb', borderRadius: 12, width: 'fit-content', overflow: 'hidden' }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: 44, height: 44, border: 'none', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Minus style={{ width: 16, color: '#374151' }} />
                </button>
                <span style={{ width: 52, textAlign: 'center', fontWeight: 800, fontSize: 16, fontFamily: 'Sora' }}>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  style={{ width: 44, height: 44, border: 'none', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Plus style={{ width: 16, color: '#374151' }} />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <button onClick={handleAddToCart} disabled={adding || !product.inStock}
                className="btn btn-outline" style={{ flex: 1, minWidth: 140 }}>
                <ShoppingBag style={{ width: 18 }} />
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button onClick={handleBuyNow} disabled={adding || !product.inStock}
                className="btn btn-primary" style={{ flex: 1, minWidth: 140 }}>
                Buy Now
              </button>
              <button onClick={handleWishlist}
                style={{ width: 48, height: 48, borderRadius: 12, border: '2px solid #e5e7eb', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Heart style={{ width: 20, fill: wishlisted ? '#ef4444' : 'none', color: wishlisted ? '#ef4444' : '#9CA3AF' }} />
              </button>
            </div>

            {/* Pincode Check */}
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: '16px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Truck style={{ width: 18, color: '#1B5E20' }} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>Check Delivery</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" style={{ flex: 1 }} placeholder="Enter pincode" value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => e.key === 'Enter' && checkPincode()} />
                <button onClick={checkPincode} className="btn btn-primary btn-sm">Check</button>
              </div>
              {pincodeInfo && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: pincodeInfo.serviceable ? '#E8F5E9' : '#FEF2F2', borderRadius: 8 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: pincodeInfo.serviceable ? '#1B5E20' : '#DC2626' }}>
                    {pincodeInfo.message}
                  </p>
                  {pincodeInfo.serviceable && <p style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>Free shipping on orders above ₹500</p>}
                </div>
              )}
            </div>

            {/* Trust */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { icon: Shield, label: 'Genuine Product' },
                { icon: Truck, label: 'Fast Delivery' },
                { icon: RefreshCw, label: '7-Day Return' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px', background: '#f9fafb', borderRadius: 12 }}>
                  <Icon style={{ width: 20, color: '#1B5E20' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, textAlign: 'center', color: '#374151' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background: 'white', borderRadius: 16, marginTop: 24, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb' }}>
            {[
              { id: 'description', label: 'Description' },
              { id: 'specs', label: 'Specifications' },
              { id: 'reviews', label: `Reviews (${product.totalReviews})` },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, padding: '14px 16px', border: 'none', background: 'transparent',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                  borderBottom: activeTab === tab.id ? '3px solid #1B5E20' : '3px solid transparent',
                  color: activeTab === tab.id ? '#1B5E20' : '#6B7280',
                  marginBottom: -2,
                }}>
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ padding: '24px' }}>
            {activeTab === 'description' && (
              <div style={{ fontSize: 14, lineHeight: 1.8, color: '#374151' }}>
                {product.description || 'No description available.'}
              </div>
            )}
            {activeTab === 'specs' && (
              <div>
                {product.specifications
                  ? Object.entries(product.specifications).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ width: '40%', fontWeight: 700, fontSize: 13, color: '#374151' }}>{k}</span>
                      <span style={{ fontSize: 13, color: '#6B7280' }}>{v}</span>
                    </div>
                  ))
                  : <p style={{ color: '#6B7280', fontSize: 14 }}>No specifications available.</p>}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                {product.reviews?.length === 0
                  ? <p style={{ color: '#6B7280', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No reviews yet. Be the first to review!</p>
                  : product.reviews?.map((r) => (
                    <div key={r.id} style={{ padding: '16px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 14 }}>
                          {r.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 13 }}>{r.user?.name}</p>
                          <div style={{ display: 'flex', gap: 2 }}>
                            {[1,2,3,4,5].map(s => <Star key={s} style={{ width: 12, fill: s <= r.rating ? '#F59E0B' : 'none', color: s <= r.rating ? '#F59E0B' : '#D1D5DB' }} />)}
                          </div>
                        </div>
                        {r.isVerifiedPurchase && <span style={{ marginLeft: 'auto', background: '#E8F5E9', color: '#1B5E20', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>✓ Verified</span>}
                      </div>
                      {r.title && <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{r.title}</p>}
                      {r.body && <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{r.body}</p>}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}