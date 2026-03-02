'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, Image,
  FileText, Menu, LogOut, Layers, Zap, Bell, TrendingUp, ChevronDown, Boxes
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
      { label: 'Collections', href: '/admin/collections', icon: Boxes },
    ]
  },
  {
    label: 'Sales', icon: TrendingUp, children: [
      { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
      { label: 'Coupons', href: '/admin/coupons', icon: Tag },
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
  const [expanded, setExpanded] = useState({ Catalogue: true, Sales: true, Content: true });
  const [notifications, setNotifications] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  useEffect(() => {
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 sticky top-0 h-screen overflow-hidden`}>
        {/* Logo & Toggle */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="font-heading font-extrabold text-2xl bg-gradient-to-r from-primary-900 to-primary-800 bg-clip-text text-transparent">
              KJN Admin
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            if (item.children) {
              const isExpanded = expanded[item.label];
              return (
                <div key={item.label} className="mb-2">
                  <button
                    onClick={() => setExpanded(prev => ({ ...prev, [item.label]: !prev[item.label] }))}
                    className="w-full px-3.5 py-2.5 rounded-xl hover:bg-gray-100 flex items-center gap-3 text-sm font-semibold text-gray-600 transition-colors"
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="flex-1 text-left">{item.label}</span>}
                    {sidebarOpen && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {isExpanded && sidebarOpen && (
                    <div className="pl-4 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                            isActive(child.href)
                              ? 'bg-primary-50 text-primary-900'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <child.icon className="w-4 h-4" />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl mb-1 text-sm font-semibold transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-900'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-900 to-primary-800 flex items-center justify-center text-white font-bold text-base">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 flex items-center justify-center gap-2 text-xs font-semibold text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-18 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="font-heading font-bold text-base text-gray-900">
              {navItems.find(item => item.href === pathname)?.label || 
               navItems.flatMap(item => item.children || []).find(child => child.href === pathname)?.label ||
               'Admin Panel'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
