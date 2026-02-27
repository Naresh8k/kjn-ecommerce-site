'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, Image,
  FileText, BarChart3, ChevronRight, Menu, X, LogOut,
  Layers, Zap, Bell, Settings, TrendingUp, ChevronDown
} from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  {
    label: 'Catalogue', icon: Package, children: [
      { label: 'Products', href: '/admin/products', icon: ShoppingBag },
      { label: 'Categories', href: '/admin/categories', icon: Layers },
      { label: 'Brands', href: '/admin/brands', icon: Zap },
    ]
  },
  {
    label: 'Sales', icon: TrendingUp, children: [
      { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
      { label: 'Coupons', href: '/admin/coupons', icon: Tag },
      { label: 'Revenue', href: '/admin/revenue', icon: BarChart3 },
    ]
  },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  {
    label: 'Content', icon: FileText, children: [
      { label: 'Banners', href: '/admin/banners', icon: Image },
      { label: 'Blogs', href: '/admin/blogs', icon: FileText },
    ]
  },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expanded, setExpanded] = useState({ Catalogue: true, Sales: true, Content: false });
  const [notifications, setNotifications] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    // Fetch low stock + pending orders count
    api.get('/admin/dashboard').then(r => {
      const d = r.data.data;
      setNotifications((d?.orders?.pending || 0) + (d?.products?.lowStock || 0));
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    toast.success('Logged out');
    router.push('/login');
  };

  const isActive = (href) => pathname === href;
  const isGroupActive = (children) => children?.some(c => pathname.startsWith(c.href));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0F1117', fontFamily: 'Nunito, sans-serif' }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 0,
        minHeight: '100vh',
        background: '#151820',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 200,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #1B5E20, #4CAF50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Sora', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>KJN</div>
            <div>
              <div style={{ color: 'white', fontFamily: 'Sora', fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>KJN Admin</div>
              <div style={{ color: '#4ade80', fontSize: 10, fontWeight: 600 }}>● Online</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {navItems.map((item) => {
            if (item.children) {
              const groupActive = isGroupActive(item.children);
              const isExpanded = expanded[item.label];
              return (
                <div key={item.label} style={{ marginBottom: 2 }}>
                  <button onClick={() => setExpanded(p => ({ ...p, [item.label]: !p[item.label] }))}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 8, border: 'none',
                      background: groupActive ? 'rgba(76,175,80,0.12)' : 'transparent',
                      color: groupActive ? '#4ade80' : '#9CA3AF',
                      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                    }}>
                    <item.icon style={{ width: 17, flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: 13, flex: 1 }}>{item.label}</span>
                    <ChevronDown style={{ width: 14, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  {isExpanded && (
                    <div style={{ marginLeft: 16, marginTop: 2, marginBottom: 4 }}>
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href}>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 12px', borderRadius: 8, marginBottom: 1,
                            background: isActive(child.href) ? 'rgba(76,175,80,0.15)' : 'transparent',
                            borderLeft: isActive(child.href) ? '2px solid #4ade80' : '2px solid transparent',
                            color: isActive(child.href) ? '#4ade80' : '#6B7280',
                            fontWeight: isActive(child.href) ? 700 : 600,
                            fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
                          }}
                            onMouseOver={e => { if (!isActive(child.href)) e.currentTarget.style.color = '#d1d5db'; }}
                            onMouseOut={e => { if (!isActive(child.href)) e.currentTarget.style.color = '#6B7280'; }}>
                            <child.icon style={{ width: 14, flexShrink: 0 }} />
                            {child.label}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link key={item.href} href={item.href}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                  background: isActive(item.href) ? 'rgba(76,175,80,0.15)' : 'transparent',
                  borderLeft: isActive(item.href) ? '3px solid #4ade80' : '3px solid transparent',
                  color: isActive(item.href) ? '#4ade80' : '#9CA3AF',
                  fontWeight: isActive(item.href) ? 700 : 600,
                  fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                }}
                  onMouseOver={e => { if (!isActive(item.href)) e.currentTarget.style.color = '#d1d5db'; }}
                  onMouseOut={e => { if (!isActive(item.href)) e.currentTarget.style.color = '#9CA3AF'; }}>
                  <item.icon style={{ width: 17, flexShrink: 0 }} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom user */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', marginBottom: 6 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#1B5E20,#4CAF50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
              {user?.name?.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: 'white', fontWeight: 700, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <p style={{ color: '#6B7280', fontSize: 10 }}>Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: '#6B7280', fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
            onMouseOut={e => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.background = 'transparent'; }}>
            <LogOut style={{ width: 14 }} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: sidebarOpen ? 240 : 0, transition: 'margin-left 0.3s ease', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <header style={{ height: 60, background: '#151820', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, position: 'sticky', top: 0, zIndex: 100, flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(p => !p)}
            style={{ width: 36, height: 36, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9CA3AF' }}>
            {sidebarOpen ? <X style={{ width: 18 }} /> : <Menu style={{ width: 18 }} />}
          </button>

          {/* Breadcrumb */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280' }}>
            <Link href="/admin" style={{ color: '#4ade80', fontWeight: 700 }}>Admin</Link>
            {pathname !== '/admin' && (
              <>
                <ChevronRight style={{ width: 14 }} />
                <span style={{ color: '#d1d5db', fontWeight: 600, textTransform: 'capitalize' }}>
                  {pathname.split('/').filter(Boolean).slice(1).join(' / ')}
                </span>
              </>
            )}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {notifications > 0 && (
              <div style={{ position: 'relative' }}>
                <Bell style={{ width: 20, color: '#9CA3AF' }} />
                <span style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: 'white', width: 16, height: 16, borderRadius: '50%', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{notifications > 9 ? '9+' : notifications}</span>
              </div>
            )}
            <Link href="/" target="_blank"
              style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(76,175,80,0.12)', color: '#4ade80', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
              View Store ↗
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '24px', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          aside { width: ${sidebarOpen ? '240px' : '0'} !important; }
        }
      `}</style>
    </div>
  );
}