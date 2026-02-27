'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, Users, Package, IndianRupee,
  TrendingUp, TrendingDown, AlertTriangle, Clock,
  CheckCircle, Truck, ArrowRight, BarChart2
} from 'lucide-react';
import api from '@/lib/api';

const StatCard = ({ title, value, sub, icon: Icon, color, trend, href }) => (
  <Link href={href || '#'}>
    <div style={{
      background: 'white', borderRadius: 16, padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s',
      cursor: href ? 'pointer' : 'default', border: '1px solid #f3f4f6',
    }}
      onMouseOver={e => { if (href) e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'; }}
      onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ width: 22, color }} />
        </div>
        {trend !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: trend >= 0 ? '#16A34A' : '#DC2626' }}>
            {trend >= 0 ? <TrendingUp style={{ width: 14 }} /> : <TrendingDown style={{ width: 14 }} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 26, color: '#1F2937', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{sub}</div>}
    </div>
  </Link>
);

const statusColors = {
  PENDING: '#F59E0B', CONFIRMED: '#16A34A', PROCESSING: '#2563EB',
  SHIPPED: '#059669', OUT_FOR_DELIVERY: '#EA580C', DELIVERED: '#1B5E20',
  CANCELLED: '#DC2626', RETURNED: '#7C3AED', REFUNDED: '#7C3AED',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setStats(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginBottom: 24 }}>
        {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 130, borderRadius: 16 }} />)}
      </div>
    </div>
  );

  const s = stats;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>Dashboard Overview</h2>
        <p style={{ color: '#6B7280', fontSize: 13 }}>Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard title="Total Revenue" value={`₹${(s?.revenue?.total || 0).toLocaleString('en-IN')}`} sub={`This month: ₹${(s?.revenue?.thisMonth || 0).toLocaleString('en-IN')}`} icon={IndianRupee} color="#1B5E20" trend={parseFloat(s?.revenue?.growthPercent || 0)} href="/admin/orders" />
        <StatCard title="Total Orders" value={s?.orders?.total || 0} sub={`Today: ${s?.orders?.today || 0} | Month: ${s?.orders?.thisMonth || 0}`} icon={ShoppingBag} color="#2563EB" href="/admin/orders" />
        <StatCard title="Customers" value={s?.users?.total || 0} sub={`New today: ${s?.users?.newToday || 0}`} icon={Users} color="#7C3AED" href="/admin/users" />
        <StatCard title="Products" value={s?.products?.total || 0} sub={`Low stock: ${s?.products?.lowStock || 0} items`} icon={Package} color="#EA580C" href="/admin/products" />
        <StatCard title="Pending Orders" value={s?.orders?.pending || 0} sub="Need attention" icon={Clock} color="#F59E0B" href="/admin/orders?status=PENDING" />
        <StatCard title="Processing" value={s?.orders?.processing || 0} sub="Being packed" icon={Truck} color="#059669" href="/admin/orders?status=PROCESSING" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        {/* Recent Orders */}
        <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16 }}>Recent Orders</h3>
            <Link href="/admin/orders" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#1B5E20', fontSize: 13, fontWeight: 700 }}>
              View All <ArrowRight style={{ width: 14 }} />
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                  {['Order #', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s?.recentOrders?.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f9fafb', transition: 'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 12px' }}>
                      <Link href={`/admin/orders`} style={{ fontWeight: 700, fontSize: 13, color: '#1B5E20' }}>#{order.orderNumber}</Link>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{order.user?.name}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF' }}>{order.user?.phone}</div>
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'Sora', fontWeight: 700, fontSize: 14, color: '#1B5E20' }}>
                      ₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: `${statusColors[order.status]}20`, color: statusColors[order.status], padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: 12, color: '#6B7280' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products + Low Stock */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
          {/* Top Products */}
          <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15 }}>🏆 Top Selling</h3>
              <BarChart2 style={{ width: 18, color: '#9CA3AF' }} />
            </div>
            {s?.topProducts?.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? '#FFF8E1' : i === 1 ? '#F1F5F9' : '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: i === 0 ? '#F59E0B' : i === 1 ? '#64748B' : '#9CA3AF', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</p>
                  <p style={{ fontSize: 11, color: '#9CA3AF' }}>{p.totalSold} sold</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1B5E20', flexShrink: 0 }}>₹{parseFloat(p.sellingPrice).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          {/* Low Stock */}
          <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15 }}>⚠️ Low Stock</h3>
              <Link href="/admin/products" style={{ fontSize: 12, color: '#1B5E20', fontWeight: 700 }}>Manage</Link>
            </div>
            <LowStockWidget />
          </div>
        </div>
      </div>
    </div>
  );
}

function LowStockWidget() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get('/admin/low-stock').then(r => setItems(r.data.data?.slice(0, 6) || [])).catch(() => {});
  }, []);

  return (
    <div>
      {items.length === 0
        ? <p style={{ color: '#6B7280', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>✅ All products well stocked!</p>
        : items.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</p>
              <p style={{ fontSize: 11, color: '#9CA3AF' }}>{p.category?.name}</p>
            </div>
            <span style={{ background: p.stockQuantity === 0 ? '#FEF2F2' : '#FFF8E1', color: p.stockQuantity === 0 ? '#DC2626' : '#F59E0B', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>
              {p.stockQuantity === 0 ? 'Out of Stock' : `${p.stockQuantity} left`}
            </span>
          </div>
        ))}
    </div>
  );
}