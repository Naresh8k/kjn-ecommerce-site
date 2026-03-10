'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, ArrowLeft, CheckCheck, Package, CreditCard, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

const TYPE_CONFIG = {
  order_update: { icon: Package,    bg: 'bg-blue-50',   iconColor: 'text-blue-500',   label: 'Order'   },
  payment:      { icon: CreditCard, bg: 'bg-purple-50', iconColor: 'text-purple-500', label: 'Payment' },
  promo:        { icon: Gift,       bg: 'bg-amber-50',  iconColor: 'text-amber-500',  label: 'Offer'   },
  default:      { icon: Bell,       bg: 'bg-gray-100',  iconColor: 'text-gray-400',   label: ''        },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function NotificationsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    api.get('/user/notifications')
      .then((r) => setNotifications(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.put('/user/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
    finally { setMarkingAll(false); }
  };

  const markOneRead = async (id) => {
    const notif = notifications.find(n => n.id === id);
    if (!notif || notif.isRead) return;
    try {
      await api.put(`/user/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch { /* silent */ }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between" style={{ maxWidth: 640 }}>
          <div className="flex items-center gap-3">
            <Link href="/account"
              className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </Link>
            <div>
              <h1 className="font-heading font-extrabold text-lg text-gray-900 leading-tight flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </h1>
              {!loading && (
                <p className="text-[11px] text-gray-400 font-semibold">{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>

          {unreadCount > 0 && (
            <button onClick={markAllRead} disabled={markingAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-primary-900 text-primary-900 font-extrabold text-xs hover:bg-primary-50 transition-colors disabled:opacity-60">
              {markingAll
                ? <div className="w-3.5 h-3.5 border-2 border-primary-900 border-t-transparent rounded-full animate-spin" />
                : <CheckCheck className="w-3.5 h-3.5" />}
              Mark All Read
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 pt-5" style={{ maxWidth: 640 }}>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-gray-800 mb-2">No notifications yet</h3>
            <p className="text-sm text-gray-400 font-semibold">Order updates and alerts will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
              const Icon = cfg.icon;
              return (
                <div key={n.id}
                  onClick={() => markOneRead(n.id)}
                  className={`flex gap-3 items-start p-4 rounded-2xl border transition-all cursor-pointer group ${
                    n.isRead
                      ? 'bg-white border-gray-100 hover:border-gray-200'
                      : 'bg-primary-50 border-primary-100 hover:border-primary-200'
                  }`}>
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.isRead ? cfg.bg : 'bg-white'}`}>
                    <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-extrabold leading-tight ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</p>
                      <span className="text-[10px] text-gray-400 font-semibold flex-shrink-0">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-semibold mt-1 leading-relaxed">{n.message}</p>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary-900 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}