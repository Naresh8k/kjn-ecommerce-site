'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

const statusColors = {
  PENDING: { bg: '#FFF8E1', color: '#F59E0B' },
  CONFIRMED: { bg: '#E8F5E9', color: '#16A34A' },
  PROCESSING: { bg: '#EFF6FF', color: '#2563EB' },
  SHIPPED: { bg: '#F0FDF4', color: '#059669' },
  OUT_FOR_DELIVERY: { bg: '#FFF7ED', color: '#EA580C' },
  DELIVERED: { bg: '#E8F5E9', color: '#1B5E20' },
  CANCELLED: { bg: '#FEF2F2', color: '#DC2626' },
  RETURNED: { bg: '#F5F3FF', color: '#7C3AED' },
  REFUNDED: { bg: '#F5F3FF', color: '#7C3AED' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    api.get('/orders').then((r) => setOrders(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #E8F5E9', borderTop: '4px solid #1B5E20', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '24px 0 80px' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Package style={{ width: 24, color: '#1B5E20' }} />
          <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 26 }}>My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>No orders yet</h3>
            <p style={{ color: '#6B7280', marginBottom: 24 }}>Start shopping and your orders will appear here</p>
            <Link href="/" className="btn btn-primary"><ShoppingBag style={{ width: 16 }} /> Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map((order) => {
              const statusStyle = statusColors[order.status] || { bg: '#f3f4f6', color: '#6B7280' };
              return (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s', cursor: 'pointer' }}
                    onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'}
                    onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 600, marginBottom: 2 }}>Order #{order.orderNumber}</p>
                        <p style={{ fontSize: 12, color: '#9CA3AF' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                          {order.status.replace('_', ' ')}
                        </span>
                        <ChevronRight style={{ width: 18, color: '#9CA3AF' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12, overflowX: 'auto' }}>
                      {order.items?.slice(0, 3).map((item) => (
                        <img key={item.id} src={item.productImage || item.product?.images?.[0]?.url || '/placeholder.jpg'} alt={item.productName}
                          style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', border: '1px solid #e5e7eb', flexShrink: 0 }} />
                      ))}
                      {order.items?.length > 3 && (
                        <div style={{ width: 56, height: 56, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#6B7280', flexShrink: 0 }}>
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: '#6B7280' }}>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</span>
                      <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 16, color: '#1B5E20' }}>₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}