'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, ArrowLeft, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

export default function NotificationsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    api.get('/user/notifications').then((r) => setNotifications(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/user/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  const typeIcons = { order_update: '📦', payment: '💳', promo: '🎁', default: '🔔' };

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '24px 0 80px' }}>
      <div className="container" style={{ maxWidth: 640 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/account" style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft style={{ width: 16, color: '#374151' }} />
            </Link>
            <h1 style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 22 }}>Notifications</h1>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button onClick={markAllRead}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 99, border: '2px solid #1B5E20', background: 'transparent', color: '#1B5E20', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              <CheckCheck style={{ width: 14 }} /> Mark All Read
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16 }}>
            <Bell style={{ width: 48, height: 48, color: '#e5e7eb', margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 18 }}>No notifications yet</h3>
            <p style={{ color: '#6B7280', fontSize: 13, marginTop: 8 }}>Order updates and alerts will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifications.map((n) => (
              <div key={n.id} style={{ background: n.isRead ? 'white' : '#E8F5E9', borderRadius: 14, padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', border: n.isRead ? '1px solid #f3f4f6' : '1px solid #C8E6C9', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: n.isRead ? '#f3f4f6' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {typeIcons[n.type] || typeIcons.default}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 3, color: '#1F2937' }}>{n.title}</p>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{n.message}</p>
                  <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>{new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1B5E20', flexShrink: 0, marginTop: 4 }} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}