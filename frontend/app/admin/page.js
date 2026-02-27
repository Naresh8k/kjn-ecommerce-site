'use client';
import { useEffect, useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import api from '@/lib/api';

export default function AdminHome() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setStats(res.data.data))
      .catch(() => {});
  }, []);

  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 24, marginBottom: 16 }}>
        <LayoutDashboard style={{ width: 24, marginRight: 8, verticalAlign: 'middle' }} />
        Admin Dashboard
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 24 }}>
        <div style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <p style={{ fontSize: 14, color: '#6B7280' }}>Pending Orders</p>
          <p style={{ fontSize: 28, fontWeight: 700 }}>{stats.orders.pending}</p>
        </div>
        <div style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <p style={{ fontSize: 14, color: '#6B7280' }}>Low Stock Products</p>
          <p style={{ fontSize: 28, fontWeight: 700 }}>{stats.products.lowStock}</p>
        </div>
        <div style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <p style={{ fontSize: 14, color: '#6B7280' }}>Total Users</p>
          <p style={{ fontSize: 28, fontWeight: 700 }}>{stats.users.total || 0}</p>
        </div>
      </div>
    </div>
  );
}
