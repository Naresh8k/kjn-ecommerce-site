'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, MapPin, ChevronRight, Phone, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

const statusColors = {
  PENDING: { bg: '#FFF8E1', color: '#F59E0B', step: 0 },
  CONFIRMED: { bg: '#E8F5E9', color: '#16A34A', step: 1 },
  PROCESSING: { bg: '#EFF6FF', color: '#2563EB', step: 2 },
  SHIPPED: { bg: '#F0FDF4', color: '#059669', step: 3 },
  OUT_FOR_DELIVERY: { bg: '#FFF7ED', color: '#EA580C', step: 4 },
  DELIVERED: { bg: '#E8F5E9', color: '#1B5E20', step: 5 },
  CANCELLED: { bg: '#FEF2F2', color: '#DC2626', step: -1 },
};

const steps = ['Order Placed', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    api.get(`/orders/${id}`).then((r) => setOrder(r.data.data)).catch(() => router.push('/orders')).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await api.post(`/orders/${id}/cancel`);
      toast.success('Order cancelled successfully');
      setOrder((prev) => ({ ...prev, status: 'CANCELLED' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel order');
    } finally { setCancelling(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #E8F5E9', borderTop: '4px solid #1B5E20', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!order) return null;

  const statusInfo = statusColors[order.status] || { bg: '#f3f4f6', color: '#6B7280', step: 0 };
  const currentStep = statusInfo.step;

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '24px 0 80px' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 24 }}>
          <Link href="/orders" style={{ color: '#1B5E20', fontWeight: 600 }}>My Orders</Link>
          <ChevronRight style={{ width: 14 }} />
          <span style={{ color: '#374151', fontWeight: 700 }}>#{order.orderNumber}</span>
        </div>

        {/* Header */}
        <div style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div>
              <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Order #{order.orderNumber}</h1>
              <p style={{ fontSize: 13, color: '#6B7280' }}>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <span style={{ background: statusInfo.bg, color: statusInfo.color, padding: '6px 16px', borderRadius: 99, fontWeight: 700, fontSize: 13 }}>
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Tracking */}
          {order.awbNumber && (
            <div style={{ background: '#E8F5E9', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1B5E20' }}>
                📦 AWB: {order.awbNumber}
                {order.trackingId && ` | Tracking: ${order.trackingId}`}
              </p>
            </div>
          )}

          {/* Progress Stepper */}
          {order.status !== 'CANCELLED' && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 16, left: 0, right: 0, height: 3, background: '#e5e7eb', zIndex: 0 }} />
                <div style={{ position: 'absolute', top: 16, left: 0, height: 3, background: '#1B5E20', zIndex: 1, width: `${Math.min(100, (currentStep / (steps.length - 1)) * 100)}%`, transition: 'width 0.5s ease', borderRadius: 99 }} />
                {steps.map((s, i) => (
                  <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 2, flex: 1 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: i <= currentStep ? '#1B5E20' : 'white', border: `3px solid ${i <= currentStep ? '#1B5E20' : '#e5e7eb'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                      {i < currentStep
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        : <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === currentStep ? 'white' : '#e5e7eb' }} />}
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: i <= currentStep ? '#1B5E20' : '#9CA3AF', textAlign: 'center', lineHeight: 1.2, maxWidth: 60 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Items */}
        <div style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Order Items ({order.items?.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {order.items?.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <img src={item.productImage || item.product?.images?.[0]?.url || '/placeholder.jpg'} alt={item.productName}
                  style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', border: '1px solid #e5e7eb', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{item.productName}</p>
                  {item.variantInfo && <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{item.variantInfo}</p>}
                  <p style={{ fontSize: 12, color: '#9CA3AF' }}>Qty: {item.quantity} × ₹{parseFloat(item.unitPrice).toLocaleString('en-IN')}</p>
                </div>
                <span style={{ fontWeight: 800, fontSize: 15, color: '#1B5E20' }}>₹{parseFloat(item.totalPrice).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown + Address side by side on desktop */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
          {/* Price */}
          <div style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Payment Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Subtotal', value: `₹${parseFloat(order.subtotal).toLocaleString('en-IN')}` },
                { label: 'Discount', value: `-₹${parseFloat(order.discountAmount).toLocaleString('en-IN')}`, green: true },
                { label: 'Shipping', value: parseFloat(order.shippingCharge) === 0 ? 'FREE' : `₹${order.shippingCharge}`, green: parseFloat(order.shippingCharge) === 0 },
                { label: 'GST (included)', value: `₹${parseFloat(order.gstAmount).toFixed(2)}`, small: true },
              ].map(({ label, value, green, small }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: small ? 12 : 13, color: small ? '#9CA3AF' : '#6B7280', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: small ? 12 : 13, fontWeight: 700, color: green ? '#16A34A' : '#1F2937' }}>{value}</span>
                </div>
              ))}
              <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'Sora', fontWeight: 800 }}>Total Paid</span>
                <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 18, color: '#1B5E20' }}>₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div style={{ marginTop: 14, padding: '10px 14px', background: '#f9fafb', borderRadius: 10, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>Payment Method</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</span>
            </div>
          </div>

          {/* Address */}
          <div style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Delivery Address</h2>
            {order.shippingAddress && (
              <div style={{ display: 'flex', gap: 12 }}>
                <MapPin style={{ width: 20, color: '#1B5E20', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{order.shippingAddress.name}</p>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7 }}>
                    {order.shippingAddress.line1}{order.shippingAddress.line2 ? ', ' + order.shippingAddress.line2 : ''}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: '#6B7280', fontSize: 13 }}>
                    <Phone style={{ width: 14 }} /> {order.shippingAddress.phone}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          {['PENDING', 'CONFIRMED'].includes(order.status) && (
            <button onClick={handleCancel} disabled={cancelling}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, border: '2px solid #DC2626', background: 'white', color: '#DC2626', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              <AlertCircle style={{ width: 16 }} /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
          <a href={`https://wa.me/9440658294?text=Hi, I need help with order #${order.orderNumber}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, border: '2px solid #25D366', background: 'white', color: '#25D366', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            💬 WhatsApp Support
          </a>
          <Link href="/orders" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, border: '2px solid #e5e7eb', background: 'white', color: '#374151', fontWeight: 700, fontSize: 14 }}>
            ← Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
}