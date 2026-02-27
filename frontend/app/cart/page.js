'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';
import api from '@/lib/api';

export default function CartPage() {
  const { cart, fetchCart, updateItem, removeItem, applyCoupon, removeCoupon, loading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [coupon, setCoupon] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const router = useRouter();

  useEffect(() => { fetchCart(); }, []);

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) { toast.error('Enter coupon code'); return; }
    if (!isAuthenticated) { toast.error('Please login to apply coupons'); return; }
    setCouponLoading(true);
    try {
      const res = await applyCoupon(coupon.toUpperCase());
      toast.success(res.message);
      setCoupon('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally { setCouponLoading(false); }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      toast.success('Coupon removed');
    } catch { toast.error('Failed to remove coupon'); }
  };

  const handleQuantity = async (itemId, newQty) => {
    if (newQty < 1) return;
    try { await updateItem(itemId, newQty); }
    catch { toast.error('Failed to update quantity'); }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeItem(itemId);
      toast.success('Item removed');
    } catch { toast.error('Failed to remove item'); }
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #E8F5E9', borderTop: '4px solid #1B5E20', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!cart || cart.items?.length === 0) return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>🛒</div>
      <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 24, marginBottom: 8 }}>Your cart is empty</h2>
      <p style={{ color: '#6B7280', marginBottom: 24 }}>Add some products to continue shopping</p>
      <Link href="/" className="btn btn-primary">Start Shopping <ArrowRight style={{ width: 16 }} /></Link>
    </div>
  );

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '24px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 26, marginBottom: 24 }}>
          Shopping Cart <span style={{ fontSize: 16, color: '#6B7280', fontWeight: 600 }}>({cart.totalItems} items)</span>
        </h1>

        {/* Free shipping progress */}
        {cart.freeShippingRemaining > 0 && (
          <div style={{ background: '#FFF8E1', border: '1px solid #FCD34D', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Truck style={{ width: 20, color: '#F59E0B', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#92400E' }}>Add ₹{cart.freeShippingRemaining} more for FREE delivery!</p>
              <div style={{ marginTop: 6, height: 6, background: '#FDE68A', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#F59E0B', borderRadius: 99, width: `${Math.min(100, (cart.subtotal / 500) * 100)}%`, transition: 'width 0.5s' }} />
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cart.items.map((item) => (
              <div key={item.id} style={{ background: 'white', borderRadius: 16, padding: '16px', display: 'flex', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Link href={`/products/${item.slug}`}>
                  <img src={item.image || '/placeholder.jpg'} alt={item.name}
                    style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 12, background: '#f9fafb', flexShrink: 0 }} />
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/products/${item.slug}`}>
                    <h3 style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.4, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</h3>
                  </Link>
                  {item.variant && <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>{item.variant}</p>}
                  {!item.inStock && <p style={{ fontSize: 12, color: '#DC2626', fontWeight: 700, marginBottom: 4 }}>⚠ Low stock</p>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 16, color: '#1B5E20' }}>₹{item.totalPrice.toLocaleString('en-IN')}</span>
                      {item.mrp > item.unitPrice && (
                        <span style={{ fontSize: 12, color: '#9CA3AF', textDecoration: 'line-through', marginLeft: 6 }}>₹{(item.mrp * item.quantity).toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                        <button onClick={() => handleQuantity(item.id, item.quantity - 1)} style={{ width: 32, height: 32, border: 'none', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Minus style={{ width: 14 }} />
                        </button>
                        <span style={{ width: 36, textAlign: 'center', fontWeight: 800, fontSize: 14 }}>{item.quantity}</span>
                        <button onClick={() => handleQuantity(item.id, item.quantity + 1)} style={{ width: 32, height: 32, border: 'none', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus style={{ width: 14 }} />
                        </button>
                      </div>
                      <button onClick={() => handleRemove(item.id)} style={{ width: 32, height: 32, border: 'none', background: '#FEF2F2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Trash2 style={{ width: 14, color: '#DC2626' }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            {/* Coupon */}
            <div style={{ background: 'white', borderRadius: 16, padding: '20px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Tag style={{ width: 18, color: '#1B5E20' }} />
                <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16 }}>Apply Coupon</h3>
              </div>
              {cart.couponCode ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#E8F5E9', borderRadius: 10, padding: '10px 14px' }}>
                  <span style={{ fontWeight: 700, color: '#1B5E20', fontSize: 14 }}>✓ {cart.couponCode} applied!</span>
                  <button onClick={handleRemoveCoupon} style={{ color: '#DC2626', fontWeight: 700, fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" placeholder="Enter coupon code" value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()} />
                  <button onClick={handleApplyCoupon} disabled={couponLoading} className="btn btn-outline btn-sm" style={{ whiteSpace: 'nowrap' }}>
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            {/* Summary */}
            <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Subtotal', value: `₹${cart.subtotal?.toLocaleString('en-IN')}` },
                  { label: 'Discount', value: cart.couponDiscount > 0 ? `-₹${cart.couponDiscount?.toLocaleString('en-IN')}` : '₹0', color: '#16A34A' },
                  { label: 'Shipping', value: cart.shippingCharge === 0 ? 'FREE' : `₹${cart.shippingCharge}`, color: cart.shippingCharge === 0 ? '#16A34A' : undefined },
                  { label: 'GST (included)', value: `₹${cart.gstAmount?.toFixed(2)}`, small: true },
                ].map(({ label, value, color, small }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: small ? 12 : 14, color: small ? '#9CA3AF' : '#6B7280', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: small ? 12 : 14, fontWeight: 700, color: color || '#1F2937' }}>{value}</span>
                  </div>
                ))}
                <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 16 }}>Total</span>
                  <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20, color: '#1B5E20' }}>₹{cart.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                {cart.couponDiscount > 0 && (
                  <p style={{ background: '#E8F5E9', color: '#1B5E20', padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700, textAlign: 'center' }}>
                    🎉 You save ₹{cart.couponDiscount?.toLocaleString('en-IN')}!
                  </p>
                )}
              </div>
              <button onClick={() => router.push('/checkout')} className="btn btn-primary" style={{ width: '100%', marginTop: 16, fontSize: 15 }}>
                Proceed to Checkout <ArrowRight style={{ width: 18 }} />
              </button>
              <Link href="/" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 13, color: '#6B7280', fontWeight: 600 }}>
                <ShoppingBag style={{ width: 14, display: 'inline', marginRight: 4 }} /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}